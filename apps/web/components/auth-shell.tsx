'use client';

import { Center, Container } from '@mantine/core';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Brand } from './brand';

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** Centered, animated shell for the auth pages: the brand mark fading in above the form card. */
export function AuthShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <Container size={420} py={80}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <Center mb="lg">
          <Brand size={32} />
        </Center>
        {children}
      </motion.div>
    </Container>
  );
}
