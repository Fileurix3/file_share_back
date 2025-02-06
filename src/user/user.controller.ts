import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { AuthGuard } from "../guards/auth.guard";
import { ChangePasswordDto } from "./dot/change.password.dto";
import { UpdateProfileDto } from "./dot/update.profile.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile/:userName")
  async getUserProfileByName(@Param("userName") userName: string) {
    const message = await this.userService.getUserProfileByName(userName);
    return message;
  }

  @UseGuards(AuthGuard)
  @Get("profile")
  async getYourProfile(@Req() req: Request) {
    const userToken = req.cookies.token;
    const message = await this.userService.getYourProfile(userToken);
    return message;
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put("update/profile")
  async updateUserProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const userToken = req.cookies.token;
    const message = await this.userService.updateUserProfile(
      updateProfileDto,
      userToken,
    );
    return message;
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put("change/password")
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const userToken = req.cookies.token;
    const message = await this.userService.changePassword(
      changePasswordDto,
      userToken,
    );
    return message;
  }

  @UseGuards(AuthGuard)
  @Delete("delete/account")
  async deleteAccount(@Req() req: Request) {
    const message = await this.userService.deleteAccount(req);
    return message;
  }
}
