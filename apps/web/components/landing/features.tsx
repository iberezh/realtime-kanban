'use client';

import { Icon } from '@iconify/react';
import styles from './landing.module.css';
import { Reveal } from './reveal';

const FEATURES = [
  {
    icon: 'solar:bolt-bold-duotone',
    bg: '#efeaff',
    color: '#7c5cff',
    title: 'Instant sync',
    body: 'Every move broadcasts in milliseconds over WebSockets. Drag here, it lands there — live.',
  },
  {
    icon: 'solar:eye-linear',
    bg: '#e4fbf3',
    color: '#1f9e85',
    title: 'Live presence',
    body: "See who's on the board and what they're touching, by avatar and color.",
  },
  {
    icon: 'solar:link-round-bold-duotone',
    bg: '#fff0e6',
    color: '#e0632a',
    title: 'Guest links',
    body: 'Share a read-only link. Clients and stakeholders watch progress live — no login.',
  },
  {
    icon: 'solar:shield-check-linear',
    bg: '#fff6e0',
    color: '#b07d1a',
    title: 'Conflict-safe',
    body: 'Two people dragging the same card? Fractional ranking keeps order intact for everyone.',
  },
];

export function Features() {
  return (
    <section className={`${styles.wrap} ${styles.band}`} id="features">
      <Reveal>
        <div className={styles.lead}>
          <span className={styles.eyebrow}>Built for live collaboration</span>
          <h2 className={styles.h2}>Everyone on the same board, at the same moment.</h2>
          <p className={styles.s}>
            No refresh, no “who has the latest?”. Lane is realtime to the core — the same engine
            that powers presence powers every drag.
          </p>
        </div>
      </Reveal>
      <div className={styles.features}>
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.06}>
            <div className={styles.feat}>
              <div className={styles.ficon} style={{ background: feature.bg }}>
                <Icon icon={feature.icon} width={24} height={24} color={feature.color} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
