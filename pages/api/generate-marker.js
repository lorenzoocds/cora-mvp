import QRCode from "qrcode";

export default async function handler(req, res) {
  // Quick GET handler so visiting in browser still works
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, method: "GET" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { assetName } = req.body;

  if (!assetName || assetName.trim() === "") {
    return res.status(400).json({ error: "assetName is required" });
  }

  try {
    // Create a simple unique marker string
    const markerPayload = `CORA-${assetName}-${Math.floor(
      Math.random() * 1000000
    )}`;

    // Generate QR code as base64 data URL
    const qrDataUrl = await QRCode.toDataURL(markerPayload);

    return res.status(200).json({
      marker: markerPayload,
      qr: qrDataUrl,
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    return res.status(500).json({ error: "QR generation failed" });
  }
}