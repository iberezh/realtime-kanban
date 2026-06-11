import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'Fix login flow', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Repro steps in the linked issue.', maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class UpdateCardDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class MoveCardDto {
  @ApiProperty({ description: 'Target column.', format: 'uuid' })
  @IsUUID()
  toColumnId!: string;

  @ApiPropertyOptional({
    description: 'Card to place this one before. Omit to place at the end of the column.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  beforeCardId?: string;
}
