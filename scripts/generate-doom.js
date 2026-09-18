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
const CYCLE = 5;

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

function discreteOpacity(windows, dur) {
  const samples = new Set([0, dur]);
  windows.forEach(([start, end]) => {
    samples.add(start);
    samples.add(end);
  });
  const times = [...samples].sort((a, b) => a - b);
  const values = times.map((time) =>
    windows.some(([start, end]) => time >= start && time < end) ? 1 : 0
  );
  const keyTimes = times.map((time) => (time / dur).toFixed(4)).join(";");
  return `<animate attributeName="opacity" values="${values.join(";")}" keyTimes="${keyTimes}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`;
}

function pistolSprite(name, width, height) {
  const w = width * SCALE;
  const h = height * SCALE;
  const x = (WIDTH - w) / 2;
  const y = BAR_Y - h + 8;
  return { name, x, y, w, h };
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
  const idle = pistolSprite("PISGA0", 82, 92);
  const fire = pistolSprite("PISGB0", 82, 96);
  const cock = pistolSprite("PISGC0", 84, 100);
  const mid = pistolSprite("PISGD0", 84, 106);
  const reload = pistolSprite("PISGE0", 86, 120);
  const flashW = 32 * SCALE;
  const flashH = 30 * SCALE;
  const flashX = fire.x + (fire.w - flashW) / 2 - 18;
  const flashY = fire.y - flashH * 0.22;
  const phpW = 176;
  const phpH = 176;

  const fireWin = [[0.0, 0.18]];
  const cockDown = [[0.18, 0.32]];
  const midDown = [[0.32, 0.46]];
  const reloadWin = [[0.46, 0.72]];
  const midUp = [[0.72, 0.86]];
  const cockUp = [[0.86, 1.0]];
  const idleWin = [[1.0, CYCLE]];

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
    ${image("SKY1", -40, -20, WIDTH + 80, 280, ' preserveAspectRatio="xMidYMid slice"')}
    <polygon points="0,${VIEW_H} ${WIDTH},${VIEW_H} ${WIDTH},210 0,210" fill="url(#floor)"/>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 5 -8; 0 5; -5 -6; 0 0" dur="3.2s" repeatCount="indefinite"/>
      <polygon points="0,70 0,${VIEW_H} 190,${VIEW_H} 240,210 240,90" fill="url(#brick)"/>
      <polygon points="${WIDTH},80 ${WIDTH},${VIEW_H} 610,${VIEW_H} 560,210 560,96" fill="url(#brick)"/>
      <polygon points="0,330 210,250 210,${VIEW_H} 0,${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
      <polygon points="${WIDTH},328 590,250 590,${VIEW_H} ${WIDTH},${VIEW_H}" fill="url(#nukage)" opacity="0.92"/>
    </g>
    <g>
      <animateTransform attributeName="transform" type="translate" values="400 155; 410 140; 400 164; 390 144; 400 155" dur="3.2s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-5; 5; -3; 4; -5" dur="3.2s" repeatCount="indefinite"/>
        ${image("php", -phpW / 2, -phpH / 2, phpW, phpH, ' preserveAspectRatio="xMidYMid meet"')}
      </g>
    </g>
  </g>

  <g>
    <g opacity="0">
      ${discreteOpacity(idleWin, CYCLE)}
      ${image(idle.name, idle.x, idle.y, idle.w, idle.h)}
    </g>
    <g>
      ${discreteOpacity(fireWin, CYCLE)}
      ${image("PISFA0", flashX, flashY, flashW, flashH)}
      ${image(fire.name, fire.x, fire.y, fire.w, fire.h)}
    </g>
    <g opacity="0">
      ${discreteOpacity([...cockDown, ...cockUp], CYCLE)}
      ${image(cock.name, cock.x, cock.y, cock.w, cock.h)}
    </g>
    <g opacity="0">
      ${discreteOpacity([...midDown, ...midUp], CYCLE)}
      ${image(mid.name, mid.x, mid.y, mid.w, mid.h)}
    </g>
    <g opacity="0">
      ${discreteOpacity(reloadWin, CYCLE)}
      ${image(reload.name, reload.x, reload.y, reload.w, reload.h)}
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
