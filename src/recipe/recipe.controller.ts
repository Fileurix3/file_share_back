import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { RecipeService } from "./recipe.service";
import { RecipeDto } from "./dto/recipe.dto";
import { AuthGuard } from "../guards/auth.guard";
import { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import { RecipeQueryDto } from "./dto/recipe.query.dto";

@Controller("recipe")
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get("get/:recipeId")
  getRecipeById(@Param("recipeId") recipeId: string) {
    return this.recipeService.getRecipeById(recipeId);
  }

  @UsePipes(ValidationPipe)
  @Get("search")
  searchRecipe(@Query() query: RecipeQueryDto) {
    return this.recipeService.searchRecipe(query);
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Post("create")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: multer.memoryStorage(),
    }),
  )
  createRecipe(
    @UploadedFile() image: Express.Multer.File,
    @Body() recipeDto: RecipeDto,
    @Req() req: Request,
  ) {
    const userToken = req.cookies.token;
    return this.recipeService.createRecipe(recipeDto, image, userToken);
  }

  @UseGuards(AuthGuard)
  @Delete("delete/:recipeId")
  deleteRecipe(@Param("recipeId") recipeId: string, @Req() req: Request) {
    const userToken = req.cookies.token;
    return this.recipeService.deleteRecipe(recipeId, userToken);
  }
}
