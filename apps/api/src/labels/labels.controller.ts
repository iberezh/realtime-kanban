import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthContext } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Label } from '../database/schema';
import { CreateLabelCommand, DeleteLabelCommand, RenameLabelCommand } from './label.commands';
import { CreateLabelDto, RenameLabelDto } from './label.dto';
import { ListLabelsQuery } from './label.queries';

@ApiTags('labels')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'The created label.' })
  create(@Body() dto: CreateLabelDto, @CurrentUser() ctx: AuthContext): Promise<Label> {
    return this.commandBus.execute(
      new CreateLabelCommand(ctx.accountId, ctx.userId, dto.name, dto.color),
    );
  }

  @Get()
  @ApiOkResponse({ description: "All labels for the caller's workspace." })
  list(@CurrentUser() ctx: AuthContext): Promise<Label[]> {
    return this.queryBus.execute(new ListLabelsQuery(ctx.accountId));
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'The renamed label.' })
  rename(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RenameLabelDto,
    @CurrentUser() ctx: AuthContext,
  ): Promise<Label> {
    return this.commandBus.execute(new RenameLabelCommand(id, ctx.accountId, ctx.userId, dto.name));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Label deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    return this.commandBus.execute(new DeleteLabelCommand(id, ctx.accountId, ctx.userId));
  }
}
