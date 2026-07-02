'use client';

import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { GuestBoard } from './guest-board';
import styles from './landing.module.css';
import { Reveal } from './reveal';

const DEMO_LINK = 'lane.app/share/q3-launch-7Fg2';

export function GuestBand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = (): void => {
    navigator.clipboard?.writeText(DEMO_LINK).catch(() => undefined);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

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
              <button
                type="button"
                onClick={copy}
                className={`${styles.btn} ${styles.btnPrimary} ${copied ? styles.copied : ''}`}
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>
          <GuestBoard />
        </div>
      </Reveal>
    </section>
  );
}
