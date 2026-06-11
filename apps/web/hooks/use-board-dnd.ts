'use client';

import {
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { moveCard, moveColumn } from '@/lib/api';
import type { Card, Column } from '@/lib/types';
import { useBoardStore } from '@/stores/board-store';
import { predictCardMove, predictColumnMove } from '@/stores/predict-move';

export interface DragState {
  card: Card | null;
  column: Column | null;
}

interface DropTarget {
  toId: string;
  beforeId: string | null;
}

/** "Drop on item X" → "place before X" — or after it when dragging down within the same list. */
function resolveBefore(orderedIds: string[], activeId: string, overId: string): string | null {
  const activeIndex = orderedIds.indexOf(activeId);
  const overIndex = orderedIds.indexOf(overId);
  if (activeIndex !== -1 && activeIndex < overIndex) {
    return orderedIds[overIndex + 1] ?? null;
  }
  return overId;
}

export function useBoardDnd(boardId: string): {
  sensors: ReturnType<typeof useSensors>;
  dragging: DragState;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
} {
  // distance > 0 keeps plain clicks working (e.g. opening the card modal)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [dragging, setDragging] = useState<DragState>({ card: null, column: null });

  const onDragStart = (event: DragStartEvent): void => {
    const data = event.active.data.current as { card?: Card; column?: Column } | undefined;
    setDragging({ card: data?.card ?? null, column: data?.column ?? null });
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const wasDraggingColumn = dragging.column !== null;
    setDragging({ card: null, column: null });
    const { active, over } = event;
    const view = useBoardStore.getState().view;
    if (!over || !view || active.id === over.id) {
      return;
    }

    const overData = over.data.current as { card?: Card; column?: Column } | undefined;
    const { apply, restore } = useBoardStore.getState();

    if (wasDraggingColumn) {
      const ids = view.columns.map((column) => column.id);
      const beforeId = resolveBefore(ids, String(active.id), String(over.id));
      const predicted = predictColumnMove(view, String(active.id), beforeId);
      if (!predicted || predicted.rank === dragging.column?.rank) {
        return;
      }
      apply({ type: 'column.moved', boardId, column: predicted });
      moveColumn(predicted.id, beforeId ?? undefined).catch(() => restore(view));
      return;
    }

    const target: DropTarget = overData?.card
      ? { toId: overData.card.columnId, beforeId: null }
      : { toId: String(over.id), beforeId: null };
    const targetColumn = view.columns.find((column) => column.id === target.toId);
    if (!targetColumn) {
      return;
    }
    if (overData?.card) {
      const ids = targetColumn.cards.map((card) => card.id);
      target.beforeId = resolveBefore(ids, String(active.id), overData.card.id);
    }

    const predicted = predictCardMove(view, String(active.id), target.toId, target.beforeId);
    if (!predicted) {
      return;
    }
    apply({ type: 'card.moved', boardId, card: predicted });
    moveCard(predicted.id, target.toId, target.beforeId ?? undefined).catch(() => restore(view));
  };

  return { sensors, dragging, onDragStart, onDragEnd };
}
