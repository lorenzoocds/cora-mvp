// pages/enforce.js

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EnforcePage() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    const url = URL.createObjectURL(selected);
    setImageUrl(url);
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="page-shell">
      {/* HEADER */}
      <div className="page-header-block">
        <h1 className="page-title">Simulate enforcement</h1>
        <p className="page-subtitle">
          Upload a photo that contains a CORA visual marker. The system will
          simulate detecting it on platforms like Instagram or Google Images
          and applying an enforcement blur to the protected area.
        </p>
      </div>

      {/* STEP 1 – UPLOAD */}
      <section className="card enforce-card">
        <div className="card-header">
          <h2 className="card-title">1. Upload an image</h2>
          <p className="card-subtitle">
            For the demo, use an image where you&apos;ve placed a CORA marker
            (QR/visual tag) somewhere in the frame.
          </p>
        </div>

        <div className="card-body">
          <label className="field-label" htmlFor="enforce-file">
            Image file
          </label>
          <input
            id="enforce-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <p className="field-hint">
            Supported formats: JPEG, PNG. The image stays local in your browser
            for this demo.
          </p>
        </div>
      </section>

      {/* STEP 2 – PREVIEW */}
      <section className="card enforce-card">
        <div className="card-header">
          <h2 className="card-title">2. Enforcement preview</h2>
          <p className="card-subtitle">
            CORA detects the marker, decides the capture is protected, and
            applies a blur overlay to the subject while leaving the rest of the
            frame visible.
          </p>
        </div>

        <div className="card-body">
          <div className="enforce-grid">
            {/* LEFT COLUMN */}
            <div className="enforce-column">
              <h3 className="enforce-column-title">Original upload</h3>
              <div className="enforce-image-frame">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Original upload"
                    className="enforce-image"
                  />
                ) : (
                  <div className="enforce-placeholder">
                    <span className="enforce-placeholder-label">
                      Original frame
                    </span>
                    <span className="enforce-placeholder-hint">
                      Upload an image to preview
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="enforce-column">
              <h3 className="enforce-column-title">CORA-enforced</h3>
              <div className="enforce-image-frame">
                {imageUrl ? (
                  <div className="enforce-blur-wrapper">
                    <img
                      src={imageUrl}
                      alt="Blurred enforcement"
                      className="enforce-image enforce-image-blur"
                    />
                    <div className="enforce-overlay">
                      CORA — DO NOT CAPTURE
                    </div>
                  </div>
                ) : (
                  <div className="enforce-placeholder enforce-placeholder-blur">
                    <span className="enforce-placeholder-label">
                      Protected frame
                    </span>
                    <span className="enforce-placeholder-hint">
                      CORA will blur the protected subject here
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BACK LINK */}
      <Link href="/" className="back-link">
        ← Back to home
      </Link>
    </div>
  );
}