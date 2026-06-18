import demo from './demo.module.css';

const Cursor = ({ cls, color, name }: { cls: string | undefined; color: string; name: string }) => (
  <div className={`${demo.cursor} ${cls}`}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M5 3l15 9-7 1.5L9 21z" />
    </svg>
    <span className={demo.tag} style={{ background: color }}>
      {name}
    </span>
  </div>
);

/** Self-playing board: a card lifts out of Doing and lands in Done while cursors roam. */
export function LiveBoardDemo() {
  return (
    <div className={demo.demo} aria-hidden="true">
      <div className={demo.bar}>
        <span className={demo.ttl}>Q3 Launch</span>
        <span className={demo.avatars}>
          <span style={{ background: '#7c5cff' }}>I</span>
          <span style={{ background: '#36c5a8' }}>M</span>
          <span style={{ background: '#ff6b9d' }}>A</span>
        </span>
        <span className={demo.online}>
          <span className={demo.liveDot} />3 online
        </span>
      </div>
      <div className={demo.cols}>
        <div className={demo.col}>
          <h4>
            Todo <span>2</span>
          </h4>
          <div className={demo.kc}>
            <span className={demo.chip} style={{ background: '#fff0e6', color: '#e0632a' }}>
              Design
            </span>
            Onboarding flow
            <div className={demo.foot}>
              <span className={demo.miniAv} style={{ background: '#7c5cff' }}>
                I
              </span>
              <span className={demo.key}>LNE-12</span>
            </div>
          </div>
          <div className={demo.kc}>
            Empty states
            <div className={demo.foot}>
              <span className={demo.miniAv} style={{ background: '#ff6b9d' }}>
                A
              </span>
              <span className={demo.key}>LNE-19</span>
            </div>
          </div>
        </div>
        <div className={demo.col}>
          <h4>
            Doing <span>1</span>
          </h4>
          <div className={`${demo.kc} ${demo.travelDoing}`}>
            <span className={demo.chip} style={{ background: '#e4fbf3', color: '#1f9e85' }}>
              Live
            </span>
            Presence avatars
            <div className={demo.foot}>
              <span className={demo.miniAv} style={{ background: '#36c5a8' }}>
                M
              </span>
              <span className={demo.key}>LNE-08</span>
            </div>
          </div>
        </div>
        <div className={demo.col}>
          <h4>
            Done <span>2</span>
          </h4>
          <div className={`${demo.kc} ${demo.travelDone}`}>
            <span className={demo.chip} style={{ background: '#e4fbf3', color: '#1f9e85' }}>
              Live
            </span>
            Presence avatars
            <div className={demo.foot}>
              <span className={demo.miniAv} style={{ background: '#36c5a8' }}>
                M
              </span>
              <span className={demo.key}>LNE-08</span>
            </div>
          </div>
          <div className={demo.kc}>
            Realtime sync
            <div className={demo.foot}>
              <span className={demo.miniAv} style={{ background: '#7c5cff' }}>
                I
              </span>
              <span className={demo.key}>LNE-03</span>
            </div>
          </div>
        </div>
      </div>
      <div className={demo.ticker}>
        <span className={demo.who} style={{ background: '#36c5a8' }}>
          M
        </span>
        <span className={demo.msg}>Mara moved “Presence avatars” to Done ✓</span>
      </div>
      <Cursor cls={demo.curMara} color="#36c5a8" name="Mara" />
      <Cursor cls={demo.curAlex} color="#ff6b9d" name="Alex" />
    </div>
  );
}
