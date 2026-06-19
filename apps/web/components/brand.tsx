import { Anchor, Box, Group, Text } from '@mantine/core';
import Link from 'next/link';

interface BrandProps {
  size?: number;
  href?: string;
}

/** The Lane wordmark: a rotated violet→pink tile + name. Links home by default. */
export function Brand({ size = 28, href = '/' }: BrandProps) {
  return (
    <Anchor
      component={Link}
      href={href}
      underline="never"
      c="inherit"
      style={{ width: 'fit-content' }}
    >
      <Group gap={10} align="center">
        <Box
          w={size}
          h={size}
          style={{
            borderRadius: 9,
            background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: Math.round(size * 0.56),
            transform: 'rotate(-6deg)',
          }}
        >
          L
        </Box>
        <Text fw={800} fz={Math.round(size * 0.82)} style={{ letterSpacing: '-0.02em' }}>
          Lane
        </Text>
      </Group>
    </Anchor>
  );
}
