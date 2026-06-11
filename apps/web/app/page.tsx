import { Badge, Container, List, ListItem, Stack, Text, Title } from '@mantine/core';

export default function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Badge variant="light" w="fit-content">
          under construction
        </Badge>
        <Title order={1}>Realtime Kanban</Title>
        <Text c="dimmed">
          A collaborative board where everyone sees everyone else&apos;s moves live. The backend
          (CQRS, fractional ranking, REST + Swagger) is up — the board UI lands next.
        </Text>
        <List>
          <ListItem>Boards, columns and cards over a CQRS write path</ListItem>
          <ListItem>Conflict-safe ordering with fractional ranks</ListItem>
          <ListItem>Realtime sync and presence — coming in the next phase</ListItem>
        </List>
      </Stack>
    </Container>
  );
}
