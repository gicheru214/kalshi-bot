// Generates pwa-192x192.png and pwa-512x512.png using pure Node.js (no deps)
import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'

function writePNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA values, row by row
  const crc32Table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })()

  const crc32 = (buf) => {
    let crc = 0xffffffff
    for (const b of buf) crc = crc32Table[(crc ^ b) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  const u32be = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b }

  const chunk = (type, data) => {
    const t = Buffer.from(type)
    const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
    const c = u32be(crc32(Buffer.concat([t, d])))
    return Buffer.concat([u32be(d.length), t, d, c])
  }

  // Build raw scanlines (filter byte 0 prepended to each row)
  const scanlines = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0  // filter = None
    pixels.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4)
  }

  const IHDR = Buffer.concat([u32be(width), u32be(height), Buffer.from([8, 2, 0, 0, 0])]) // bit depth 8, RGB (not RGBA for simplicity)
  // Actually use RGBA (bit depth 8, colorType 6)
  const IHDRdata = Buffer.concat([u32be(width), u32be(height), Buffer.from([8, 6, 0, 0, 0])])
  const IDAT = deflateSync(scanlines)

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),  // PNG signature
    chunk('IHDR', IHDRdata),
    chunk('IDAT', IDAT),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function generateIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)

  // Background color: #04080f (dark navy)
  const bgR = 4, bgG = 8, bgB = 15

  // Icon color: #00c896 (Kalshi green)
  const fgR = 0, fgG = 200, fgB = 150

  // Rounded rect fill helper
  const inRoundedRect = (x, y, rx, ry, rw, rh, r) => {
    if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false
    const corners = [[rx + r, ry + r], [rx + rw - r, ry + r], [rx + r, ry + rh - r], [rx + rw - r, ry + rh - r]]
    for (const [cx, cy] of corners) {
      if (x < rx + r && y < ry + r && Math.hypot(x - cx, y - cy) > r) return false
      if (x >= rx + rw - r && y < ry + r && Math.hypot(x - cx, y - cy) > r) return false
      if (x < rx + r && y >= ry + rh - r && Math.hypot(x - cx, y - cy) > r) return false
      if (x >= rx + rw - r && y >= ry + rh - r && Math.hypot(x - cx, y - cy) > r) return false
    }
    return true
  }

  // Draw "K" glyph inside a rounded square
  const pad = Math.round(size * 0.08)
  const radius = Math.round(size * 0.22)
  const bx = pad, by = pad, bw = size - 2 * pad, bh = size - 2 * pad

  // Letter bounds
  const lx = Math.round(size * 0.28)
  const lw = Math.round(size * 0.44)
  const ly = Math.round(size * 0.22)
  const lh = Math.round(size * 0.56)
  const stroke = Math.max(2, Math.round(size * 0.10))

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const inBg = inRoundedRect(x, y, bx, by, bw, bh, radius)

      if (inBg) {
        // Gradient background: interpolate between #04080f and #0b1220
        pixels[i]     = bgR
        pixels[i + 1] = bgG
        pixels[i + 2] = bgB
        pixels[i + 3] = 255

        // Draw K
        const isVertBar = x >= lx && x < lx + stroke && y >= ly && y < ly + lh
        const midY = ly + lh / 2
        const topArm = y < midY && x >= lx + stroke &&
                        x < lx + stroke + ((midY - y) / (lh / 2)) * (lw - stroke)
        const bottomArm = y >= midY && x >= lx + stroke &&
                           x < lx + stroke + ((y - midY) / (lh / 2)) * (lw - stroke)
        const inTopArm = topArm && x < lx + lw &&
                          y >= midY - (x - lx - stroke) * (lh / 2) / (lw - stroke) - stroke / 2 &&
                          y < midY - (x - lx - stroke) * (lh / 2) / (lw - stroke) + stroke / 2
        const inBotArm = bottomArm && x < lx + lw &&
                          y >= midY + (x - lx - stroke) * (lh / 2) / (lw - stroke) - stroke / 2 &&
                          y < midY + (x - lx - stroke) * (lh / 2) / (lw - stroke) + stroke / 2

        if (isVertBar || inTopArm || inBotArm) {
          pixels[i]     = fgR
          pixels[i + 1] = fgG
          pixels[i + 2] = fgB
          pixels[i + 3] = 255
        }
      } else {
        // Transparent outside
        pixels[i] = pixels[i + 1] = pixels[i + 2] = pixels[i + 3] = 0
      }
    }
  }

  return writePNG(size, size, pixels)
}

const sizes = [192, 512]
for (const size of sizes) {
  const png = generateIcon(size)
  const path = `public/pwa-${size}x${size}.png`
  writeFileSync(path, png)
  console.log(`✓ ${path} (${png.length} bytes)`)
}

// Also write apple-touch-icon at 180
const apple = generateIcon(180)
writeFileSync('public/apple-touch-icon.png', apple)
console.log('✓ public/apple-touch-icon.png')
