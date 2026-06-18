import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddChecklistItemDto {
  @ApiProperty({ example: 'Write the migration', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text!: string;
}

export class UpdateChecklistItemDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
