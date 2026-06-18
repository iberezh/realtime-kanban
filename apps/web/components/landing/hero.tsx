import Link from 'next/link';
import styles from './landing.module.css';
import { LiveBoardDemo } from './live-board-demo';

export function Hero() {
  return (
    <header className={`${styles.wrap} ${styles.hero}`}>
      <div>
        <span className={styles.eyebrow}>
          <span className={styles.dot} />
          Realtime team boards
        </span>
        <h1 className={styles.title}>
          Move work together, <span className={styles.hl}>in real time.</span>
        </h1>
        <p className={styles.sub}>
          Drag a card and your whole team sees it move — instantly. Share a live link and clients
          watch progress, no account needed.
        </p>
        <div className={styles.heroCta}>
          <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} href="/signup">
            Start free →
          </Link>
          <a className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`} href="#features">
            See it live
          </a>
        </div>
        <p className={styles.heroNote}>Free forever for small teams · no credit card</p>
      </div>
      <LiveBoardDemo />
    </header>
  );
}
