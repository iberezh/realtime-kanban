import demo from './demo.module.css';
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
              <div className={styles.shareInput}>🔗 lane.app/share/q3-launch-7Fg2…</div>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
                Copy
              </button>
            </div>
          </div>
          <div className={styles.guestBoard}>
            <span className={styles.roBadge}>read-only · live</span>
            <div className={demo.cols} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={demo.col}>
                <h4>Doing</h4>
                <div className={demo.kc}>
                  <span className={demo.chip} style={{ background: '#fff6e0', color: '#b07d1a' }}>
                    Build
                  </span>
                  Checkout v2
                  <div className={demo.foot}>
                    <span className={demo.miniAv} style={{ background: '#7c5cff' }}>
                      I
                    </span>
                    <span className={demo.key}>LNE-22</span>
                  </div>
                </div>
              </div>
              <div className={demo.col}>
                <h4>Done</h4>
                <div className={demo.kc}>
                  Pricing page
                  <div className={demo.foot}>
                    <span className={demo.miniAv} style={{ background: '#36c5a8' }}>
                      M
                    </span>
                    <span className={demo.key}>LNE-15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
