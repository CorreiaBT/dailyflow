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
          fontSize: 78,
          fontWeight: 700,
          color: "#d9b95c",
          fontFamily: "sans-serif",
        }}
      >
        R$
      </div>
    ),
    { ...size }
  );
}
