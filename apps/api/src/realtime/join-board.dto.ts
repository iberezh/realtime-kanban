import { IsHexColor, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class JoinBoardDto {
  @IsUUID()
  boardId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @IsHexColor()
  color!: string;
}

export class LeaveBoardDto {
  @IsUUID()
  boardId!: string;
}
