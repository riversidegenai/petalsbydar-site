import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Petals */}
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f9a8c9" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f9a8c9" transform="rotate(45 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f9a8c9" transform="rotate(90 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f9a8c9" transform="rotate(135 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f472b6" transform="rotate(180 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f472b6" transform="rotate(225 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f472b6" transform="rotate(270 16 16)" />
          <ellipse cx="16" cy="7" rx="4" ry="6.5" fill="#f472b6" transform="rotate(315 16 16)" />
          {/* Center */}
          <circle cx="16" cy="16" r="5" fill="#fbbf24" />
          <circle cx="16" cy="16" r="3" fill="#f59e0b" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
