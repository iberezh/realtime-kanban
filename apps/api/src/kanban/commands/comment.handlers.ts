import { randomUUID } from 'node:crypto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import { NotificationsRepository } from '../../notifications/notifications.repository';
import { CommentCreatedEvent, CommentDeletedEvent } from '../events/kanban.events';
import { BoardsRepository } from '../repositories/boards.repository';
import { CardsRepository } from '../repositories/cards.repository';
import type { CommentView } from '../repositories/comments.repository';
import { CommentsRepository } from '../repositories/comments.repository';
import { MembersRepository } from '../repositories/members.repository';
import { authorizeCardOnAccount } from './authorize-card';
import { CreateCommentCommand, DeleteCommentCommand } from './comment.commands';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand, CommentView> {
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly commentsRepo: CommentsRepository,
    private readonly members: MembersRepository,
    private readonly notificationsRepo: NotificationsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentView> {
    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      command.cardId,
      command.accountId,
    );

    const raw = await this.commentsRepo.create({
      cardId: command.cardId,
      authorId: command.userId,
      body: command.body,
    });

    const view = await this.commentsRepo.findViewById(raw.id);
    if (!view) throw new Error('Comment view not found after insert');

    this.eventBus.publish(new CommentCreatedEvent(boardId, command.cardId, view, command.userId));

    const snippet = command.body.slice(0, 140);
    await Promise.all(
      command.mentionedUserIds
        .filter((id) => id !== command.userId)
        .map(async (mentionedId) => {
          const isMember = await this.members.isMember(command.accountId, mentionedId);
          if (!isMember) return;
          await this.notificationsRepo.create({
            id: randomUUID(),
            userId: mentionedId,
            type: 'mention',
            data: {
              boardId,
              cardId: command.cardId,
              commentId: view.id,
              actorName: view.authorName,
              snippet,
            },
          });
        }),
    );

    return view;
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand, void> {
  constructor(
    private readonly cards: CardsRepository,
    private readonly boards: BoardsRepository,
    private readonly commentsRepo: CommentsRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepo.findById(command.commentId);
    if (!comment) throw new NotFoundException(`Comment ${command.commentId} not found`);

    const { boardId } = await authorizeCardOnAccount(
      this.cards,
      this.boards,
      comment.cardId,
      command.accountId,
    );

    if (comment.authorId !== command.userId) throw new ForbiddenException();

    await this.commentsRepo.delete(command.commentId);
    this.eventBus.publish(
      new CommentDeletedEvent(boardId, comment.cardId, command.commentId, command.userId),
    );
  }
}
