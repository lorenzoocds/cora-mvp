// pages/incident/[id].js
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";

const INCIDENTS_STORAGE_KEY = "CORA_incidents_v1";

export default function IncidentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [incident, setIncident] = useState(null);
  const [banner, setBanner] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load incident from localStorage by id
  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(INCIDENTS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return;

      const match = parsed.find((i) => i.id === id);
      if (match) {
        setIncident(match);
      }
    } catch (err) {
      console.error("Failed to load incident", err);
    }
  }, [id]);

  const setBannerWithTimeout = (payload) => {
    setBanner(payload);
    if (payload) {
      setTimeout(() => setBanner(null), 4000);
    }
  };

  const updateIncidentAndPersist = (updates, decisionLabel) => {
    if (!incident || typeof window === "undefined") return;

    setIsUpdating(true);

    try {
      const stored = window.localStorage.getItem(INCIDENTS_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      const updatedIncident = {
        ...incident,
        ...updates,
      };

      const updatedList = Array.isArray(parsed)
        ? parsed.map((i) => (i.id === incident.id ? updatedIncident : i))
        : [updatedIncident];

      window.localStorage.setItem(
        INCIDENTS_STORAGE_KEY,
        JSON.stringify(updatedList)
      );
      setIncident(updatedIncident);
      setIsUpdating(false);

      setBannerWithTimeout({
        type: "success",
        message: decisionLabel,
      });
    } catch (err) {
      console.error("Failed to update incident", err);
      setIsUpdating(false);
      setBannerWithTimeout({
        type: "error",
        message: "Something went wrong saving your decision.",
      });
    }
  };

  const handleApproveAndWhitelist = () => {
    if (!incident) return;
    const newStatus = "Allowlisted upload";
    const newType = "Approved uploader";
    const newAuth =
      incident.authenticity === "Synthetic / spoof suspected"
        ? "Real asset detected"
        : incident.authenticity || "Real asset detected";

    updateIncidentAndPersist(
      {
        status: newStatus,
        type: newType,
        authenticity: newAuth,
      },
      "Uploader approved and allowlisted. Future hits from this source will be treated as trusted by default."
    );
  };

  const handleKeepEnforcement = () => {
    if (!incident) return;
    const newStatus = "Pending enforcement";

    updateIncidentAndPersist(
      {
        status: newStatus,
      },
      "Enforcement left active. CORA will continue to treat this as an unauthorized capture."
    );
  };

  const handleFileTakedown = () => {
    if (!incident) return;
    const newStatus = "Escalated – takedown filed";

    updateIncidentAndPersist(
      {
        status: newStatus,
      },
      "Takedown triggered. CORA will notify the uploader and file a platform complaint on your behalf."
    );
  };

  const handleGoBackToMonitor = () => router.push("/monitor");
  const handleGoHome = () => router.push("/");
  const handleGoAllowlist = () => router.push("/settings/allowlist");

  // Deepfake comparison image config (for G700, villa, etc.)
  const comparisonConfig = useMemo(() => {
    if (!incident) return null;

    const name = (incident.assetName || "").toLowerCase();

    if (name.includes("g700") || name.includes("gulfstream")) {
      return {
        label: "Gulfstream G700 – reference vs suspected spoof",
        referenceSrc: "/assets-reference/g700-reference.jpg",
        hitSrc: "/assets-reference/g700-suspect.jpg",
      };
    }

    if (name.includes("villa") || name.includes("residence")) {
      return {
        label: "Residence – reference vs suspected spoof",
        referenceSrc: "/assets-reference/villa-reference.jpg",
        hitSrc: "/assets-reference/villa-suspect.jpg",
      };
    }

    return null;
  }, [incident]);

  const shouldShowComparison =
    incident &&
    incident.authenticity === "Synthetic / spoof suspected" &&
    comparisonConfig;

  // Instagram-style verified preview:
  // Only show when platform is Instagram AND authenticity is "Real asset detected".
  const showVerifiedPreview =
    incident &&
    incident.platform === "Instagram" &&
    incident.authenticity === "Real asset detected";

  const previewHandle = useMemo(() => {
    if (!incident) return "@unknown";
    if (incident.uploader && incident.uploader.trim().length > 0) {
      return incident.uploader.startsWith("@")
        ? incident.uploader
        : `@${incident.uploader}`;
    }
    return "@unknown";
  }, [incident]);

  if (!incident) {
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
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          <button
            onClick={handleGoBackToMonitor}
            className="CORA-btn"
            style={{
              padding: "0.3rem 0.8rem",
              fontSize: "0.8rem",
              background: "transparent",
              marginBottom: "1rem",
            }}
          >
            ← Back to monitoring dashboard
          </button>
          <h1
            style={{
              fontSize: "1.4rem",
              marginBottom: "0.5rem",
            }}
          >
            Incident not found
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(203,213,225,0.9)",
            }}
          >
            This incident ID was not found in local storage. Try reopening the
            monitoring dashboard and selecting an incident again.
          </p>
        </div>
      </main>
    );
  }

  const chipBase = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.15rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  };

  const typeColor =
    incident.type === "Approved uploader"
      ? {
          border: "1px solid rgba(34,197,94,0.7)",
          color: "rgba(22,163,74,0.95)",
          background: "rgba(22,163,74,0.1)",
        }
      : {
          border: "1px solid rgba(248,113,113,0.7)",
          color: "rgba(248,113,113,0.95)",
          background: "rgba(127,29,29,0.25)",
        };

  const authColor =
    incident.authenticity === "Synthetic / spoof suspected"
      ? {
          border: "1px solid rgba(248,113,113,0.7)",
          color: "rgba(248,113,113,0.95)",
          background: "rgba(127,29,29,0.25)",
        }
      : {
          border: "1px solid rgba(59,130,246,0.7)",
          color: "rgba(96,165,250,0.95)",
          background: "rgba(30,64,175,0.35)",
        };

  let statusColor;
  if (incident.status === "Allowlisted upload") {
    statusColor = {
      border: "1px solid rgba(34,197,94,0.7)",
      color: "rgba(34,197,94,0.95)",
      background: "rgba(22,163,74,0.18)",
    };
  } else if (incident.status === "Escalated – takedown filed") {
    statusColor = {
      border: "1px solid rgba(248,113,113,0.7)",
      color: "rgba(248,113,113,0.95)",
      background: "rgba(127,29,29,0.25)",
    };
  } else {
    statusColor = {
      border: "1px solid rgba(252,211,77,0.7)",
      color: "rgba(252,211,77,0.95)",
      background: "rgba(161,98,7,0.3)",
    };
  }

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
            onClick={handleGoBackToMonitor}
            className="CORA-btn"
            style={{
              padding: "0.3rem 0.8rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            ← Back to monitoring dashboard
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
              Incident detail
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.65,
              }}
            >
              {incident.assetName} · {incident.platform} ·{" "}
              {incident.ageLabel || "recent"}
            </div>
          </div>
        </div>

        <button
          onClick={handleGoHome}
          className="CORA-btn"
          style={{
            padding: "0.4rem 0.9rem",
            fontSize: "0.8rem",
            background: "transparent",
          }}
        >
          Home
        </button>
      </header>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1.05fr)",
          gap: "1.75rem",
          alignItems: "flex-start",
        }}
      >
        <div>
          {banner && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border:
                  banner.type === "error"
                    ? "1px solid rgba(239,68,68,0.7)"
                    : "1px solid rgba(34,197,94,0.7)",
                background:
                  banner.type === "error"
                    ? "rgba(127,29,29,0.25)"
                    : "rgba(22,163,74,0.16)",
                fontSize: "0.85rem",
                color: "rgba(241,245,249,0.95)",
              }}
            >
              {banner.message}
            </div>
          )}

          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.75)",
              padding: "1rem 1.1rem 1.1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.6rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "rgba(148,163,184,0.9)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Asset
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 500,
                  }}
                >
                  {incident.assetName}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(148,163,184,0.95)",
                    marginTop: "0.15rem",
                  }}
                >
                  Marker ID:{" "}
                    <span style={{ color: "rgba(129,140,248,0.95)" }}>
                      {incident.id}
                    </span>
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.8rem",
                  color: "rgba(148,163,184,0.95)",
                }}
              >
                <div>{incident.platform}</div>
                {incident.uploader && (
                  <div style={{ marginTop: "0.15rem" }}>
                    Uploader:{" "}
                    <span style={{ color: "rgba(226,232,240,0.95)" }}>
                      {incident.uploader}
                    </span>
                  </div>
                )}
                {incident.link && (
                  <div
                    style={{
                      marginTop: "0.15rem",
                      wordBreak: "break-all",
                    }}
                  >
                    <a
                      href={incident.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "rgba(96,165,250,0.98)",
                        textDecoration: "none",
                      }}
                    >
                      Open source link ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginTop: "0.15rem",
              }}
            >
              <span style={{ ...chipBase, ...typeColor }}>
                {incident.type || "Unknown type"}
              </span>
              <span style={{ ...chipBase, ...authColor }}>
                {incident.authenticity || "Authenticity unknown"}
              </span>
              <span style={{ ...chipBase, ...statusColor }}>
                {incident.status || "Status unknown"}
              </span>
            </div>
          </div>

          {/* Deepfake / spoof comparison */}
          {shouldShowComparison && (
            <div
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(56,189,248,0.8)",
                background:
                  "linear-gradient(135deg, rgba(8,47,73,0.9), rgba(15,23,42,0.95))",
                padding: "1rem 1.1rem 1.1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(125,211,252,0.95)",
                  marginBottom: "0.4rem",
                }}
              >
                Deepfake / spoof analysis
              </div>
              <div
                style={{
                  fontSize: "0.88rem",
                  color: "rgba(226,232,240,0.95)",
                  marginBottom: "0.7rem",
                  lineHeight: 1.6,
                }}
              >
                CORA is comparing the flagged image against a known reference of
                this asset. Visual markers, geometry and lighting patterns are
                used to score whether this is likely real footage or a synthetic
                spoof.
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(15,23,42,1)",
                    background: "rgba(15,23,42,0.9)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.78rem",
                      color: "rgba(148,163,184,0.95)",
                      borderBottom: "1px solid rgba(30,64,175,0.7)",
                    }}
                  >
                    Registered reference asset
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "170px",
                      background: "#020617",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={comparisonConfig.referenceSrc}
                      alt="Registered reference asset"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(15,23,42,1)",
                    background: "rgba(15,23,42,0.9)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.78rem",
                      color: "rgba(148,163,184,0.95)",
                      borderBottom: "1px solid rgba(185,28,28,0.8)",
                    }}
                  >
                    Flagged hit – suspected spoof
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "170px",
                      background: "#020617",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={comparisonConfig.hitSrc}
                      alt="Flagged suspected spoof"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enforcement summary */}
          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.75)",
              padding: "1rem 1.1rem 1.2rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "rgba(148,163,184,0.9)",
                marginBottom: "0.4rem",
              }}
            >
              Enforcement summary
            </div>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.7rem",
                fontSize: "0.9rem",
                color: "rgba(203,213,225,0.95)",
                lineHeight: 1.6,
              }}
            >
              Choose how CORA should treat this capture going forward. Your
              decision updates the incident status here and in the main
              monitoring dashboard.
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.2rem",
                fontSize: "0.86rem",
                color: "rgba(148,163,184,0.95)",
                lineHeight: 1.6,
              }}
            >
              <li>
                <strong>Approve & allowlist</strong> – mark this uploader as
                trusted for this asset.
              </li>
              <li>
                <strong>Keep enforcement active</strong> – keep tracking and
                blocking, no escalation.
              </li>
              <li>
                <strong>File takedown now</strong> – escalate to a formal
                takedown workflow.
              </li>
            </ul>
          </div>
        </div>

        {/* Right – Decision console + Instagram-style preview */}
        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {/* Decision console */}
          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.9)",
              padding: "1rem 1.1rem 1.2rem",
              fontSize: "0.88rem",
              color: "rgba(226,232,240,0.96)",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "rgba(148,163,184,0.95)",
                marginBottom: "0.5rem",
              }}
            >
              Decide what should exist
            </div>

            <p
              style={{
                marginTop: 0,
                marginBottom: "0.8rem",
                lineHeight: 1.6,
              }}
            >
              Set the policy outcome for this incident. CORA uses this to update
              enforcement, adjust future risk scoring and tune which uploaders
              are treated as trusted for this asset.
            </p>

            <div
              style={{
                display: "grid",
                gap: "0.6rem",
                marginBottom: "0.9rem",
              }}
            >
              <button
                onClick={handleApproveAndWhitelist}
                disabled={isUpdating}
                className="CORA-btn"
                style={{
                  justifyContent: "flex-start",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.86rem",
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                Approve uploader & add to allowlist
              </button>
              <button
                onClick={handleKeepEnforcement}
                disabled={isUpdating}
                className="CORA-btn"
                style={{
                  justifyContent: "flex-start",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.86rem",
                  background: "transparent",
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                Keep enforcement active, no escalation
              </button>
              <button
                onClick={handleFileTakedown}
                disabled={isUpdating}
                className="CORA-btn"
                style={{
                  justifyContent: "flex-start",
                  padding: "0.55rem 0.9rem",
                  fontSize: "0.86rem",
                  background:
                    "linear-gradient(135deg, rgba(248,113,113,0.95), rgba(190,24,93,0.95))",
                  border: "none",
                  opacity: isUpdating ? 0.7 : 1,
                }}
              >
                File takedown now
              </button>
            </div>

            <div
              style={{
                borderRadius: "0.8rem",
                border: "1px dashed rgba(51,65,85,0.9)",
                background: "rgba(15,23,42,0.9)",
                padding: "0.8rem 0.9rem",
                fontSize: "0.8rem",
                color: "rgba(148,163,184,0.95)",
              }}
            >
              <div
                style={{
                  marginBottom: "0.35rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Current status
              </div>
              <div>
                <strong>{incident.status}</strong> ·{" "}
                {incident.type || "Unknown type"} ·{" "}
                {incident.authenticity || "Authenticity unknown"}
              </div>
              <div style={{ marginTop: "0.35rem" }}>
                To manage trusted uploaders globally, use the allowlist
                settings.
              </div>
              <button
                onClick={handleGoAllowlist}
                className="CORA-btn"
                style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.78rem",
                }}
              >
                Open trusted uploaders / allowlist
              </button>
            </div>
          </div>

          {/* Instagram-style "verified post" preview */}
          {showVerifiedPreview && (
            <div
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(30,64,175,0.9)",
                background:
                  "radial-gradient(circle at top left, rgba(15,23,42,1), rgba(15,23,42,0.96))",
                padding: "0.85rem 0.9rem 1rem",
                fontSize: "0.84rem",
                color: "rgba(226,232,240,0.96)",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(148,163,184,0.95)",
                  marginBottom: "0.45rem",
                }}
              >
                Platform preview – Instagram
              </div>

              {/* Fake IG card */}
              <div
                style={{
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(30,41,59,1)",
                  background: "rgba(15,23,42,1)",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.55rem 0.8rem",
                    borderBottom: "1px solid rgba(30,41,59,1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "999px",
                        background:
                          "radial-gradient(circle at top, #38bdf8, #0f172a)",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.86rem",
                            fontWeight: 500,
                          }}
                        >
                          {previewHandle}
                        </span>
                        {/* Blue verify tick */}
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "999px",
                            background:
                              "radial-gradient(circle at top, #38bdf8, #1d4ed8)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            color: "white",
                          }}
                        >
                          ✓
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "rgba(148,163,184,0.95)",
                        }}
                      >
                        Instagram · Verified original
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      color: "rgba(148,163,184,0.9)",
                    }}
                  >
                    …
                  </div>
                </div>

                {/* Image placeholder */}
                <div
                  style={{
                    width: "100%",
                    height: "190px",
                    background:
                      "radial-gradient(circle at top, #0f172a, #020617)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    color: "rgba(148,163,184,0.9)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "18px",
                      borderRadius: "0.75rem",
                      border: "1px dashed rgba(51,65,85,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    Marker detected. Post cryptographically linked to a
                    registered asset and verified as original, not AI-generated.
                  </div>
                </div>

                {/* Caption + “Verified by CORA” strip */}
                <div
                  style={{
                    padding: "0.55rem 0.8rem 0.65rem",
                    borderTop: "1px solid rgba(30,41,59,1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      marginBottom: "0.35rem",
                      color: "rgba(226,232,240,0.96)",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{previewHandle}</span>{" "}
                    CORA marker detected in-frame. Post marked as authentic.
                  </div>
                  <div
                    style={{
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(56,189,248,0.9)",
                      background: "rgba(8,47,73,0.8)",
                      padding: "0.35rem 0.5rem",
                      fontSize: "0.74rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        background:
                          "radial-gradient(circle at top, #38bdf8, #1d4ed8)",
                      }}
                    />
                    <span>Verified by CORA – original, not AI-generated</span>
                  </div>
                </div>
              </div>

              <p
                style={{
                  marginTop: "0.75rem",
                  marginBottom: 0,
                  fontSize: "0.8rem",
                  color: "rgba(148,163,184,0.95)",
                  lineHeight: 1.6,
                }}
              >
                In a future integration, viewers on Instagram would see this
                post as authenticated, with platform-native verification that
                your marker is present and the content matches a registered
                asset.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}