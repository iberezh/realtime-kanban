'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import styles from './landing.module.css';

export function LandingNav() {
  // The logo is "home" on the landing page itself, so glide to the top instead of hard-jumping.
  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (window.location.pathname !== '/') {
      return;
    }
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <nav className={styles.nav}>
      <div className={`${styles.wrap} ${styles.navIn}`}>
        <Link href="/" className={styles.brand} onClick={scrollToTop}>
          <span className={styles.logo}>L</span>Lane
        </Link>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#guests">Guests</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className={styles.navCta}>
          <Link className={`${styles.btn} ${styles.btnGhost}`} href="/login">
            Log in
          </Link>
          <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/signup">
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
