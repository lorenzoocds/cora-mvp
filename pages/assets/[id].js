// pages/assets/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cora_assets_registry_v1";

// Same defaults as asset registry
const DEFAULT_ASSETS = [
  {
    id: "CORA-REAL-COMO-VILLA-3101",
    name: "Como villa – family residence",
    type: "Real estate",
    priority: "instant_auto",
    description:
      "Primary family residence overlooking Lake Como. Zero-tolerance for unauthorized publication.",
    markerId: "CORA-REAL-COMO-VILLA-3101",
    createdAt: "2024-01-15T10:30:00.000Z",
    isDefault: true,
  },
  {
    id: "CORA-JET-G700-TAIL-N777C",
    name: "G700 – tail N777C",
    type: "Vehicle / aircraft / yacht",
    priority: "instant_auto",
    description:
      "Long-range Gulfstream G700 used for family + principal travel. Highest enforcement priority.",
    markerId: "CORA-JET-G700-TAIL-N777C",
    createdAt: "2024-02-03T14:05:00.000Z",
    isDefault: true,
  },
  {
    id: "CORA-YACHT-AURORA-70M",
    name: "Feadship 70m “AURORA”",
    type: "Vehicle / aircraft / yacht",
    priority: "owner_review",
    description:
      "Flagship family yacht. Press and broker content allowed only with explicit owner approval.",
    markerId: "CORA-YACHT-AURORA-70M",
    createdAt: "2024-03-21T09:15:00.000Z",
    isDefault: true,
  },
  {
    id: "CORA-ART-PICASSO-BLUE-01",
    name: "Picasso – Blue Period work",
    type: "Artwork",
    priority: "instant_auto",
    description:
      "Museum-grade artwork. No social posts from private showings without pre-cleared allowlisted accounts.",
    markerId: "CORA-ART-PICASSO-BLUE-01",
    createdAt: "2024-04-10T18:45:00.000Z",
    isDefault: true,
  },
  {
    id: "CORA-PERSON-PRIMARY-PRINCIPAL",
    name: "Principal – HNW client",
    type: "Person",
    priority: "instant_auto",
    description:
      "Primary protected individual. All sightings at hotels, airports, restaurants, and events must be suppressed.",
    markerId: "CORA-PERSON-PRIMARY-PRINCIPAL",
    createdAt: "2024-05-02T12:00:00.000Z",
    isDefault: true,
  },
];

function loadStoredAssets() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AssetDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    if (typeof window === "undefined") return;

    const stored = loadStoredAssets();
    const byId = new Map();

    DEFAULT_ASSETS.forEach((a) => {
      byId.set(a.id, a);
    });

    stored.forEach((a) => {
      if (!a || !a.id) return;
      byId.set(a.id, { ...a, isDefault: a.isDefault || false });
    });

    const found = byId.get(id);
    setAsset(found || null);
    setLoading(false);
  }, [id]);

  if (loading || !id) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <h1>Asset details</h1>
          <p className="page-subtitle">Loading asset information…</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <h1>Asset not found</h1>
          <p className="page-subtitle">
            This asset ID doesn&apos;t exist in the current CORA demo data.
          </p>
        </div>

        <div className="section-card">
          <p style={{ fontSize: "0.9rem", color: "#a3a9c2" }}>
            If you just registered this in another browser or cleared demo data,
            try creating the asset again from{" "}
            <Link href="/register" className="inline-highlight">
              Register asset
            </Link>
            .
          </p>
        </div>

        <Link href="/assets" className="back-link">
          ← Back to asset registry
        </Link>
      </div>
    );
  }

  const markerId = asset.markerId || asset.id;
  const created = asset.createdAt
    ? new Date(asset.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    markerId
  )}`;

  const priorityLabel =
    asset.priority === "instant_auto"
      ? "Instant automatic enforcement"
      : asset.priority === "owner_review"
      ? "Owner review before enforcement"
      : asset.priority === "low_priority"
      ? "Low priority / authenticity only"
      : "Unspecified";

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1>{asset.name || "Untitled asset"}</h1>
        <p className="page-subtitle">
          {asset.type || "Asset"} • {priorityLabel}
          {asset.isDefault ? " • Demo baseline asset" : ""}
        </p>
      </div>

      {asset.isDefault && (
        <div className="banner banner-info" style={{ marginBottom: "18px" }}>
         This is a permanent reference asset that always remains in your registry,
         even when you reset data.
        </div>
      )}

      {/* Summary card */}
      <div className="section-card" style={{ marginBottom: "18px" }}>
        <div className="section-title">Asset summary</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1.4fr)",
            gap: "20px",
            marginTop: "8px",
          }}
        >
          <div>
            <div className="form-group">
              <div className="form-label">Asset name</div>
              <div className="marker-value">
                {asset.name || "Untitled asset"}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label">Asset type</div>
              <div className="marker-value">{asset.type || "—"}</div>
            </div>

            <div className="form-group">
              <div className="form-label">Enforcement posture</div>
              <div className="marker-value">{priorityLabel}</div>
            </div>

            {asset.description && (
              <div className="form-group">
                <div className="form-label">Internal notes</div>
                <div
                  className="marker-value"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {asset.description}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="form-group">
              <div className="form-label">Created in CORA</div>
              <div className="marker-value">{created || "—"}</div>
            </div>

            <div className="form-group">
              <div className="form-label">Marker ID</div>
              <div className="marker-value">{markerId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marker / visual pattern card */}
      <div className="section-card">
        <div className="section-title">Marker & visual pattern</div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "#a3a9c2",
            marginBottom: "10px",
          }}
        >
          This QR code stands in for CORA&apos;s visual pattern for this asset.
          In a production build, this would expand into multiple modalities
          (QR, patterned fabric, near-IR ink, embedded device IDs).
        </p>

        <div className="marker-qr-box">
          <img
            src={qrUrl}
            alt={`CORA marker for ${asset.name || markerId}`}
            className="marker-qr-image"
          />
        </div>

        <div className="field-help" style={{ marginTop: "10px" }}>
          Any time this pattern appears in a frame, CORA treats it as{" "}
          <span className="inline-highlight">
            a hard link back to this specific asset
          </span>{" "}
          and routes the incident to the monitoring & enforcement pipeline.
        </div>
      </div>

      <Link href="/assets" className="back-link" style={{ marginTop: "18px" }}>
        ← Back to asset registry
      </Link>
    </div>
  );
}