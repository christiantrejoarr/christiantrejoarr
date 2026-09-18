const fs = require("fs");
const path = require("path");

const USERNAME = "christiantrejoarr";
const SPRITE_DIR = path.join(__dirname, "..", "assets", "doom");
const SCALE = 2.5;
const WIDTH = 800;
const VIEW_H = 420;
const BAR_Y = 420;
const NUM_W = 13 * SCALE;
const NUM_H = 16 * SCALE;

function uri(name) {
  const filePath = path.join(SPRITE_DIR, `${name}.png`);
  return `data:image/png;base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function image(name, x, y, width, height, extra = "") {
  return `<image href="${uri(name)}" x="${x}" y="${y}" width="${width}" height="${height}"${extra}/>`;
}

function numberRow(value, rightX, y) {
  const glyphs = String(value).split("");
  let x = rightX - glyphs.length * NUM_W;
  return glyphs
    .map((digit) => {
      const node = image(`STTNUM${digit}`, x, y, NUM_W, NUM_H);
      x += NUM_W;
      return node;
    })
    .join("\n  ");
}

function percent(value, rightX, y) {
  return `${numberRow(value, rightX, y)}
  ${image("STTPRCNT", rightX, y, NUM_W, NUM_H)}`;
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
  const idleH = 92 * SCALE;
  const fireH = 96 * SCALE;
  const pistolX = (WIDTH - pistolW) / 2;
  const idleY = BAR_Y - idleH + 8;
  const fireY = BAR_Y - fireH + 8;
  const flashW = 32 * SCALE;
  const flashH = 30 * SCALE;
  const flashX = pistolX + (pistolW - flashW) / 2 - 18;
  const flashY = fireY - flashH * 0.22;
  const phpW = 176;
  const phpH = 176;

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
      ${image("SKY1", -40, -20, WIDTH + 80, 280, ' preserveAspectRatio="xMidYMid slice"')}
      <polygon points="0,${VIEW_H} ${WIDTH},${VIEW_H} ${WIDTH},210 0,210" fill="url(#floor)"/>
      <polygon points="0,70 0,${VIEW_H} 190,${VIEW_H} 240,210 240,90" fill="url(#brick)"/>
      <polygon points="${WIDTH},80 ${WIDTH},${VIEW_H} 610,${VIEW_H} 560,210 560,96" fill="url(#brick)"/>
      <polygon points="0,330 210,250 210,${VIEW_H} 0,${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
      <polygon points="${WIDTH},328 590,250 590,${VIEW_H} ${WIDTH},${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="400 155; 392 148; 408 160; 400 155; 400 155" keyTimes="0;0.03;0.06;0.10;1" dur="10s" repeatCount="indefinite"/>
        ${image("php", -phpW / 2, -phpH / 2, phpW, phpH, ' preserveAspectRatio="xMidYMid meet"')}
      </g>
    </g>
  </g>

  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 8 10; 0 4; -8 10; 0 0" dur="0.5s" repeatCount="indefinite"/>
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.06;0.08;1" dur="10s" repeatCount="indefinite"/>
      ${image("PISGA0", pistolX, idleY, pistolW, idleH)}
    </g>
    <g>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.06;0.08;1" dur="10s" repeatCount="indefinite"/>
      ${image("PISFA0", flashX, flashY, flashW, flashH)}
      ${image("PISGB0", pistolX, fireY, pistolW, fireH)}
    </g>
  </g>

  ${image("STBAR", 0, BAR_Y, WIDTH, 80)}
  ${image("STARMS", armsX, BAR_Y, 38 * SCALE, 32 * SCALE)}
  ${numberRow(ammo, 44 * SCALE, ammoY)}
  ${percent(99, 90 * SCALE, ammoY)}
  ${percent(100, 221 * SCALE, ammoY)}
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
