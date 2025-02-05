import { IsOptional, IsString, IsInt, Max, Min, IsIn } from "class-validator";

export class RecipeQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(["Breakfast", "Lunch", "Dinner", "Dessert"], {
    message: "Category must be one of: Breakfast, Lunch, Dinner, Dessert",
  })
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(["Easy", "Normal", "Hard"], {
    message: "Difficulty must be one of: Easy, Normal, Hard",
  })
  difficulty?: string;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  maxCookTime?: string;

  @IsOptional()
  @IsString()
  minCookTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number = 0;
}
