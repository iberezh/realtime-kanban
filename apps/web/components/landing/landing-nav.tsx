import Link from 'next/link';
import styles from './landing.module.css';

export function LandingNav() {
  return (
    <nav className={styles.nav}>
      <div className={`${styles.wrap} ${styles.navIn}`}>
        <Link href="/" className={styles.brand}>
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
