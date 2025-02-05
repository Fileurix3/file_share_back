import { IsArray, IsIn, IsNotEmpty, IsString } from "class-validator";

export class RecipeDto {
  @IsNotEmpty({ message: "Title is required" })
  @IsString()
  title: string;

  @IsNotEmpty({ message: "Description is required" })
  @IsString()
  description: string;

  @IsNotEmpty({ message: "Steps is required" })
  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsNotEmpty({ message: "Ingredients is required" })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @IsNotEmpty({ message: "Cook_time is required" })
  cookTime: string;

  @IsNotEmpty({ message: "category is required" })
  @IsIn(["Breakfast", "Lunch", "Dinner", "Dessert"], {
    message: "Category must be one of: Breakfast, Lunch, Dinner, Dessert",
  })
  category: string;

  @IsNotEmpty({ message: "difficulty is required" })
  @IsIn(["Easy", "Normal", "Hard"], {
    message: "Difficulty must be one of: Easy, Normal, Hard",
  })
  difficulty: string;
}
