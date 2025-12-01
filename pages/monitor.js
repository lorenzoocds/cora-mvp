// pages/monitor.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const INCIDENTS_KEY = "CORA_incidents_v1";

// Seeded sample incidents for first load / reset
function createSeedIncidents() {
  const now = new Date();
  const daysAgo = (d) => {
    const t = new Date(now);
    t.setDate(t.getDate() - d);
    return t.toISOString();
  };

  return [
    // 1) VERIFIED Instagram post – marker + geometry match, treated as original
    {
      id: "INC-VERIFIED-IG-1",
      assetName: "Lake Como Villa – Pool Level",
      platform: "Instagram",
      uploader: "@housemanager_como",
      uploaderHandle: "@housemanager_como",
      markerId: "CORA-LAKECOMO-POOL-001",
      contentType: "Photo",
      sourceUrl: "https://instagram.com/p/verified-demo",
      detectedAt: daysAgo(0),
      timeLabel: "Today · 09:17 AM",
      status: "Allowed – verified original",
      typeLabel: "Owner-approved content",
      authenticityLabel: "Verified original (marker confirmed)",
      realityCheckLabel:
        "Marker and villa geometry match registered reference – content treated as original.",
      isSpoofSuspected: false,
      spoofCategory: null,
      deepfakeRiskScore: 5,
      incidentNotes:
        "Posted by a whitelisted house manager account. Marker and architecture match the pool-side reference imagery.",
      referenceOriginal: "/assets-reference/villa-reference.jpg",
      referenceSuspect: null,
      createdBySimulation: false,
    },

    // 2) Lake Como villa – marker reused on wrong property (spoof)
    {
      id: "INC-1001",
      assetName: "Lake Como Villa – North Terrace",
      platform: "Instagram",
      uploader: "@privatechefstudio",
      uploaderHandle: "@privatechefstudio",
      markerId: "CORA-LAKECOMO-0001",
      contentType: "Photo",
      sourceUrl: "https://instagram.com/p/demo1",
      detectedAt: daysAgo(0),
      timeLabel: "Today · 11:38 AM",
      status: "Flagged – awaiting review",
      typeLabel: "Potential unauthorized capture",
      authenticityLabel: "Unverified",
      realityCheckLabel:
        "Marker seen on a different property – likely spoof or misuse of the CORA marker.",
      isSpoofSuspected: true,
      spoofCategory: "marker_mismatch",
      deepfakeRiskScore: 67,
      incidentNotes:
        "Marker ID matches the registered Lake Como villa, but architecture and surroundings do not match the reference images.",
      referenceOriginal: "/assets-reference/villa-reference.jpg",
      referenceSuspect: "/assets-reference/villa-suspect.jpg",
      createdBySimulation: false,
    },

    // 3) G700 – AI-generated / deepfake style spoof
    {
      id: "INC-1002",
      assetName: "Gulfstream G700 – tail N777PV",
      platform: "Google Images",
      uploader: "Crawled result",
      uploaderHandle: "Indexed image",
      markerId: "CORA-LZ-G7-023819",
      contentType: "Photo",
      sourceUrl: "https://news-site.example.com/article",
      detectedAt: daysAgo(3),
      timeLabel: "3 days ago · 9:21 PM",
      status: "Flagged – awaiting review",
      typeLabel: "Press / editorial",
      authenticityLabel: "Unverified",
      realityCheckLabel:
        "AI-style rendering – marker appears, but aircraft is synthetic.",
      isSpoofSuspected: true,
      spoofCategory: "ai_generated",
      deepfakeRiskScore: 92,
      incidentNotes:
        "Tail number and marker are present, but lighting, reflections and surface detail match a rendered model, not the registered reference photography.",
      referenceOriginal: "/assets-reference/g700-reference.jpg",
      referenceSuspect: "/assets-reference/g700-suspect.jpg",
      createdBySimulation: false,
    },
  ];
}

function generateRandomIncidents(count = 3) {
  const platforms = [
    "Instagram",
    "Google Images",
    "TikTok",
    "YouTube",
    "X / Twitter",
  ];
  const assets = [
    "Gulfstream G700 – tail N777PV",
    "Lake Como Villa – North Terrace",
    "Soho flat – interior library",
    "Art collection – Basel vault",
  ];
  const uploaders = [
    "@paparazzi_nyc",
    "@spotter_lhr",
    "@travel_daily",
    "@designinspo_daily",
    "@randomuser123",
  ];
  const types = [
    "Potential unauthorized capture",
    "Interior content",
    "Runway spotter post",
    "Fan content",
  ];

  const now = new Date();

  return Array.from({ length: count }).map((_, idx) => {
    const id = `INC-SCAN-${now.getTime()}-${idx}-${Math.floor(
      Math.random() * 9999
    )}`;
    const assetName = assets[Math.floor(Math.random() * assets.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const uploader = uploaders[Math.floor(Math.random() * uploaders.length)];
    const typeLabel = types[Math.floor(Math.random() * types.length)];

    return {
      id,
      assetName,
      platform,
      uploader,
      uploaderHandle: uploader,
      markerId: "CORA-DEMO-MARKER",
      contentType: "Photo",
      sourceUrl: "https://example.com/detected",
      detectedAt: now.toISOString(),
      timeLabel: "Just now",
      status: "Flagged – awaiting review",
      typeLabel,
      authenticityLabel: "Unverified",
      realityCheckLabel: "Original – spoof not evaluated",
      isSpoofSuspected: false,
      deepfakeRiskScore: 32,
      incidentNotes: "Simulated detection via 'Run scan now'.",
      createdBySimulation: true,
    };
  });
}

export default function MonitorPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Load incidents from localStorage or seed on first load
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(INCIDENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIncidents(parsed);
          return;
        }
      }
      // Nothing stored: seed defaults and persist
      const seeded = createSeedIncidents();
      setIncidents(seeded);
      window.localStorage.setItem(INCIDENTS_KEY, JSON.stringify(seeded));
    } catch (err) {
      console.error("Failed to load incidents from localStorage", err);
      const seeded = createSeedIncidents();
      setIncidents(seeded);
      window.localStorage.setItem(INCIDENTS_KEY, JSON.stringify(seeded));
    }
  }, []);

  // Helper: persist any changes
  const persistIncidents = (updated) => {
    setIncidents(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INCIDENTS_KEY, JSON.stringify(updated));
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newOnes = generateRandomIncidents(3);
      const updated = [...newOnes, ...incidents];
      persistIncidents(updated);
      setIsScanning(false);
    }, 600);
  };

  const handleResetDashboard = () => {
    const seeded = createSeedIncidents();
    persistIncidents(seeded);
  };

  const handleRowClick = (id) => {
    router.push(`/incident/${id}`);
  };

  const handleGoHome = () => router.push("/");
  const handleGoSimulate = () => router.push("/simulate");
  const handleGoAllowlist = () => router.push("/settings/allowlist");

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 2rem 3rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        background:
          "radial-gradient(circle at top, #0b1120 0, #020617 42%, #020617 100%)",
        color: "white",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          maxWidth: "1120px",
          margin: "0 auto 1.5rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={handleGoHome}
            className="CORA-btn"
            style={{
              padding: "0.3rem 0.8rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            ← Home
          </button>
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                opacity: 0.85,
              }}
            >
              Monitoring dashboard
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.65,
              }}
            >
              Simulated detections from Instagram, Google Images, TikTok,
              YouTube & X/Twitter
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={handleGoAllowlist}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            Trusted uploaders / allowlist
          </button>
          <button
            onClick={handleGoSimulate}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            Upload & simulate detection
          </button>
          <button
            onClick={handleRunScan}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
            }}
            disabled={isScanning}
          >
            {isScanning ? "Scanning…" : "Run scan now"}
          </button>
          <button
            onClick={handleResetDashboard}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            Reset dashboard
          </button>
        </div>
      </header>

      {/* Table */}
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            borderRadius: "1rem",
            border: "1px solid rgba(51,65,85,0.9)",
            background: "rgba(15,23,42,0.7)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.7rem 1rem",
              borderBottom: "1px solid rgba(30,41,59,1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "rgba(148,163,184,0.9)",
              }}
            >
              {incidents.length === 0
                ? "No detections yet"
                : `Detected incidents (${incidents.length})`}
            </div>
          </div>

          {incidents.length === 0 ? (
            <div
              style={{
                padding: "1.2rem 1rem",
                fontSize: "0.9rem",
                color: "rgba(148,163,184,0.9)",
              }}
            >
              Use{" "}
              <strong>
                “Upload & simulate detection” or “Run scan now”
              </strong>{" "}
              to generate demo incidents for for demonstration purposes.
            </div>
          ) : (
            <div
              style={{
                maxHeight: "520px",
                overflowY: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "rgba(15,23,42,0.95)",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 1rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Asset
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 0.5rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Platform
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 0.5rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Uploader
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 0.5rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 0.5rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      Authenticity
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "0.6rem 1rem",
                        borderBottom: "1px solid rgba(30,41,59,1)",
                        color: "rgba(148,163,184,0.9)",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                      }}
                    >
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="CORA-row"
                      onClick={() => handleRowClick(incident.id)}
                      style={{
                        borderBottom: "1px solid rgba(30,41,59,0.85)",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.55rem 1rem",
                          maxWidth: "16rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.86rem",
                            color: "#e5e7eb",
                            marginBottom: "0.1rem",
                          }}
                        >
                          {incident.assetName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "rgba(148,163,184,0.95)",
                          }}
                        >
                          {incident.typeLabel}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.55rem 0.5rem",
                          color: "rgba(203,213,225,0.9)",
                        }}
                      >
                        {incident.platform}
                      </td>
                      <td
                        style={{
                          padding: "0.55rem 0.5rem",
                          color: "rgba(203,213,225,0.9)",
                        }}
                      >
                        {incident.uploader}
                      </td>
                      <td
                        style={{
                          padding: "0.55rem 0.5rem",
                          color: "rgba(250,250,250,0.96)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {incident.status}
                      </td>
                      <td
                        style={{
                          padding: "0.55rem 0.5rem",
                          color: incident.isSpoofSuspected
                            ? "rgba(251,191,36,0.95)"
                            : "rgba(110,231,183,0.95)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {incident.authenticityLabel}
                      </td>
                      <td
                        style={{
                          padding: "0.55rem 1rem",
                          textAlign: "right",
                          color: "rgba(148,163,184,0.95)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {incident.timeLabel || "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}