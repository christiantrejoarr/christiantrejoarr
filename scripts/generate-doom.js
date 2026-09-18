const fs = require("fs");
const path = require("path");

const USERNAME = "christiantrejoarr";

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
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="DOOM HUD with ${ammo} GitHub contributions as ammo">
  <!-- contributions: ${ammo} -->
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#121214"/>
      <stop offset="100%" stop-color="#2b2c31"/>
    </linearGradient>
    <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8d6a46"/>
      <stop offset="100%" stop-color="#5b4128"/>
    </linearGradient>
    <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3a4038"/>
      <stop offset="100%" stop-color="#555c54"/>
    </linearGradient>
    <linearGradient id="wallR" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#2f3330"/>
      <stop offset="100%" stop-color="#4a504a"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e2b07a"/>
      <stop offset="100%" stop-color="#8a5a32"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6a6a6a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <clipPath id="view">
      <rect width="800" height="392"/>
    </clipPath>
  </defs>

  <rect width="800" height="500" fill="#000"/>

  <g clip-path="url(#view)">
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 5 2; 0 0; -5 2; 0 0" dur="0.85s" repeatCount="indefinite"/>
      <rect width="800" height="210" fill="url(#sky)"/>
      <polygon points="0,392 800,392 800,210 0,210" fill="url(#dirt)"/>
      <polygon points="0,70 0,392 168,392 214,210 214,96" fill="url(#wallL)"/>
      <polygon points="800,86 800,392 632,392 586,210 586,104" fill="url(#wallR)"/>
      <rect x="214" y="96" width="372" height="140" fill="#2a2c28"/>
      <rect x="300" y="132" width="210" height="104" fill="#101010"/>
      <rect x="586" y="104" width="214" height="130" fill="#6d6f72"/>
      <polygon points="610,120 790,108 790,228 610,220" fill="#7a7d80"/>
      <polygon points="630,150 760,146 770,210 640,208" fill="#5a5e4a"/>

      <g fill="#2f6a1c">
        <ellipse cx="90" cy="350" rx="78" ry="18"/>
        <ellipse cx="160" cy="368" rx="70" ry="14"/>
        <ellipse cx="710" cy="348" rx="80" ry="16"/>
        <ellipse cx="640" cy="372" rx="72" ry="13"/>
      </g>
      <g fill="#3f8a24" opacity="0.7">
        <ellipse cx="110" cy="346" rx="30" ry="7"/>
        <ellipse cx="690" cy="344" rx="28" ry="6"/>
      </g>

      <circle cx="176" cy="176" r="7" fill="#ff1a1a">
        <animate attributeName="opacity" values="1;0.25;1" dur="1.1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="176" cy="176" r="16" fill="#ff3a3a" opacity="0.18"/>
      <ellipse cx="392" cy="248" rx="18" ry="7" fill="#7a1a12" opacity="0.9"/>
    </g>
  </g>

  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; 7 10; 0 4; -7 10; 0 0" dur="0.52s" repeatCount="indefinite"/>
    <path d="M286 392 C300 320, 330 268, 368 250 L392 392 Z" fill="url(#skin)"/>
    <path d="M514 392 C500 320, 470 268, 432 250 L408 392 Z" fill="url(#skin)"/>
    <path d="M360 250 L440 250 L456 318 L344 318 Z" fill="url(#steel)"/>
    <rect x="372" y="214" width="56" height="44" rx="4" fill="#2b2b2b"/>
    <rect x="386" y="176" width="28" height="42" rx="3" fill="#1a1a1a"/>
    <rect x="392" y="156" width="16" height="24" fill="#0d0d0d"/>
    <rect x="396" y="148" width="8" height="10" fill="#4a4a4a"/>
    <ellipse cx="348" cy="300" rx="22" ry="14" fill="#c48a58"/>
    <ellipse cx="452" cy="300" rx="22" ry="14" fill="#c48a58"/>
  </g>

  <g opacity="0">
    <animate attributeName="opacity" values="0;0;0.7;0;0;0.55;0;0" keyTimes="0;0.38;0.42;0.48;0.66;0.7;0.76;1" dur="2.2s" repeatCount="indefinite"/>
    <circle cx="400" cy="168" r="26" fill="#ffe08a"/>
  </g>

  <rect x="0" y="392" width="800" height="108" fill="#2a2a2a"/>
  <rect x="0" y="392" width="800" height="5" fill="#111"/>
  <rect x="8" y="402" width="124" height="88" fill="#1a1a1a"/>
  <text x="70" y="436" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="34" fill="#ffff66">${ammo}</text>
  <text x="70" y="478" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="14" fill="#c62828">AMMO</text>
  <rect x="140" y="402" width="150" height="88" fill="#1a1a1a"/>
  <text x="215" y="436" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="34" fill="#ffff66">99%</text>
  <text x="215" y="478" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="14" fill="#c62828">HEALTH</text>
  <rect x="298" y="402" width="86" height="88" fill="#1a1a1a"/>
  <text x="341" y="428" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="13" fill="#c62828">ARMS</text>
  <text x="341" y="452" text-anchor="middle" font-family="Consolas, monospace" font-size="14" fill="#ffff66">2 3 4</text>
  <text x="341" y="474" text-anchor="middle" font-family="Consolas, monospace" font-size="14" fill="#8a8a8a">5 6 7</text>
  <rect x="392" y="402" width="78" height="88" fill="#111"/>
  <rect x="402" y="412" width="58" height="68" fill="#3a2a22"/>
  <circle cx="431" cy="442" r="20" fill="#d2a074"/>
  <rect x="416" y="424" width="12" height="4" fill="#111"/>
  <rect x="434" y="424" width="12" height="4" fill="#111"/>
  <path d="M421 452 Q431 458 441 452" stroke="#6a3a28" stroke-width="2" fill="none"/>
  <rect x="478" y="402" width="150" height="88" fill="#1a1a1a"/>
  <text x="553" y="436" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="34" fill="#ffff66">103%</text>
  <text x="553" y="478" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="14" fill="#c62828">ARMOR</text>
  <rect x="636" y="402" width="156" height="88" fill="#1a1a1a"/>
  <text x="714" y="430" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="12" fill="#c62828">BULL</text>
  <text x="714" y="452" text-anchor="middle" font-family="Consolas, monospace" font-size="16" fill="#ffff66">${ammo} / 200</text>
  <text x="714" y="476" text-anchor="middle" font-family="Consolas, monospace" font-size="12" fill="#8a8a8a">SHELL  0 / 50</text>
</svg>
`;
}

async function main() {
  const ammo = await fetchContributions();
  const outputPath = path.join(__dirname, "..", "assets", "doom-play.svg");
  fs.writeFileSync(outputPath, renderDoom(ammo), "utf8");
  console.log(`DOOM HUD actualizado: AMMO = ${ammo} contribuciones`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
