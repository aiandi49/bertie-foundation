import { useEffect, useRef, useState } from "react";
import { TICKER_PARTNERS } from "utils/partnerTickerData";
import "./PartnerTicker.css";

/* A stock-exchange-style ticker of every organization the foundation has worked with.
   It scrolls slowly, pauses on hover, on keyboard focus and with its pause button, and holds
   still (scrollable by hand) for visitors who prefer reduced motion. Each name links to the
   video of its latest event, or to the History page when there is no video. */

const SPEED = 40; // pixels per second
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (d: string) => {
  const [y, m] = d.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : "";
};

export function PartnerTicker() {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const pace = () => {
      const half = track.scrollWidth / 2;
      if (half > 0) track.style.animationDuration = `${Math.round(half / SPEED)}s`;
    };
    pace();
    document.fonts?.ready.then(pace);
    window.addEventListener("resize", pace);
    return () => window.removeEventListener("resize", pace);
  }, []);

  const items = [0, 1].flatMap((copy) =>
    TICKER_PARTNERS.map((p) => {
      const events = `${p.events} ${p.events === 1 ? "event" : "events"}`;
      const external = Boolean(p.video);
      return (
        <li className="bf-tk-item" key={`${copy}-${p.id}`} aria-hidden={copy ? true : undefined}>
          <a
            className="bf-tk-link"
            href={external ? `https://www.youtube.com/watch?v=${p.video}` : "/history"}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            tabIndex={copy ? -1 : undefined}
            aria-label={`${p.name}, ${events} with the foundation, most recently ${monthLabel(p.latest)}${external ? ". Watch the video on YouTube" : ""}`}
          >
            <span className="bf-tk-name">{p.name}</span>
            <span className="bf-tk-count"><span className="bf-tk-up">▲</span> {events}</span>
            <span className="bf-tk-date">{monthLabel(p.latest)}</span>
          </a>
          <span className="bf-tk-sep" aria-hidden="true">♥</span>
        </li>
      );
    })
  );

  return (
    <div className={`bf-ticker${paused ? " is-paused" : ""}`} role="region" aria-label="Organizations the Bertie Foundation has worked with">
      <span className="bf-ticker-label">
        <img src="/images/bertie-heart.png" alt="" width={20} height={20} />
        <span className="bf-tk-label-text">Our partners</span>
      </span>
      <div className="bf-ticker-viewport">
        <ul className="bf-ticker-track" ref={trackRef}>{items}</ul>
      </div>
      <button
        type="button"
        className="bf-ticker-toggle"
        aria-pressed={paused}
        aria-label={paused ? "Play the partner ticker" : "Pause the partner ticker"}
        title={paused ? "Play" : "Pause"}
        onClick={() => setPaused((v) => !v)}
      >
        {paused ? (
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11a.7.7 0 0 0 1.05.6l9-5.5a.7.7 0 0 0 0-1.2l-9-5.5A.7.7 0 0 0 4 2.5z" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
        )}
      </button>
    </div>
  );
}
