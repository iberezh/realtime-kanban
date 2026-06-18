import type { Label } from '../database/schema';
import type { BoardView } from '../kanban/queries/board.views';

/** A board resolved for a guest: the live board plus the labels its cards reference. */
export interface SharedBoardView extends BoardView {
  labels: Label[];
}
