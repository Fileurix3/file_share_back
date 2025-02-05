import { BadRequestException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async register(authDto: AuthDto, res: Response) {
    if (!authDto.name) {
      throw new BadRequestException("Name is required");
    }

    const existingUser: UserEntity[] = await this.userRepository.find({
      where: [{ name: authDto.name }, { email: authDto.email }],
    });

    if (existingUser.length > 0) {
      throw new BadRequestException(
        "User with this name or email already exists",
      );
    }

    const hashPassword: string = await bcrypt.hash(authDto.password, 10);

    const newUser: UserEntity = this.userRepository.create({
      name: authDto.name,
      email: authDto.email,
      password: hashPassword,
    });

    await this.userRepository.save(newUser);

    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "10h",
      },
    );

    res.cookie("token", token, {
      maxAge: 10 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });

    return { message: "User has been successfully registered" };
  }

  async login(authDto: AuthDto, res: Response) {
    const user: UserEntity | null = await this.userRepository.findOne({
      where: {
        email: authDto.email,
      },
    });

    if (user == null) {
      throw new BadRequestException("Invalid email or password");
    }

    const hashPassword: boolean = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!hashPassword) {
      throw new BadRequestException("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "175h",
      },
    );

    res.cookie("token", token, {
      maxAge: 7 * 25 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });

    return { message: "Login has been successfully" };
  }

  async logout(res: Response) {
    res.clearCookie("registered");
    return { message: "logout successfully" };
  }
}
