import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: '#FFFFFF',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: 'block',
          }}
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="leftHead" x1="0" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="rightHead" x1="40" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#7DD3FC" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="13" r="10" fill="url(#leftHead)" />
          <circle cx="57" cy="13" r="9" fill="url(#rightHead)" />
          <path
            d="M10 45 C10 31 20 24 30 32 C34 35 37 38 40 40 C43 38 46 35 50 32 C60 24 70 31 70 45 C70 59 60 66 50 58 C46 55 43 52 40 50 C37 52 34 55 30 58 C20 66 10 59 10 45Z"
            fill="url(#bodyGrad)"
          />
          <path
            d="M10 45 C10 31 20 24 30 32 C34 35 37 38 40 40 C37 37 32 32 26 30 C17 28 10 35 10 45Z"
            fill="white"
            fillOpacity="0.12"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
