import { Features } from '@/components/landing/features';
import { FinalCta } from '@/components/landing/final-cta';
import { GuestBand } from '@/components/landing/guest-band';
import { Hero } from '@/components/landing/hero';
import styles from '@/components/landing/landing.module.css';
import { LandingNav } from '@/components/landing/landing-nav';
import { PricingTable } from '@/components/landing/pricing-table';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <GuestBand />
        <PricingTable />
        <FinalCta />
      </main>
    </div>
  );
}
