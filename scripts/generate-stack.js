const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets", "stack");

const LOGOS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/christian-trejo-arroyo/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
  },
  {
    id: "sass",
    name: "Sass",
    href: "https://sass-lang.com/install/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
  },
  {
    id: "scss",
    name: "SCSS",
    href: "https://sass-lang.com/documentation/syntax/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg",
  },
  {
    id: "css3",
    name: "CSS3",
    href: "https://developer.mozilla.org/docs/Web/CSS",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    id: "html5",
    name: "HTML5",
    href: "https://developer.mozilla.org/docs/Web/HTML",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    href: "https://developer.mozilla.org/docs/Web/JavaScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: "typescript",
    name: "TypeScript",
    href: "https://www.typescriptlang.org/download",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    id: "ionic",
    name: "Ionic",
    href: "https://ionicframework.com/docs/intro/cli",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg",
  },
  {
    id: "angular",
    name: "Angular",
    href: "https://angular.dev/installation",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg",
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    href: "https://getbootstrap.com/docs/5.3/getting-started/download/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  },
  {
    id: "materialize",
    name: "Materialize",
    href: "https://materializecss.com/getting-started.html",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materializecss/materializecss-original.svg",
  },
  {
    id: "npm",
    name: "npm",
    href: "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg",
  },
  {
    id: "react-router",
    name: "React Router",
    href: "https://www.npmjs.com/package/react-router",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg",
  },
  {
    id: "react-native",
    name: "React Native",
    href: "https://reactnative.dev/docs/environment-setup",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactnative/reactnative-original.svg",
  },
  {
    id: "react",
    name: "React",
    href: "https://www.npmjs.com/package/react",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    id: "vuejs",
    name: "Vue.js",
    href: "https://www.npmjs.com/package/vue",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    id: "nodejs",
    name: "Node.js",
    href: "https://nodejs.org/en/download",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    id: "yarn",
    name: "Yarn",
    href: "https://yarnpkg.com/getting-started/install",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    href: "https://www.mongodb.com/try/download/community",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    id: "figma",
    name: "Figma",
    href: "https://www.figma.com/downloads/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    id: "jira",
    name: "Jira",
    href: "https://www.atlassian.com/software/jira",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
  },
  {
    id: "postman",
    name: "Postman",
    href: "https://www.postman.com/downloads/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg",
  },
  {
    id: "wordpress",
    name: "WordPress",
    href: "https://wordpress.org/download/",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg",
  },
];

function renderLogo({ id, name, href, dataUri }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="96" height="118" viewBox="0 0 96 118" role="img" aria-label="${name}">
  <title>${name}</title>
  <style>
    .icon {
      transform-origin: 48px 40px;
      transform-box: fill-box;
    }
    .label {
      fill: #c9d1d9;
      font-family: Segoe UI, Arial, sans-serif;
      font-size: 11px;
      font-weight: 600;
      opacity: 0;
      transform: translateY(-22px);
      transition: opacity 0.12s linear, transform 0.35s cubic-bezier(0.18, 1.4, 0.32, 1);
    }
    svg:hover .icon,
    a:hover .icon {
      animation: dogshake 0.55s ease-in-out;
    }
    svg:hover .label,
    a:hover .label {
      opacity: 1;
      transform: translateY(0);
      transition-delay: 0.14s;
    }
    @keyframes dogshake {
      0% { transform: rotate(0deg) scale(1, 1); }
      12% { transform: rotate(-22deg) scale(1.08, 0.9); }
      24% { transform: rotate(22deg) scale(0.92, 1.08); }
      36% { transform: rotate(-18deg) scale(1.06, 0.92); }
      48% { transform: rotate(18deg) scale(0.94, 1.06); }
      60% { transform: rotate(-10deg) scale(1.03, 0.97); }
      72% { transform: rotate(10deg) scale(0.97, 1.03); }
      84% { transform: rotate(-4deg) scale(1.01, 0.99); }
      100% { transform: rotate(0deg) scale(1, 1); }
    }
  </style>
  <a href="${href}" target="_blank" rel="noopener noreferrer">
    <rect width="96" height="118" fill="transparent"/>
    <g class="icon">
      <image href="${dataUri}" xlink:href="${dataUri}" x="20" y="12" width="56" height="56"/>
    </g>
    <clipPath id="drop-${id}">
      <rect x="0" y="70" width="96" height="48"/>
    </clipPath>
    <g clip-path="url(#drop-${id})">
      <text class="label" x="48" y="96" text-anchor="middle">${name}</text>
    </g>
  </a>
</svg>
`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const logo of LOGOS) {
    const response = await fetch(logo.src, {
      headers: { "User-Agent": "christiantrejoarr-stack-logos" },
    });
    if (!response.ok) {
      throw new Error(`No pude descargar ${logo.name} (${response.status})`);
    }
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(
      await response.arrayBuffer()
    ).toString("base64")}`;
    fs.writeFileSync(
      path.join(OUT_DIR, `${logo.id}.svg`),
      renderLogo({ ...logo, dataUri }),
      "utf8"
    );
    console.log(`listo ${logo.id}.svg`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
