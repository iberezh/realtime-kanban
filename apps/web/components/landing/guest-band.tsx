'use client';

import { Icon } from '@iconify/react';
import { GuestBoard } from './guest-board';
import styles from './landing.module.css';
import { Reveal } from './reveal';

export function GuestBand() {
  return (
    <section className={`${styles.wrap} ${styles.band}`} id="guests">
      <Reveal>
        <div className={styles.guest}>
          <div>
            <span className={styles.eyebrow}>Guest links · Pro</span>
            <h2 className={styles.h2}>Share progress, not logins.</h2>
            <p className={styles.s}>
              Send a client a link and they watch the board update in real time — read-only, no
              account, nothing to install.
            </p>
            <div className={styles.shareRow}>
              <div className={styles.shareInput}>
                <Icon icon="solar:link-round-linear" width={15} height={15} />
                lane.app/share/q3-launch-7Fg2…
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
                Copy
              </button>
            </div>
          </div>
          <GuestBoard />
        </div>
      </Reveal>
    </section>
  );
}
