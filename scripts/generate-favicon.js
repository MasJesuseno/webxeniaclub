const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 48;
const CHANNELS = 4;

const COLORS = {
  red: { r: 220, g: 38, b: 38 },
  darkGray: { r: 31, g: 41, b: 55 },
  white: { r: 255, g: 255, b: 255 },
  accentRed: { r: 239, g: 68, b: 68 },
};

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function createPixelBuffer() {
  const buf = Buffer.alloc(SIZE * SIZE * CHANNELS);
  const center = SIZE / 2;
  const radius = SIZE / 2 - 1;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * CHANNELS;
      const cx = x - center;
      const cy = y - center;
      const dist = Math.sqrt(cx * cx + cy * cy);

      if (dist <= radius) {
        const gradientT = (x + y) / (SIZE * 2);
        const color = lerpColor(COLORS.red, COLORS.darkGray, gradientT);

        const relX = (x - center) / center;
        const relY = (y - center) / center;

        if (relY >= -0.35 && relY <= 0.15 && relX >= -0.6 && relX <= 0.6) {
          buf[idx] = COLORS.white.r;
          buf[idx + 1] = COLORS.white.g;
          buf[idx + 2] = COLORS.white.b;
          buf[idx + 3] = 255;
        } else if (relY >= 0.2 && relY <= 0.25 && relX >= -0.5 && relX <= 0.5) {
          buf[idx] = COLORS.accentRed.r;
          buf[idx + 1] = COLORS.accentRed.g;
          buf[idx + 2] = COLORS.accentRed.b;
          buf[idx + 3] = 255;
        } else {
          buf[idx] = color.r;
          buf[idx + 1] = color.g;
          buf[idx + 2] = color.b;
          buf[idx + 3] = 255;
        }

        if (dist > radius - 1) {
          buf[idx + 3] = Math.round(255 * (radius - dist + 1));
        }
      } else {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }
  return buf;
}

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

const crc32Table = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcValue = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcValue, 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createPNG() {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawPixels = createPixelBuffer();
  const rowSize = SIZE * CHANNELS;
  const filtered = Buffer.alloc(SIZE * (rowSize + 1));
  for (let y = 0; y < SIZE; y++) {
    filtered[y * (rowSize + 1)] = 0;
    rawPixels.copy(filtered, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  }
  const compressed = zlib.deflateSync(filtered, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPNG();
const outputPath = path.join(__dirname, '..', 'public', 'favicon.png');
fs.writeFileSync(outputPath, pngBuffer);
console.log(`✅ Created ${outputPath} (${SIZE}x${SIZE}px, ${pngBuffer.length} bytes)`);
