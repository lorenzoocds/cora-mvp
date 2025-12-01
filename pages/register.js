// pages/register.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "cora_assets_registry_v1";

function loadAssets() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAssets(assets) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch {
    // demo only – ignore
  }
}

function generateMarkerId(assetName, assetType) {
  const slug =
    (assetName || "ASSET")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "ASSET";

  const typeTag = (assetType || "GEN").toUpperCase().slice(0, 4);
  const suffix = Date.now().toString().slice(-4);
  return `CORA-${typeTag}-${slug}-${suffix}`;
}

export default function RegisterAssetPage() {
  // NOTE: now start empty so placeholders show and vanish on type
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("Person");
  const [priority, setPriority] = useState("instant_auto");
  const [description, setDescription] = useState("");

  const [markerId, setMarkerId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [saving, setSaving] = useState(false);

  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAssets(loadAssets());
  }, []);

  const handleGenerate = (e) => {
    e.preventDefault();

    const id = generateMarkerId(assetName, assetType);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      id
    )}`;
    const created = new Date().toISOString();

    setMarkerId(id);
    setQrUrl(qr);
    setCreatedAt(created);

    const newAsset = {
      id,
      name: assetName || "Untitled asset",
      type: assetType,
      priority,
      description,
      markerId: id,
      createdAt: created,
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    setSaving(true);
    saveAssets(updated);
    setTimeout(() => setSaving(false), 600);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleOrderPhysical = () => {
    if (!markerId) return;
    alert(
      [
        "Demo only:",
        "",
        "This would open the CORA commerce flow with your marker pre-loaded.",
        "",
        "Examples:",
        "• Magnetic plates / decals for vehicles & yachts",
        "• Adhesive plaques for villas, galleries, private clubs",
        "• Hats, caps, lanyards and keychains with your CORA pattern",
      ].join("\n")
    );
  };

  const handleSendToPartner = () => {
    if (!markerId) return;
    alert(
      [
        "Demo only:",
        "",
        "This would send the marker package to a fashion / design partner ",
        "(e.g. Fendi, Rimowa, Loro Piana, Smythson) so they can weave it into:",
        "",
        "• Limited-run accessories (carry-ons, phone cases, hats)",
        "• Custom embroidery / jacquard patterns",
        "• Private-label collabs tied to this specific asset.",
        "",
        `Asset: ${assetName || "Untitled asset"}`,
        `Marker: ${markerId}`,
      ].join("\n")
    );
  };

  const displayName = assetName || "Untitled asset";

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1>Create a CORA marker & QR code</h1>
        <p className="page-subtitle">
          Define the asset, choose how aggressively CORA should enforce, and
          generate a visual marker that ties everything together.
        </p>
      </div>

      {/* Asset setup */}
      <div className="section-card">
        <div className="section-title">Asset setup</div>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Asset name</label>
            <input
              className="form-input"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Picasso – Blue Period painting, G700 jet, Como villa…"
            />
            <div className="field-help">
              This appears throughout the dashboard, registry, and incident
              reports.
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Asset type</label>
              <select
                className="form-input"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
              >
                <option>Person</option>
                <option>Vehicle / aircraft / yacht</option>
                <option>Real estate</option>
                <option>Artwork</option>
                <option>Brand / logo</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Enforcement priority</label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="instant_auto">
                  Instant automatic enforcement
                </option>
                <option value="owner_review">
                  Owner review required before enforcement
                </option>
                <option value="low_priority">
                  Low priority – mainly authenticity signal
                </option>
              </select>
              <div className="field-help">
                Controls how aggressively CORA contacts uploaders and schedules
                takedowns for this asset.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Description (internal note – not public)
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Family G700 jet based in Teterboro; highest-priority asset for all social media and press."
            />
            <div className="field-help">
              Keep this for your team – it never appears in public reports.
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="pill-button primary">
              {saving ? "Saving…" : "Generate CORA marker"}
            </button>
          </div>

          <div className="demo-note">
            Demo note: assets and markers are stored only in your browser via{" "}
            <span className="inline-highlight">localStorage</span>. Clearing
            site data will reset the registry.
          </div>
        </form>
      </div>

      {/* Marker preview / QR + merch / partners */}
      <div className="section-card" style={{ marginTop: "18px" }}>
        <div className="section-title">Marker preview</div>

        {markerId ? (
          <>
            <div className="marker-meta">
              <span className="marker-label">Marker ID</span>
              <span className="marker-value">{markerId}</span>
            </div>

            {createdAt && (
              <div className="field-help">
                Created on{" "}
                {new Date(createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                for <span className="inline-highlight">{displayName}</span>.
              </div>
            )}

            <div className="marker-qr-box">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="CORA marker QR code"
                  className="marker-qr-image"
                />
              ) : (
                <div className="marker-empty">
                  QR service not reachable in this demo.
                </div>
              )}
            </div>

            <div className="marker-actions-row" style={{ gap: "8px" }}>
              <button
                type="button"
                className="pill-button primary"
                onClick={handlePrint}
              >
                Print this QR code
              </button>

              <button
                type="button"
                className="pill-button secondary"
                onClick={handleOrderPhysical}
              >
                Order physical markers & merch
              </button>

              <button
                type="button"
                className="pill-button secondary"
                onClick={handleSendToPartner}
              >
                Send marker to fashion partner
              </button>
            </div>

            <div className="field-help" style={{ marginTop: "10px" }}>
              In production, these actions would open CORA’s commerce flow
              (magnetic plates, decals, swag) or hand off this marker package to
              selected partners (e.g. Fendi, Rimowa, Loro Piana) for
              CORA-enabled collections.
            </div>
          </>
        ) : (
          <div className="marker-empty">
            Generate a CORA marker first. Once you do, you’ll see the marker ID,
            QR code, and options to print, order physical markers, or send it to
            a fashion partner.
          </div>
        )}
      </div>
    </div>
  );
}