import { Suspense } from 'react';
import { BoardScreen } from '@/components/board-screen';

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <BoardScreen boardId={id} />
    </Suspense>
  );
}
