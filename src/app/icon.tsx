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
          background: 'linear-gradient(135deg, #1E3A8A, #38BDF8)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: -1,
            fontFamily: 'Arial',
          }}
        >
          SL
        </div>
      </div>
    ),
    { ...size }
  )
}
