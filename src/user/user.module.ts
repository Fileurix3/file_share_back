import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { RecipeEntity } from "src/entities/recipe.entity";
import { S3Service } from "src/s3/s3.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RecipeEntity])],
  controllers: [UserController],
  providers: [UserService, S3Service],
})
export class UserModule {}
