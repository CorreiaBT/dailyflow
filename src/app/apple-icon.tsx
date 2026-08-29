import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0b07",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 13 }}>
          <div style={{ width: 26, height: 52, borderRadius: 7, background: "#9c7a35" }} />
          <div style={{ width: 26, height: 82, borderRadius: 7, background: "#d9b95c" }} />
          <div style={{ width: 26, height: 112, borderRadius: 7, background: "#f4e0a1" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
