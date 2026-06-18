import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Direction B — violet primary anchored on #7c5cff (shade 6).
const violet: MantineColorsTuple = [
  '#f4f0ff',
  '#e5dcff',
  '#c8b6ff',
  '#aa8fff',
  '#9070ff',
  '#815dff',
  '#7c5cff',
  '#6a49e6',
  '#5e40cc',
  '#4f33b3',
];

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: 6,
  colors: { violet },
  defaultRadius: 'md',
  fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
  fontFamilyMonospace: 'var(--font-mono), ui-monospace, monospace',
  headings: { fontFamily: 'var(--font-jakarta), system-ui, sans-serif', fontWeight: '800' },
});
