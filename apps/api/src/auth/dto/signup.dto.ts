import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret-pass', minLength: 8 })
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Alice' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  @MinLength(1)
  accountName!: string;
}
