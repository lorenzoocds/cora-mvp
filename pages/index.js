// pages/index.js
import Link from "next/link";

export default function HomePage() {
  const handleResetDemo = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm(
      "Reset CORA demo data in this browser? This will clear all registered assets, incidents, and settings."
    );
    if (!ok) return;

    try {
      // Demo-only: wipe all localStorage keys for a clean run
      window.localStorage.clear();
    } catch {
      // ignore for demo
    }

    window.location.reload();
  };

  return (
    <div className="home-root">
      <section className="home-hero">
        <div className="home-tag-row">
          <span className="home-tag">CORA demo</span>
          <span className="home-tag-secondary">
            Visual markers for what is real and what must not exist online
          </span>
        </div>
        <h1 className="home-title">
          Decide what the internet is allowed to see.
        </h1>
        <p className="home-subtitle">
          Register a subject, generate a CORA marker, then watch the monitoring
          dashboard simulate real-time scan → detect → decision → enforce across
          social and search.
        </p>
      </section>

      <section className="home-workflow-section">
        <div className="home-workflow-header">
          <h2 className="home-workflow-title">Control center</h2>
          <p className="home-workflow-caption">
            Move left to right for the full story: register, monitor, enforce,
            inspect.
          </p>
        </div>

        <div className="home-workflow-grid">
          <Link href="/register" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">Register asset</span>
                <span className="home-card-icon">①</span>
              </div>
              <p className="home-card-body">
                Create a protected subject, generate a CORA marker + QR code,
                and choose enforcement priority.
              </p>
            </div>
          </Link>

          <Link href="/assets" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">Asset registry</span>
                <span className="home-card-icon">②</span>
              </div>
              <p className="home-card-body">
                See every registered asset and its marker at a glance — this is
                what the enforcement layer is protecting.
              </p>
            </div>
          </Link>

          <Link href="/monitor" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">Monitoring dashboard</span>
                <span className="home-card-icon">③</span>
              </div>
              <p className="home-card-body">
                Simulate CORA detecting new incidents across Google Images and
                Instagram and feeding them into your queue.
              </p>
            </div>
          </Link>

          <Link href="/enforce" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">Upload & enforce</span>
                <span className="home-card-icon">④</span>
              </div>
              <p className="home-card-body">
                Upload a sample photo, see the marker detected, and preview how
                CORA would blur or block the asset.
              </p>
            </div>
          </Link>

          <Link href="/simulate" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">
                  Simulate online hit & review
                </span>
                <span className="home-card-icon">⑤</span>
              </div>
              <p className="home-card-body">
                Manually log a hit, walk through approve / keep enforcing / file
                takedown, and see the dashboard update.
              </p>
            </div>
          </Link>

          <Link href="/settings/allowlist" className="home-card-link">
            <div className="home-card">
              <div className="home-card-header">
                <span className="home-card-title">Settings / allowlist</span>
                <span className="home-card-icon">⑥</span>
              </div>
              <p className="home-card-body">
                Manage trusted uploaders who are allowed to post CORA-protected
                subjects without triggering enforcement.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <div className="home-footer-strip">
        <p className="home-footer-text">
          This demo runs entirely in your browser.{" "}
          <span className="home-emphasis">
            No real scraping, no external APIs — just the enforcement story.
          </span>
        </p>

        <button
          type="button"
          className="pill-button secondary"
          onClick={handleResetDemo}
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}