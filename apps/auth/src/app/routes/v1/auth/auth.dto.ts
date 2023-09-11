import { ApiProperty } from '@nestjs/swagger';
import { RegExValidation } from '@libs/types/base.dto';
import { BadRequestExceptionMessage } from '@libs/utils';
import { IsEmail, IsString, IsUUID, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(RegExValidation.CHARACTERS_WITH_NUMBERS_AND_SYMBOLS_REQUIRED, {
    message: BadRequestExceptionMessage.PASSWORD_IS_NOT_VALID,
  })
  password: string;
}

export class TokenDto {
  @ApiProperty()
  @IsUUID()
  token: string;
}

export class SignInDto extends SignUpDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class SignEmailDto extends SignUpDto {}

export class EmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class PasswordRecoveryDto extends EmailDto {}

export class PasswordRecoveryConfirmDto {
  @ApiProperty()
  @IsString()
  @Matches(RegExValidation.CHARACTERS_WITH_NUMBERS_AND_SYMBOLS_REQUIRED, {
    message: BadRequestExceptionMessage.PASSWORD_IS_NOT_VALID,
  })
  password: string;
}

export class SignUpResendDto extends EmailDto {}
