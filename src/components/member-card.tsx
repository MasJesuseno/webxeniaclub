"use client"

import { useEffect, useRef, useState } from "react"

interface MemberCardProps {
  member: {
    namaPanggilan: string | null
    namaLengkap: string
    foto: string | null
    memberId: string | null
    masaBerlaku: string | null
  }
  clubName?: string
  shortName?: string
  slogan?: string | null
  logo?: string | null
  favicon?: string | null
  cardTemplateFront?: string | null
  cardTemplateBack?: string | null
  profileUrl?: string | null
  showBack?: boolean
  autoPrint?: boolean
  downloadImage?: boolean
}

export function MemberCard({
  member,
  shortName = "DXIC",
  clubName,
  slogan,
  logo,
  favicon,
  cardTemplateFront,
  cardTemplateBack,
  profileUrl,
  showBack,
  autoPrint,
  downloadImage,
}: MemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const cardInnerRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [frontQrDataUrl, setFrontQrDataUrl] = useState<string | null>(null)

  // Generate QR code for profile URL (front side)
  useEffect(() => {
    if (!profileUrl) return
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(profileUrl, {
        width: 120,
        margin: 1,
        color: { dark: "#ffffff", light: "#00000000" },
      }).then(setFrontQrDataUrl)
    }).catch(() => {})
  }, [profileUrl])

  const masaBerlakuDisplay = member.masaBerlaku
    ? (() => {
        const d = new Date(member.masaBerlaku!)
        if (isNaN(d.getTime())) return member.masaBerlaku
        // Format soredate: dd-mm-yyyy
        const dd = String(d.getDate()).padStart(2, "0")
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const yyyy = d.getFullYear()
        return `${dd}-${mm}-${yyyy}`
      })()
    : null

  const displayName = member.namaLengkap
  const initial = displayName.charAt(0).toUpperCase()

  // Auto download image when downloadImage is true
  useEffect(() => {
    if (downloadImage && cardInnerRef.current) {
      const timer = setTimeout(() => downloadCardAsImage(), 800)
      return () => clearTimeout(timer)
    }
  }, [downloadImage])

  // Fallback auto-print
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [autoPrint])

  async function downloadCardAsImage() {
    if (!cardInnerRef.current) return
    setDownloading(true)

    try {
      const html2canvas = (await import("html2canvas")).default

      // Target: 300 DPI at 53.98mm width (credit card size)
      const targetWidthPx = Math.round((53.98 / 25.4) * 300)
      const scale = targetWidthPx / 320

      const canvas = await html2canvas(cardInnerRef.current, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        width: 320,
      })

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create image")
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Kartu_Anggota_${member.memberId || "DXIC"}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, "image/png")
    } catch (err) {
      console.error("Image generation error:", err)
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  // Determine card style: use template image as background if available
  const frontBgStyle = cardTemplateFront
    ? { backgroundImage: `url(${cardTemplateFront})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  const backBgStyle = cardTemplateBack
    ? { backgroundImage: `url(${cardTemplateBack})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  return (
    <>
      <div ref={cardRef} className="member-card-wrapper">
        <div
          ref={cardInnerRef}
          className={`member-card ${showBack ? 'member-card-back' : ''}`}
          style={showBack && cardTemplateBack ? backBgStyle : cardTemplateFront ? frontBgStyle : {}}
        >
          {showBack ? (
            /* ===== BACK SIDE — hanya background template ===== */
            <></>
          ) : (
            /* ===== FRONT SIDE ===== */
            <>
              {/* Member Photo */}
              <div className="photo-area">
                {member.foto ? (
                  <img src={member.foto} alt={displayName} className="photo-img" />
                ) : (
                  <div className="photo-fallback">{initial}</div>
                )}
              </div>

              {/* Name Badge */}
              <div className="name-badge">{displayName}</div>

              {/* ID, QR & Masa Berlaku */}
              {(member.memberId || masaBerlakuDisplay || frontQrDataUrl) && (
                <div className="id-expiry-row">
                  {member.memberId && (
                    <div className="id-number">{member.memberId}</div>
                  )}
                  {frontQrDataUrl && (
                    <div className="qr-in-row">
                      <img src={frontQrDataUrl} alt="QR Code" className="qr-img" />
                    </div>
                  )}
                  {masaBerlakuDisplay && (
                    <div className="expiry">{masaBerlakuDisplay}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        /* ===== WRAPPER ===== */
        .member-card-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
        }

        /* ===== CARD BASE ===== */
        .member-card {
          width: 320px;
          aspect-ratio: 53.98 / 85.60;
          background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
          border-radius: 14px;
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }

        .member-card::before {
          content: "";
          position: absolute;
          top: -30%;
          left: -20%;
          width: 140%;
          height: 80%;
          background: radial-gradient(ellipse at center, rgba(212, 168, 83, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .member-card-back {
          background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
        }

        .member-card-back::before {
          display: none;
        }

        /* ===== FRONT: Top Banner (unused on front but kept for reference) ===== */
        .card-banner {
          width: 100%;
          padding: 10px 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .banner-favicon {
          width: 80%;
          height: 22px;
          object-fit: contain;
          display: block;
        }

        .banner-favicon-fallback {
          width: 80%;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4a853;
          font-weight: 900;
          font-size: 18px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .divider-line {
          width: 85%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.3), transparent);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .logo-area {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          margin-top: 25px;
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-fallback {
          width: 68px;
          height: 68px;
          background: #222;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d4a853;
          font-weight: 900;
          font-size: 22px;
          border: 2px solid #333;
        }

        /* ===== FRONT: Photo ===== */
        .photo-area {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          border: 2.5px solid #d4a853;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #222;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          margin-top: 183px;
          margin-left: -4px;
        }

        .photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-fallback {
          color: #d4a853;
          font-size: 63px;
          font-weight: 900;
          line-height: 1;
        }

        /* ===== FRONT: Name Badge ===== */
        .name-badge {
          color: white;
          padding: 5px 18px;
          border-radius: 14px;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.3px;
          max-width: 95%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          margin-top: -4px;
        }

        /* ===== FRONT: ID & Expiry Row ===== */
        .id-expiry-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 75%;
          margin-top: 25px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .id-number {
          color: #bbb;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          margin-left: -12px;
        }

        .qr-in-row {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          margin-left: 59px;
          position: relative;
          top: -4px;
        }

        .qr-img {
          width: 100%;
          height: 100%;
          display: block;
        }

        .expiry {
          color: #bbb;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.4px;
          margin-left: 40px;
          white-space: nowrap;
        }

        /* ===== PRINT STYLES ===== */
        @media print {
          @page {
            size: 53.98mm 85.60mm;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .member-card-wrapper {
            min-height: auto;
            background: none;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 53.98mm;
            height: 85.60mm;
          }

          .member-card {
            width: 49mm;
            box-shadow: none;
            border-radius: 2.5mm;
            padding: 2.5mm 2.5mm 3mm;
            background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
          }

          .member-card::before { display: none; }

          /* Front side print styles (existing) */
          .card-banner {
            padding: 1.5mm 0 1.2mm;
          }

          .banner-favicon {
            width: 80%;
            height: 4mm;
          }

          .banner-favicon-fallback {
            width: 80%;
            height: 4mm;
            font-size: 3mm;
            letter-spacing: 0.5mm;
          }

          .divider-line {
            width: 85%;
            height: 0.2mm;
          }

          .logo-area {
            width: 11mm;
            height: 11mm;
            margin-top: 6mm;
          }

          .logo-fallback {
            width: 11mm;
            height: 11mm;
            font-size: 3.5mm;
            border-width: 0.4mm;
          }

          .photo-area {
            width: 22.5mm;
            height: 22.5mm;
            border-width: 0.4mm;
            margin-top: 46.5mm;
          }

          .photo-fallback {
            font-size: 10.5mm;
          }

          .name-badge {
            font-size: 3.8mm;
            padding: 0.8mm 2.5mm;
            border-radius: 2mm;
            margin-top: -1mm;
            box-shadow: none;
          }

          .id-expiry-row {
            width: 82%;
            margin-top: 3mm;
          }

          .id-number {
            font-size: 2.2mm;
            letter-spacing: 0.2mm;
            color: #aaa;
            font-weight: 800;
            margin-left: -2mm;
          }

          .qr-in-row {
            width: 7mm;
            height: 7mm;
            margin-left: 13mm;
          }

          .expiry {
            font-size: 1.7mm;
            letter-spacing: 0.1mm;
            color: #aaa;
            font-weight: 800;
            margin-left: 7mm;
          }

          nav, .no-print, button, header, footer {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
