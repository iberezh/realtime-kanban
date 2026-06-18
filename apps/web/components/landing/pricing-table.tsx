import Link from 'next/link';
import styles from './landing.module.css';
import { Reveal } from './reveal';

interface Tier {
  name: string;
  price: string;
  per?: boolean;
  featured?: boolean;
  features: string[];
  cta: string;
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    features: ['1 board', '2 members', 'Realtime sync & presence', '1-day activity history'],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: '$19',
    per: true,
    featured: true,
    features: ['3 boards', '10 members', 'Guest share links', '14-day history', 'Custom labels'],
    cta: 'Start Pro',
  },
  {
    name: 'Business',
    price: '$49',
    per: true,
    features: ['Unlimited boards', 'Unlimited members', 'Guest links', 'Unlimited history'],
    cta: 'Start Business',
  },
];

export function PricingTable() {
  return (
    <section className={`${styles.wrap} ${styles.band}`} id="pricing">
      <Reveal>
        <div className={styles.lead}>
          <span className={styles.eyebrow}>Pricing</span>
          <h2 className={styles.h2}>Start free. Upgrade when your team grows.</h2>
        </div>
      </Reveal>
      <div className={styles.prices}>
        {TIERS.map((tier) => (
          <Reveal key={tier.name}>
            <div className={`${styles.price} ${tier.featured ? styles.featPlan : ''}`}>
              {tier.featured && <span className={styles.tagpop}>Most popular</span>}
              <div className={styles.pn}>{tier.name}</div>
              <div className={styles.amt}>
                {tier.price}
                {tier.per && <small> /mo</small>}
              </div>
              <ul className={styles.priceList}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className={styles.ck}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`${styles.btn} ${styles.priceBtn} ${tier.featured ? styles.btnPrimary : styles.btnOutline}`}
              >
                {tier.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
