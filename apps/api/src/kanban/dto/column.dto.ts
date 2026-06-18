import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'In progress', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;
}

export class RenameColumnDto {
  @ApiProperty({ example: 'Done', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;
}

export class MoveColumnDto {
  @ApiPropertyOptional({
    description: 'Column to place this one before. Omit to place at the end of the board.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  beforeColumnId?: string;
}

export class SetWipLimitDto {
  @ApiPropertyOptional({
    description: 'Max cards before the column flags over-limit. Null clears.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  wipLimit?: number | null;
}
