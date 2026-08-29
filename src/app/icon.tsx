import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div style={{ width: 28, height: 56, borderRadius: 8, background: "#9c7a35" }} />
          <div style={{ width: 28, height: 88, borderRadius: 8, background: "#d9b95c" }} />
          <div style={{ width: 28, height: 120, borderRadius: 8, background: "#f4e0a1" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
