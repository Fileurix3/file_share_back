import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @Post("/register")
  async register(@Body() authDto: AuthDto, @Res() res: Response) {
    const message = await this.authService.register(authDto, res);
    return res.status(201).json(message);
  }

  @UsePipes(ValidationPipe)
  @Post("/login")
  async login(@Body() authDto: AuthDto, @Res() res: Response) {
    const message = await this.authService.login(authDto, res);
    return res.status(200).json(message);
  }

  @Get("/logout")
  async logout(@Res() res: Response) {
    const message = await this.authService.logout(res);
    return res.status(200).json(message);
  }
}
