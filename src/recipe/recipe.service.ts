import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { RecipeDto } from "./dto/recipe.dto";
import { S3Service } from "../s3/s3.service";
import { Repository, SelectQueryBuilder } from "typeorm";
import { RecipeEntity } from "../entities/recipe.entity";
import * as jwt from "jsonwebtoken";
import { InjectRepository } from "@nestjs/typeorm";
import { RecipeQueryDto } from "./dto/recipe.query.dto";

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,
    private readonly s3Service: S3Service,
  ) {}

  async getRecipeById(recipeId: string) {
    const recipe: RecipeEntity | null = await this.recipeRepository
      .createQueryBuilder("recipe")
      .leftJoin("recipe.creator", "creator")
      .select([
        "recipe.id",
        "recipe.title",
        "recipe.description",
        "recipe.steps",
        "recipe.ingredients",
        "recipe.cook_time_seconds",
        "recipe.cook_time",
        "recipe.category",
        "recipe.difficulty",
        "recipe.image",
        "recipe.created_at",
      ])
      .addSelect(["creator.id", "creator.name", "creator.avatar_url"])
      .where("recipe.id = :recipeId", { recipeId })
      .getOne();

    if (recipe == null) {
      throw new BadRequestException("Recipe not found");
    }

    return recipe;
  }

  async searchRecipe(query: RecipeQueryDto) {
    const {
      category,
      difficulty,
      ingredients,
      maxCookTime,
      minCookTime,
      limit,
      offset,
    } = query;

    if (
      (maxCookTime != undefined && minCookTime == undefined) ||
      (minCookTime != undefined && maxCookTime == undefined)
    ) {
      throw new BadRequestException(
        "If the maxCookTime or minCookTime field is specified, then the other field must also be specified",
      );
    }

    const queryBuilder: SelectQueryBuilder<RecipeEntity> =
      this.recipeRepository.createQueryBuilder("recipe");

    if (maxCookTime && minCookTime) {
      const maxCookTimeToSeconds = maxCookTime
        ? this.parseTimeToSeconds(maxCookTime)
        : 0;
      const minCookTimeToSeconds = minCookTime
        ? this.parseTimeToSeconds(minCookTime)
        : 0;

      queryBuilder.andWhere(
        "recipe.cook_time_seconds BETWEEN :minCookTime AND :maxCookTime",
        {
          minCookTime: minCookTimeToSeconds,
          maxCookTime: maxCookTimeToSeconds,
        },
      );
    }

    if (category) {
      queryBuilder.andWhere("recipe.category = :category", { category });
    }

    if (difficulty) {
      queryBuilder.andWhere("recipe.difficulty = :difficulty", { difficulty });
    }

    if (ingredients) {
      const ingredientsArray = ingredients.split(/\s+/);

      queryBuilder.andWhere("recipe.ingredients @> :ingredientsArray", {
        ingredientsArray: `{${ingredientsArray.join(",")}}`,
      });
    }

    const [recipes, totalCount] = await queryBuilder
      .limit(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      currentPage: offset + 1,
      totalPages: Math.ceil(totalCount / limit),
      recipes: recipes,
    };
  }

  async createRecipe(
    recipeDto: RecipeDto,
    image: Express.Multer.File,
    userToken: string,
  ) {
    this.validateImage(image);

    const cookTimeSeconds = this.parseTimeToSeconds(recipeDto.cookTime);
    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const uploadImageUrl = await this.s3Service.uploadFileInRecipeBucket(image);

    const addRecipe = this.recipeRepository.create({
      creator_id: userId,
      title: recipeDto.title,
      description: recipeDto.description,
      steps: recipeDto.steps,
      ingredients: recipeDto.ingredients,
      cook_time_seconds: cookTimeSeconds,
      cook_time: recipeDto.cookTime,
      category: recipeDto.category,
      difficulty: recipeDto.difficulty,
      image: uploadImageUrl,
    });

    await this.recipeRepository.save(addRecipe);

    return {
      message: "Recipe has been successfully created",
    };
  }

  async deleteRecipe(recipeId: string, userToken: string) {
    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const recipe: RecipeEntity | null = await this.recipeRepository.findOne({
      where: {
        id: recipeId,
      },
    });

    if (recipe == null) {
      throw new BadRequestException("Recipe not found");
    } else if (recipe.creator_id != userId) {
      throw new ForbiddenException("Only the creator can delete this recipe");
    }

    const image = recipe.image.split(/\//);
    const imageName = image[image.length - 1];

    await this.s3Service.deleteFile(imageName);

    await this.recipeRepository.delete({ id: recipeId });

    return {
      message: "Recipe has been successfully deleted",
    };
  }

  private parseTimeToSeconds(timeStr: string) {
    const match = timeStr.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new BadRequestException("Invalid time format");
    }

    const value: number = parseInt(match[1], 10);
    const timeFormat = match[2];

    const formats: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * formats[timeFormat];
  }

  private validateImage(image: Express.Multer.File): void {
    const fileException = image.originalname.split(/\./)[1];
    if (
      fileException != "png" &&
      fileException != "jpg" &&
      fileException != "jpeg"
    ) {
      throw new BadRequestException("Invalid image exception");
    }
  }
}
