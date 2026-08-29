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
          fontSize: 84,
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
