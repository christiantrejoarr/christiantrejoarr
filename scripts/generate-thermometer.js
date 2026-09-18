const fs = require("fs");
const path = require("path");

const USERNAME = "christiantrejoarr";
const TUBE_TOP = 72;
const TUBE_BOTTOM = 312;
const TUBE_HEIGHT = TUBE_BOTTOM - TUBE_TOP;
const SCALE = [
  [0, 0],
  [10, 0.2],
  [100, 0.4],
  [1000, 0.6],
  [10000, 0.8],
  [100000, 1],
];

function fillRatio(count) {
  if (count <= 0) return 0;
  if (count >= 100000) return 1;

  for (let i = 0; i < SCALE.length - 1; i += 1) {
    const [startCount, startPos] = SCALE[i];
    const [endCount, endPos] = SCALE[i + 1];
    if (count <= endCount) {
      if (startCount === 0) {
        return startPos + (endPos - startPos) * (count / endCount);
      }
      const t =
        (Math.log10(count) - Math.log10(startCount)) /
        (Math.log10(endCount) - Math.log10(startCount));
      return startPos + (endPos - startPos) * t;
    }
  }

  return 1;
}

function heatFor(count) {
  if (count >= 10000) {
    return {
      label: "ARDIENDO",
      text: "#ff6b4a",
      stops: ["#7a1010", "#e32424", "#ff6b4a"],
    };
  }
  if (count >= 1000) {
    return {
      label: "CALIENTE",
      text: "#ff7a18",
      stops: ["#9a3b00", "#ff7a18", "#ffd166"],
    };
  }
  if (count >= 100) {
    return {
      label: "TIBIO",
      text: "#f7b801",
      stops: ["#9a6b00", "#f7b801", "#ffe08a"],
    };
  }
  if (count >= 10) {
    return {
      label: "TEMPLADO",
      text: "#74c0fc",
      stops: ["#0b4f8a", "#4dabf7", "#a5d8ff"],
    };
  }
  return {
    label: "FRIO",
    text: "#91a7ff",
    stops: ["#1c3d5a", "#4c6ef5", "#d0ebff"],
  };
}

function parseCount(svg) {
  const values = [...svg.matchAll(/>([\d,]+)<\/text>/g)]
    .map((match) => match[1].replace(/,/g, ""))
    .filter((value) => /^\d+$/.test(value));

  if (!values.length) {
    throw new Error("No pude leer el contador de visitas.");
  }

  return Number(values[values.length - 1]);
}

async function fetchVisitCount() {
  const url = `https://komarev.com/ghpvc/?username=${USERNAME}&style=flat&label=visitas&t=${Date.now()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "christiantrejoarr-visit-thermometer" },
  });

  if (!response.ok) {
    throw new Error(`No pude consultar visitas (${response.status}).`);
  }

  return parseCount(await response.text());
}

function tickY(position) {
  return TUBE_BOTTOM - TUBE_HEIGHT * position;
}

function renderThermometer(count) {
  const ratio = fillRatio(count);
  const fillHeight = Math.max(10, TUBE_HEIGHT * ratio);
  const mercuryY = TUBE_BOTTOM - fillHeight;
  const heat = heatFor(count);
  const prettyCount = count.toLocaleString("es-MX");
  const ticks = [
    ["100K", 1],
    ["10K", 0.8],
    ["1K", 0.6],
    ["100", 0.4],
    ["10", 0.2],
    ["0", 0],
  ];

  const tickMarkup = ticks
    .map(([label, position]) => {
      const y = tickY(position).toFixed(1);
      const major = position === 0 || position === 1;
      const x2 = major ? 176 : 170;
      return `
      <line x1="158" y1="${y}" x2="${x2}" y2="${y}" stroke="#8b949e" stroke-width="${major ? 2 : 1.5}"/>
      <text x="182" y="${(Number(y) + 4).toFixed(1)}" font-family="Segoe UI, Ubuntu, sans-serif" font-size="11" fill="#8b949e">${label}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="460" viewBox="0 0 280 460" role="img" aria-label="Termometro de visitas reales: ${prettyCount}">
  <!-- visits: ${count} -->
  <defs>
    <linearGradient id="mercury" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${heat.stops[0]}"/>
      <stop offset="55%" stop-color="${heat.stops[1]}"/>
      <stop offset="100%" stop-color="${heat.stops[2]}"/>
    </linearGradient>
    <linearGradient id="bulb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${heat.stops[2]}"/>
      <stop offset="100%" stop-color="${heat.stops[0]}"/>
    </linearGradient>
    <clipPath id="tubeClip">
      <rect x="128" y="${TUBE_TOP}" width="24" height="${TUBE_HEIGHT}" rx="12"/>
    </clipPath>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="8" y="8" width="264" height="444" rx="24" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
  <text x="140" y="36" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-size="15" font-weight="700" fill="#f0f6fc">Termometro de visitas</text>
  <text x="140" y="54" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-size="10" fill="#8b949e">lecturas reales del perfil</text>

  <rect x="126" y="${TUBE_TOP - 4}" width="28" height="${TUBE_HEIGHT + 8}" rx="14" fill="#161b22" stroke="#8b949e" stroke-width="2"/>
  <g clip-path="url(#tubeClip)">
    <rect x="128" y="${mercuryY.toFixed(1)}" width="24" height="${fillHeight.toFixed(1)}" fill="url(#mercury)" filter="url(#glow)"/>
  </g>
  <rect x="134" y="${TUBE_TOP + 8}" width="5" height="188" rx="2.5" fill="#ffffff" opacity="0.22"/>

  <circle cx="140" cy="348" r="38" fill="url(#bulb)" filter="url(#glow)"/>
  <circle cx="140" cy="348" r="26" fill="${heat.stops[1]}"/>
  <circle cx="128" cy="336" r="8" fill="#ffffff" opacity="0.28"/>

  ${tickMarkup}

  <text x="140" y="408" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-size="22" font-weight="700" fill="#f0f6fc">${prettyCount}</text>
  <text x="140" y="426" text-anchor="middle" font-family="Segoe UI, Ubuntu, sans-serif" font-size="11" fill="${heat.text}">${heat.label} · visitas reales</text>
</svg>
`;
}

async function main() {
  const count = await fetchVisitCount();
  const outputPath = path.join(__dirname, "..", "assets", "thermometer.svg");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderThermometer(count), "utf8");
  console.log(`Termometro actualizado con ${count} visitas reales`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
