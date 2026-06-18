'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import styles from './landing.module.css';
import { LiveBoardDemo } from './live-board-demo';

const EASE = [0.22, 0.61, 0.36, 1] as const;
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <header className={`${styles.wrap} ${styles.hero}`}>
      <motion.div variants={container} initial={reduce ? false : 'hidden'} animate="show">
        <motion.span variants={item} className={styles.eyebrow}>
          <span className={styles.dot} />
          Realtime team boards
        </motion.span>
        <motion.h1 variants={item} className={styles.title}>
          Move work together, <span className={styles.hl}>in real time.</span>
        </motion.h1>
        <motion.p variants={item} className={styles.sub}>
          Drag a card and your whole team sees it move — instantly. Share a live link and clients
          watch progress, no account needed.
        </motion.p>
        <motion.div variants={item} className={styles.heroCta}>
          <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} href="/signup">
            Start free →
          </Link>
          <a className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`} href="#features">
            See it live
          </a>
        </motion.div>
        <motion.p variants={item} className={styles.heroNote}>
          Free forever for small teams · no credit card
        </motion.p>
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
      >
        <LiveBoardDemo />
      </motion.div>
    </header>
  );
}
