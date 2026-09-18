const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const SPRITE_DIR = path.join(ROOT, "assets", "doom");

const WANTED = [
  "STBAR",
  "STARMS",
  "STTNUM0",
  "STTNUM1",
  "STTNUM2",
  "STTNUM3",
  "STTNUM4",
  "STTNUM5",
  "STTNUM6",
  "STTNUM7",
  "STTNUM8",
  "STTNUM9",
  "STTPRCNT",
  "STFST00",
  "STFST01",
  "STFST02",
  "PISGA0",
  "PISGB0",
  "PISGC0",
  "PISGD0",
  "PISGE0",
  "PISFA0",
  "SKY1",
  "FLOOR7_1",
  "W28_5",
];

function decodeFlat(data, palette) {
  const width = 64;
  const height = 64;
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const palIndex = data[i];
    rgba[i * 4] = palette[palIndex * 3];
    rgba[i * 4 + 1] = palette[palIndex * 3 + 1];
    rgba[i * 4 + 2] = palette[palIndex * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return { width, height, rgba };
}

function decodePatch(data, palette) {
  if (data.length < 8) {
    throw new Error("lump demasiado pequeno");
  }
  const width = data.readUInt16LE(0);
  const height = data.readUInt16LE(2);
  if (width === 0 || height === 0 || width > 1024 || height > 1024) {
    throw new Error(`tamano raro ${width}x${height}`);
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let x = 0; x < width; x += 1) {
    const headerOff = 8 + x * 4;
    if (headerOff + 4 > data.length) {
      throw new Error("columna fuera de rango");
    }
    let col = data.readUInt32LE(headerOff);
    while (col < data.length && data[col] !== 0xff) {
      const rowStart = data[col];
      const count = data[col + 1];
      if (col + 3 + count >= data.length) break;
      for (let i = 0; i < count; i += 1) {
        const y = rowStart + i;
        if (y < 0 || y >= height) continue;
        const palIndex = data[col + 3 + i];
        const dest = (y * width + x) * 4;
        rgba[dest] = palette[palIndex * 3];
        rgba[dest + 1] = palette[palIndex * 3 + 1];
        rgba[dest + 2] = palette[palIndex * 3 + 2];
        rgba[dest + 3] = 255;
      }
      col += count + 4;
    }
  }
  return { width, height, rgba };
}

function lumpName(buf, offset) {
  return buf
    .toString("ascii", offset, offset + 8)
    .replace(/\0.*$/, "")
    .toUpperCase();
}

function readWad(filePath) {
  const buf = fs.readFileSync(filePath);
  const ident = buf.toString("ascii", 0, 4);
  if (ident !== "IWAD" && ident !== "PWAD") {
    throw new Error(`No es un WAD valido: ${ident}`);
  }
  const numlumps = buf.readUInt32LE(4);
  const table = buf.readUInt32LE(8);
  const lumps = new Map();
  for (let i = 0; i < numlumps; i += 1) {
    const entry = table + i * 16;
    const pos = buf.readUInt32LE(entry);
    const size = buf.readUInt32LE(entry + 4);
    const name = lumpName(buf, entry + 8);
    lumps.set(name, buf.subarray(pos, pos + size));
  }
  return lumps;
}

function decodePatch(data, palette) {
  const width = data.readUInt16LE(0);
  const height = data.readUInt16LE(2);
  const rgba = Buffer.alloc(width * height * 4);
  for (let x = 0; x < width; x += 1) {
    let col = data.readUInt32LE(8 + x * 4);
    while (col < data.length && data[col] !== 0xff) {
      const rowStart = data[col];
      const count = data[col + 1];
      for (let i = 0; i < count; i += 1) {
        const y = rowStart + i;
        if (y < 0 || y >= height) continue;
        const palIndex = data[col + 3 + i];
        const dest = (y * width + x) * 4;
        rgba[dest] = palette[palIndex * 3];
        rgba[dest + 1] = palette[palIndex * 3 + 1];
        rgba[dest + 2] = palette[palIndex * 3 + 2];
        rgba[dest + 3] = 255;
      }
      col += count + 4;
    }
  }
  return { width, height, rgba };
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function main() {
  const wadPath = process.argv[2];
  if (!wadPath) {
    throw new Error("Uso: node scripts/extract-freedoom.js ruta/a/freedoom1.wad");
  }
  const lumps = readWad(wadPath);
  const playpal = lumps.get("PLAYPAL");
  if (!playpal) throw new Error("El WAD no trae PLAYPAL");
  fs.mkdirSync(SPRITE_DIR, { recursive: true });

  const extracted = [];
  for (const name of WANTED) {
    const lump = lumps.get(name);
    if (!lump) {
      console.log(`No esta ${name}`);
      continue;
    }
    try {
      const decoded =
        lump.length === 4096
          ? decodeFlat(lump, playpal)
          : decodePatch(lump, playpal);
      const out = path.join(SPRITE_DIR, `${name}.png`);
      fs.writeFileSync(out, encodePng(decoded.width, decoded.height, decoded.rgba));
      extracted.push(`${name} ${decoded.width}x${decoded.height}`);
    } catch (error) {
      console.log(`No pude extraer ${name}: ${error.message}`);
    }
  }
  console.log(`Sprites de Freedoom extraidos:\n${extracted.join("\n")}`);
}

main();
