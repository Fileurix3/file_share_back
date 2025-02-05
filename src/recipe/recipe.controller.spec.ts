import { Test, TestingModule } from "@nestjs/testing";
import { RecipeController } from "./recipe.controller";
import { RecipeService } from "./recipe.service";
import { Request } from "express";
import { RecipeDto } from "./dto/recipe.dto";
import { RecipeQueryDto } from "./dto/recipe.query.dto";
import { Readable } from "stream";

describe("RecipeController", () => {
  let recipeController: RecipeController;
  let recipeService: RecipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useValue: {
            getRecipeById: jest.fn(),
            searchRecipe: jest.fn(),
            createRecipe: jest.fn(),
            deleteRecipe: jest.fn(),
          },
        },
      ],
    }).compile();

    recipeController = module.get<RecipeController>(RecipeController);
    recipeService = module.get<RecipeService>(RecipeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET /recipe/get/:recipeId - must call the RecipeService getRecipeById method and return correct data", async () => {
    const recipeId = "1";
    const result = {
      id: recipeId,
      title: "Test Recipe",
      description: "Test Recipe description",
      steps: ["step 1", "step 2"],
      ingredients: ["ingredients1", "ingredients2"],
      category: "Lunch",
      difficulty: "Easy",
      cook_time: "10m",
      image: "image",
    };

    jest
      .spyOn(recipeService, "getRecipeById")
      .mockResolvedValueOnce(result as any);

    const response = await recipeController.getRecipeById(recipeId);

    expect(recipeService.getRecipeById).toHaveBeenCalledWith(recipeId);
    expect(response).toEqual(result);
  });

  it("GET /recipe/search?category=Dessert&limit=10&offset=0 -  must call the RecipeService searchRecipe method and return correct data", async () => {
    const query: RecipeQueryDto = { category: "Dessert", limit: 10, offset: 0 };
    const result = { currentPage: 1, totalPages: 1, recipes: [] };

    jest
      .spyOn(recipeService, "searchRecipe")
      .mockResolvedValueOnce(result as any);

    const response = await recipeController.searchRecipe(query);

    expect(recipeService.searchRecipe).toHaveBeenCalledWith(query);
    expect(response).toEqual(result);
  });

  it("POST /recipe/create - must call the RecipeService createRecipe method and return correct data", async () => {
    const recipeDto: RecipeDto = {
      title: "New Recipe",
      description: "Delicious new recipe",
      steps: ["Step 1", "Step 2"],
      ingredients: ["Ingredient 1", "Ingredient 2"],
      cookTime: "30m",
      category: "Main Course",
      difficulty: "Easy",
    };

    const image: Express.Multer.File = {
      buffer: Buffer.from(""),
      fieldname: "",
      originalname: "",
      encoding: "",
      mimetype: "",
      size: 0,
      stream: new Readable(),
      destination: "",
      filename: "",
      path: "",
    };

    const req = {
      cookies: { token: "test-token" },
    } as unknown as Request;

    const result = { message: "Recipe has been successfully created" };

    jest
      .spyOn(recipeService, "createRecipe")
      .mockResolvedValueOnce(result as any);

    const response = await recipeController.createRecipe(image, recipeDto, req);

    expect(recipeService.createRecipe).toHaveBeenCalledWith(
      recipeDto,
      image,
      req.cookies.token,
    );
    expect(response).toEqual(result);
  });

  it("DELETE /recipe/delete/:recipeId - must call the RecipeService deleteRecipe method and return correct data", async () => {
    const recipeId = "1";

    const req = {
      cookies: { token: "test-token" },
    } as unknown as Request;

    const result = { message: "Recipe has been successfully deleted" };

    jest
      .spyOn(recipeService, "deleteRecipe")
      .mockResolvedValueOnce(result as any);

    const response = await recipeController.deleteRecipe(recipeId, req);

    expect(recipeService.deleteRecipe).toHaveBeenCalledWith(
      recipeId,
      req.cookies.token,
    );

    expect(response).toEqual(result);
  });
});
