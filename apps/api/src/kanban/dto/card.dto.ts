import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z', nullable: true })
  @IsOptional()
  @IsISO8601({ strict: true })
  dueAt?: string | null;
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

export class AttachLabelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  labelId!: string;
}

export class SetAssigneeDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}
