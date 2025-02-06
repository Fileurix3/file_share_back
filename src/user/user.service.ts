import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ChangePasswordDto } from "./dot/change.password.dto";
import { Request } from "express";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateProfileDto } from "./dot/update.profile.dto";
import { RecipeEntity } from "../entities/recipe.entity";
import { S3Service } from "../s3/s3.service";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,

    private readonly s3Service: S3Service,
  ) {}

  async getUserProfileByName(userName: string) {
    const user: UserEntity | null = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.recipes", "recipes")
      .select([
        "user.id",
        "user.name",
        "user.avatar_url",
        "user.created_at",
        "recipes.id",
        "recipes.title",
        "recipes.difficulty",
        "recipes.category",
        "recipes.ingredients",
        "recipes.image",
        "recipes.cook_time",
        "recipes.cook_time_seconds",
      ])
      .where("user.name = :userName", { userName })
      .getOne();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getYourProfile(userToken: string) {
    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const user: UserEntity | null = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.recipes", "recipes")
      .select([
        "user.id",
        "user.name",
        "user.avatar_url",
        "user.created_at",
        "recipes.id",
        "recipes.title",
        "recipes.difficulty",
        "recipes.category",
        "recipes.ingredients",
        "recipes.image",
        "recipes.cook_time_seconds",
      ])
      .where("user.id = :userId", { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateUserProfile(
    updateProfileDto: UpdateProfileDto,
    userToken: string,
  ) {
    const { newName, newAvatarUrl } = updateProfileDto;
    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const updateFields: Record<string, any> = {};

    if (newName !== undefined) {
      updateFields.name = newName;
    }

    if (newAvatarUrl !== undefined) {
      updateFields.avatar_url = newAvatarUrl;
    }

    if (Object.keys(updateFields).length == 0) {
      throw new BadRequestException("At least one field must be updated");
    }

    await this.userRepository.update({ id: userId }, updateFields);

    return { message: "User profile has been successfully updated" };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userToken: string,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    if (oldPassword == newPassword) {
      throw new BadRequestException(
        "Old password and new password must be different",
      );
    }

    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const user: UserEntity | null = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new NotFoundException("User not found");
    }

    const oldPasswordIsEqualUserPassword: boolean = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!oldPasswordIsEqualUserPassword) {
      throw new BadRequestException(
        "Current password does not match your oldPassword",
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(
      { id: userId },
      { password: hashPassword },
    );

    return { message: "Password has been successfully updated" };
  }

  async deleteAccount(req: Request) {
    const { password } = req.body;
    const userToken = req.cookies.token;
    console.log("zxc123");

    if (!password) {
      throw new BadRequestException("Password is required");
    }

    const userId = (jwt.decode(userToken) as Record<string, string>).userId;

    const user: UserEntity | null = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new NotFoundException("User not found");
    }

    const hashPassword: boolean = await bcrypt.compare(password, user.password);

    if (!hashPassword) {
      throw new BadRequestException("Invalid password");
    }

    const userRecipes = await this.recipeRepository.find({
      where: {
        creator_id: userId,
      },
      select: ["id", "image"],
    });

    const imagesName = userRecipes.map((val) => {
      const imageName = val.image.split(/\//);
      return imageName[imageName.length - 1];
    });

    for (let i = 0; i < imagesName.length; i++) {
      await this.s3Service.deleteFile(imagesName[i]);
    }

    await this.userRepository.delete({ id: userId });

    return { message: "Account has been successfully deleted" };
  }
}
