import { Container, Text, Title } from '@mantine/core';
import { BoardList } from '@/components/board-list';

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb={4}>
        Realtime Kanban
      </Title>
      <Text c="dimmed" mb="xl">
        Open a board in two windows and watch them stay in sync.
      </Text>
      <BoardList />
    </Container>
  );
}
