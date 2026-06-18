import { Container, Text, Title } from '@mantine/core';
import { BoardList } from '@/components/board-list';
import { TopBar } from '@/components/top-bar';

export default function AppPage() {
  return (
    <>
      <TopBar />
      <Container size="md" py="xl">
        <Title order={1} mb={4}>
          Your boards
        </Title>
        <Text c="dimmed" mb="xl">
          Open a board in two windows and watch them stay in sync.
        </Text>
        <BoardList />
      </Container>
    </>
  );
}
