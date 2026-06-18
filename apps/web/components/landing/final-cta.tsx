import Link from 'next/link';
import styles from './landing.module.css';
import { Reveal } from './reveal';

export function FinalCta() {
  return (
    <>
      <section className={`${styles.wrap} ${styles.final}`}>
        <Reveal>
          <h2 className={styles.h2}>Get your team on the same board.</h2>
          <p>Free for small teams. One link to invite everyone.</p>
          <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`} href="/signup">
            Start free →
          </Link>
        </Reveal>
      </section>
      <footer className={`${styles.wrap} ${styles.footer}`}>
        <span className={styles.logo}>L</span>
        <span style={{ color: 'var(--ink)', fontWeight: 700 }}>Lane</span> · Realtime team boards ·
        © 2026
      </footer>
    </>
  );
}
