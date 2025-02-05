import { BadRequestException, Injectable } from "@nestjs/common";
import { ChangePasswordDto } from "./dot/change.password.dto";
import { Repository, UpdateQueryBuilder } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { UpdateProfileDto } from "./dot/update.profile.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      throw new BadRequestException("User not found");
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
      throw new BadRequestException("User not found");
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
      throw new BadRequestException("User not found");
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
}
