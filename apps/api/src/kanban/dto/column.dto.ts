import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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
