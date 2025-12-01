// pages/settings/allowlist.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ALLOWLIST_STORAGE_KEY = "CORA_allowlist_v1";

export default function AllowlistPage() {
  const router = useRouter();

  const [entries, setEntries] = useState([]);
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [note, setNote] = useState("");
  const [banner, setBanner] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load allowlist from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(ALLOWLIST_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch (err) {
      console.error("Failed to load allowlist", err);
    }
  }, []);

  const persistEntries = (updated) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ALLOWLIST_STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
  };

  const setBannerWithTimeout = (payload) => {
    setBanner(payload);
    if (payload) {
      setTimeout(() => setBanner(null), 4000);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setBannerWithTimeout({
        type: "error",
        message: "Add an uploader handle or account name.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date();
      const newEntry = {
        id: `ALW-${now.getTime()}-${Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, "0")}`,
        handle: handle.trim(),
        platform,
        note: note.trim(),
        createdAt: now.toISOString(),
      };

      // Prevent exact duplicates (same handle + platform)
      const exists = entries.some(
        (e) =>
          e.handle.toLowerCase() === newEntry.handle.toLowerCase() &&
          e.platform === newEntry.platform
      );
      if (exists) {
        setIsSaving(false);
        setBannerWithTimeout({
          type: "error",
          message: "This uploader is already on your allowlist for this platform.",
        });
        return;
      }

      const updated = [newEntry, ...entries];
      persistEntries(updated);
      setIsSaving(false);
      setHandle("");
      setNote("");
      setPlatform("Instagram");

      setBannerWithTimeout({
        type: "success",
        message: "Trusted uploader added to your allowlist.",
      });
    } catch (err) {
      console.error("Failed to add allowlist entry", err);
      setIsSaving(false);
      setBannerWithTimeout({
        type: "error",
        message: "Something went wrong while saving this uploader.",
      });
    }
  };

  const handleRemove = (id) => {
    if (!id) return;
    const updated = entries.filter((e) => e.id !== id);
    persistEntries(updated);
    setBannerWithTimeout({
      type: "success",
      message: "Uploader removed from allowlist.",
    });
  };

  const handleGoHome = () => router.push("/");
  const handleGoMonitor = () => router.push("/monitor");
  const handleGoRegister = () => router.push("/register");
  const handleGoSimulate = () => router.push("/simulate");

  const fieldStyle = {
    width: "100%",
    padding: "0.55rem 0.7rem",
    borderRadius: "0.6rem",
    border: "1px solid rgba(51,65,85,1)",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  };

  const subtleLabel = {
    display: "block",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.9)",
    marginBottom: "0.25rem",
  };

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
      {/* Top bar / nav */}
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
              Trusted uploaders / allowlist
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                opacity: 0.65,
              }}
            >
              Control who can post content with your markers without triggering
              enforcement.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleGoMonitor}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
            }}
          >
            Monitoring dashboard
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
            Upload & simulate
          </button>
          <button
            onClick={handleGoRegister}
            className="CORA-btn"
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.8rem",
              background: "transparent",
            }}
          >
            Register asset
          </button>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.1fr)",
          gap: "1.75rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left – add form */}
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

          <h1
            style={{
              fontSize: "1.35rem",
              margin: 0,
              marginBottom: "0.4rem",
            }}
          >
            Add a trusted uploader
          </h1>
          <p
            style={{
              margin: 0,
              marginBottom: "1rem",
              fontSize: "0.9rem",
              color: "rgba(203,213,225,0.9)",
            }}
          >
            Use this when a family member, staff account or official brand
            channel should be allowed to post content with your markers without
            triggering takedowns.
          </p>

          <form
            onSubmit={handleAdd}
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.8)",
              padding: "1rem 1.1rem 1.2rem",
              display: "grid",
              gap: "0.85rem",
            }}
          >
            <div>
              <label style={subtleLabel}>Uploader handle / account *</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                style={fieldStyle}
                placeholder="@username or account name"
              />
            </div>

            <div>
              <label style={subtleLabel}>Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                style={fieldStyle}
              >
                <option>Instagram</option>
                <option>Google Images</option>
                <option>X (Twitter)</option>
                <option>Facebook</option>
                <option>TikTok</option>
                <option>News / media</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label style={subtleLabel}>Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  ...fieldStyle,
                  minHeight: "80px",
                  resize: "vertical",
                }}
                placeholder="e.g. Personal assistant, official team account, family member…"
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginTop: "0.2rem",
              }}
            >
              <button
                type="submit"
                className="CORA-btn"
                disabled={isSaving}
                style={{
                  padding: "0.55rem 1.25rem",
                  fontSize: "0.9rem",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving…" : "Add to allowlist"}
              </button>
            </div>
          </form>
        </div>

        {/* Right – table of entries */}
        <div>
          <div
            style={{
              borderRadius: "1rem",
              border: "1px solid rgba(51,65,85,0.9)",
              background: "rgba(15,23,42,0.85)",
              padding: "1rem 1.1rem 1.1rem",
              minHeight: "220px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.6rem",
              }}
            >
              <div>
                <div style={subtleLabel}>Allowlisted uploaders</div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(148,163,184,0.95)",
                  }}
                >
                  {entries.length === 0
                    ? "No trusted uploaders added yet."
                    : `${entries.length} uploader${
                        entries.length === 1 ? "" : "s"
                      } trusted across platforms.`}
                </div>
              </div>
            </div>

            {entries.length === 0 ? (
              <div
                style={{
                  marginTop: "1.1rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed rgba(51,65,85,0.9)",
                  background: "rgba(15,23,42,0.9)",
                  fontSize: "0.82rem",
                  color: "rgba(148,163,184,0.95)",
                }}
              >
                When you approve uploaders from incident detail views, or add
                them here, they appear in this list and will be treated as
                trusted for future detections.
              </div>
            ) : (
              <div
                style={{
                  marginTop: "0.8rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(30,41,59,0.9)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 1.2fr) auto",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "rgba(148,163,184,0.9)",
                    background: "rgba(15,23,42,1)",
                    borderBottom: "1px solid rgba(30,41,59,1)",
                  }}
                >
                  <div>Uploader</div>
                  <div>Platform</div>
                  <div>Notes</div>
                  <div style={{ textAlign: "right" }}>Actions</div>
                </div>

                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                  }}
                >
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 1.2fr) auto",
                        padding: "0.55rem 0.75rem",
                        fontSize: "0.85rem",
                        borderBottom: "1px solid rgba(30,41,59,0.8)",
                        alignItems: "baseline",
                      }}
                    >
                      <div style={{ color: "rgba(226,232,240,0.96)" }}>
                        {entry.handle}
                      </div>
                      <div style={{ color: "rgba(148,163,184,0.95)" }}>
                        {entry.platform}
                      </div>
                      <div
                        style={{
                          color: "rgba(148,163,184,0.9)",
                          fontSize: "0.82rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {entry.note || "—"}
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleRemove(entry.id)}
                          className="CORA-btn"
                          style={{
                            padding: "0.25rem 0.65rem",
                            fontSize: "0.78rem",
                            background: "transparent",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "0.9rem",
              borderRadius: "0.9rem",
              border: "1px solid rgba(51,65,85,0.85)",
              background: "rgba(15,23,42,0.85)",
              padding: "0.85rem 1rem",
              fontSize: "0.82rem",
              color: "rgba(148,163,184,0.95)",
            }}
          >
            <div
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                marginBottom: "0.35rem",
              }}
            >
              How this is used
            </div>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.4rem",
                lineHeight: 1.6,
              }}
            >
              When CORA sees your marker in content uploaded by a trusted
              account, it can treat these hits as low-risk by default and
              suppress automatic takedown workflows.
            </p>
            <p
              style={{
                marginTop: 0,
                marginBottom: 0,
                lineHeight: 1.6,
              }}
            >
              You can still override any single incident in the monitoring
              dashboard if a trusted account posts something that should not
              exist.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}