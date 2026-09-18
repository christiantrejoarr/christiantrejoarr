const fs = require("fs");
const path = require("path");

const USERNAME = "christiantrejoarr";
const SPRITE_DIR = path.join(__dirname, "..", "assets", "doom");
const SCALE = 2.5;
const WIDTH = 800;
const VIEW_H = 420;
const BAR_Y = 420;

function uri(name) {
  const filePath = path.join(SPRITE_DIR, `${name}.png`);
  return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function image(name, x, y, width, height) {
  return `<image href="${uri(name)}" x="${x}" y="${y}" width="${width}" height="${height}"/>`;
}

function numberRow(value, rightX, y) {
  const glyphs = String(value).split("");
  const w = 13 * SCALE;
  const h = 16 * SCALE;
  let x = rightX - glyphs.length * w;
  return glyphs
    .map((digit) => {
      const node = image(`STTNUM${digit}`, x, y, w, h);
      x += w;
      return node;
    })
    .join("\n  ");
}

async function fetchContributions() {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=all`,
    { headers: { "User-Agent": "christiantrejoarr-doom-hud" } }
  );
  if (!response.ok) {
    throw new Error(`No pude leer contribuciones (${response.status})`);
  }
  const data = await response.json();
  const total = Object.values(data.total || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
  if (!Number.isFinite(total)) {
    throw new Error("El total de contribuciones no es valido");
  }
  return total;
}

function renderDoom(ammo) {
  const ammoY = 171 * SCALE;
  const faceX = 143 * SCALE;
  const faceY = 168 * SCALE;
  const armsX = 104 * SCALE;
  const pistolW = 82 * SCALE;
  const pistolH = 92 * SCALE;
  const pistolX = (WIDTH - pistolW) / 2;
  const pistolY = BAR_Y - pistolH + 8;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="500" viewBox="0 0 ${WIDTH} 500" role="img" aria-label="Freedoom HUD with ${ammo} GitHub contributions as ammo">
  <!-- contributions: ${ammo} -->
  <defs>
    <pattern id="floor" patternUnits="userSpaceOnUse" width="160" height="160">
      ${image("FLOOR7_1", 0, 0, 160, 160)}
    </pattern>
    <pattern id="nukage" patternUnits="userSpaceOnUse" width="128" height="48">
      ${image("NUKAGE1", 0, 0, 128, 48)}
    </pattern>
    <pattern id="brick" patternUnits="userSpaceOnUse" width="160" height="160">
      ${image("BROWN1", 0, 0, 160, 160)}
    </pattern>
    <clipPath id="view">
      <rect width="${WIDTH}" height="${VIEW_H}"/>
    </clipPath>
  </defs>

  <rect width="${WIDTH}" height="500" fill="#000"/>

  <g clip-path="url(#view)">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 6 2; 0 0; -6 2; 0 0" dur="0.8s" repeatCount="indefinite"/>
      ${image("SKY1", 0, 0, WIDTH, 210)}
      <polygon points="0,${VIEW_H} ${WIDTH},${VIEW_H} ${WIDTH},210 0,210" fill="url(#floor)"/>
      <polygon points="0,70 0,${VIEW_H} 190,${VIEW_H} 240,210 240,90" fill="url(#brick)"/>
      <polygon points="${WIDTH},80 ${WIDTH},${VIEW_H} 610,${VIEW_H} 560,210 560,96" fill="url(#brick)"/>
      <polygon points="0,330 210,250 210,${VIEW_H} 0,${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
      <polygon points="${WIDTH},328 590,250 590,${VIEW_H} ${WIDTH},${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="400 250; 392 246; 408 252; 400 250" dur="1.1s" repeatCount="indefinite"/>
        ${image("TROOA1", -72, -110, 144, 180)}
      </g>
    </g>
  </g>

  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 8 10; 0 4; -8 10; 0 0" dur="0.5s" repeatCount="indefinite"/>
    ${image("PISGA0", pistolX, pistolY, pistolW, pistolH)}
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;0;0;1;0;0" keyTimes="0;0.4;0.44;0.5;0.68;0.72;0.78;1" dur="2.2s" repeatCount="indefinite"/>
      ${image("PISFA0", pistolX + 88, pistolY + 8, 32 * SCALE, 30 * SCALE)}
    </g>
  </g>

  ${image("STBAR", 0, BAR_Y, WIDTH, 80)}
  ${image("STARMS", armsX, BAR_Y, 38 * SCALE, 32 * SCALE)}
  ${numberRow(ammo, 44 * SCALE, ammoY)}
  ${numberRow(99, (90 - 13) * SCALE, ammoY)}
  ${image("STTPRCNT", (90 - 13) * SCALE, ammoY, 13 * SCALE, 16 * SCALE)}
  ${numberRow(100, (221 - 13) * SCALE, ammoY)}
  ${image("STTPRCNT", (221 - 13) * SCALE, ammoY, 13 * SCALE, 16 * SCALE)}
  <g>
    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.28;0.33;0.66;0.71" dur="2.4s" repeatCount="indefinite"/>
    ${image("STFST00", faceX, faceY, 24 * SCALE, 29 * SCALE)}
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.33;0.38;0.62;0.67" dur="2.4s" repeatCount="indefinite"/>
    ${image("STFST01", faceX, faceY, 24 * SCALE, 29 * SCALE)}
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.67;0.72;0.95;1" dur="2.4s" repeatCount="indefinite"/>
    ${image("STFST02", faceX, faceY, 24 * SCALE, 29 * SCALE)}
  </g>
</svg>
`;
}

async function main() {
  const ammo = await fetchContributions();
  const outputPath = path.join(__dirname, "..", "assets", "doom-play.svg");
  fs.writeFileSync(outputPath, renderDoom(ammo), "utf8");
  console.log(`DOOM HUD actualizado con sprites de Freedoom: AMMO = ${ammo}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
