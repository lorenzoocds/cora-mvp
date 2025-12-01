import { useState } from "react";
import { useRouter } from "next/router";

export default function SimulateOnlineHitPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    platform: "Instagram",
    asset: "",
    uploader: "",
    type: "Unauthorized",
    authenticity: "Unverified",
    enforcementStatus: "DM sent to uploader – takedown scheduled in 7 days",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("cora-incidents");
      const existing = stored ? JSON.parse(stored) : [];

      const newIncident = {
        id: Date.now().toString(),
        time: "Just now",
        platform: form.platform,
        asset: form.asset || "Untitled asset",
        uploader: form.uploader || "@unknown",
        type: form.type,
        authenticity: form.authenticity,
        enforcementStatus: form.enforcementStatus,
        source: "Simulated online hit",
      };

      window.localStorage.setItem(
        "cora-incidents",
        JSON.stringify([newIncident, ...existing])
      );
    }

    router.push("/monitor");
  };

  return (
    <div className="page-shell">
      <div className="page-header-block">
        <h1 className="page-title">Simulate online detection</h1>
        <p className="page-subtitle">
          Use this form to pretend CORA has found your visual marker on a major
          platform. Submitting will create an incident that appears in your
          monitoring dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card form-card">
        <div className="form-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="platform">
              Platform
            </label>
            <select
              id="platform"
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className="field-input"
            >
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Google Images</option>
              <option>YouTube</option>
              <option>X / Twitter</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="asset">
              Asset
            </label>
            <input
              id="asset"
              name="asset"
              type="text"
              value={form.asset}
              onChange={handleChange}
              className="field-input"
              placeholder="e.g. Lorenzo – G7 jet"
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="uploader">
              Uploader handle
            </label>
            <input
              id="uploader"
              name="uploader"
              type="text"
              value={form.uploader}
              onChange={handleChange}
              className="field-input"
              placeholder="@random_guy_92"
            />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="type">
              Incident type
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="field-input"
            >
              <option>Authorized</option>
              <option>Unauthorized</option>
              <option>Spoof suspected</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="authenticity">
              Authenticity
            </label>
            <select
              id="authenticity"
              name="authenticity"
              value={form.authenticity}
              onChange={handleChange}
              className="field-input"
            >
              <option>Original</option>
              <option>Unverified</option>
              <option>Synthetic / deepfake risk</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="enforcementStatus">
              Enforcement status
            </label>
            <textarea
              id="enforcementStatus"
              name="enforcementStatus"
              value={form.enforcementStatus}
              onChange={handleChange}
              className="field-input field-textarea"
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            Simulate detection &amp; update dashboard
          </button>
        </div>
      </form>
    </div>
  );
}