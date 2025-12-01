// pages/assets.js
import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cora_assets_registry_v1";

// Five permanent demo assets – never wiped by Reset demo data
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

export default function AssetsRegistryPage() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = loadStoredAssets();

    // Combine defaults + stored, avoid accidental ID collisions
    const byId = new Map();

    DEFAULT_ASSETS.forEach((a) => {
      byId.set(a.id, a);
    });

    stored.forEach((a) => {
      if (!a || !a.id) return;
      byId.set(a.id, { ...a, isDefault: a.isDefault || false });
    });

    const combined = Array.from(byId.values());

    // Sort newest first
    combined.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    setAssets(combined);
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1>Asset registry</h1>
        <p className="page-subtitle">
          A live catalog of everything CORA is protecting — permanent demo
          assets plus anything you register in this browser.
        </p>
      </div>

      <div className="section-card">
        <div className="section-title">Registered assets</div>

        {assets && assets.length > 0 ? (
          <>
            <div className="table-header-row">
              <div>Asset</div>
              <div>Type</div>
              <div>Marker ID</div>
              <div>Enforcement</div>
              <div>Added</div>
            </div>

            <div className="table-body">
              {assets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${encodeURIComponent(asset.id)}`}
                  className="table-row clickable"
                >
                  <div className="table-cell-main">
                    <span className="table-primary">
                      {asset.name || "Untitled asset"}
                      {asset.isDefault && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 11,
                            color: "#a3a9c2",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          • demo
                        </span>
                      )}
                    </span>
                    {asset.description && (
                      <span className="table-secondary">
                        {asset.description}
                      </span>
                    )}
                  </div>

                  <div className="table-cell">
                    <span className="table-secondary">
                      {asset.type || "—"}
                    </span>
                  </div>

                  <div className="table-cell mono">
                    {asset.markerId || asset.id || "—"}
                  </div>

                  <div className="table-cell">
                    <span className="table-secondary">
                      {asset.priority === "instant_auto"
                        ? "Instant automatic"
                        : asset.priority === "owner_review"
                        ? "Owner review"
                        : asset.priority === "low_priority"
                        ? "Low priority"
                        : "—"}
                    </span>
                  </div>

                  <div className="table-cell">
                    <span className="table-secondary">
                      {asset.createdAt
                        ? new Date(asset.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" }
                          )
                        : "—"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="table-empty">
            No assets registered yet in this browser. Use{" "}
            <span className="inline-highlight">Register asset</span> to create
            your first CORA marker.
          </div>
        )}
      </div>
    </div>
  );
}