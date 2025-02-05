import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserEntity } from "./entities/user.entity";
import { RecipeModule } from "./recipe/recipe.module";
import { RecipeEntity } from "./entities/recipe.entity";
import { S3Service } from "./s3/s3.service";
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [UserEntity, RecipeEntity],
    }),
    AuthModule,
    RecipeModule,
    UserModule,
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class AppModule {}
