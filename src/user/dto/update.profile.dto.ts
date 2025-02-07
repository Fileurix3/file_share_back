import {
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((val) => val.newName != undefined)
  @MinLength(3, { message: "Name must not be less than 3 characters" })
  @MaxLength(30, { message: "Name length should not exceed 30 characters" })
  newName: string;

  @IsOptional()
  @ValidateIf((val) => val.newAvatarUrl != undefined)
  @IsUrl()
  newAvatarUrl: string;
}
