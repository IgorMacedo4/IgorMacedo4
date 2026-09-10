// Hero: o pipeline de dados que descreve o trabalho real —
// tribunais -> scraper -> LLM -> dados estruturados.

import { svg, backdrop, stageColor, MONO, SANS, esc } from './theme.mjs'

const W = 880
const H = 310

const STAGES = [
  { label: 'TRIBUNAIS', sub: 'fontes públicas' },
  { label: 'SCRAPER', sub: 'python · lambda' },
  { label: 'LLM', sub: 'extrai prazos' },
  { label: 'DADOS', sub: '{ prazo, parte }' },
]

const NODE_W = 136
const NODE_H = 76
const NODE_Y = 170
const MID = NODE_Y + NODE_H / 2
const XS = [46, 263, 481, 698]

const CYCLE = 2.1 // segundos por pacote
const PACKETS = 3 // pacotes simultaneos por trecho

export function hero(t, data) {
  const color = stageColor(t)

  const nodes = STAGES.map((stage, i) => {
    const x = XS[i]
    const c = color[i]
    return `
  <g class="node n${i}">
    <rect class="glow" x="${x - 3}" y="${NODE_Y - 3}" width="${NODE_W + 6}" height="${NODE_H + 6}" rx="11" fill="none" stroke="${c}" stroke-width="2"/>
    <rect x="${x}" y="${NODE_Y}" width="${NODE_W}" height="${NODE_H}" rx="9" fill="${t.panel}" stroke="${c}" stroke-opacity="0.55"/>
    <rect x="${x}" y="${NODE_Y}" width="${NODE_W}" height="3" rx="1.5" fill="${c}"/>
    <text x="${x + NODE_W / 2}" y="${NODE_Y + 33}" class="nlabel" fill="${t.text}">${esc(stage.label)}</text>
    <text x="${x + NODE_W / 2}" y="${NODE_Y + 54}" class="nsub" fill="${t.muted}">${esc(stage.sub)}</text>
  </g>`
  }).join('')

  // Trechos: linha-guia, linha de fluxo tracejada e os pacotes viajando.
  const links = [0, 1, 2].map((i) => {
    const from = XS[i] + NODE_W + 8
    const to = XS[i + 1] - 14
    const c = color[i + 1] // o pacote chega ja com a cor do proximo estagio
    const packets = Array.from({ length: PACKETS }, (_, p) => {
      const delay = (i * 0.22 + (p * CYCLE) / PACKETS).toFixed(2)
      return `<circle class="pkt" r="3.5" fill="${c}" style="animation-name:seg${i};animation-delay:${delay}s"/>`
    }).join('')
    return `
  <g class="link">
    <line x1="${from}" y1="${MID}" x2="${to}" y2="${MID}" stroke="${t.border}" stroke-width="2"/>
    <line class="dash" x1="${from}" y1="${MID}" x2="${to}" y2="${MID}" stroke="${c}" stroke-width="2" stroke-opacity="0.45" stroke-dasharray="4 6"/>
    <path d="M${to} ${MID - 5} L${to + 7} ${MID} L${to} ${MID + 5} Z" fill="${c}" fill-opacity="0.8"/>
    ${packets}
  </g>`
  }).join('')

  const segKeyframes = [0, 1, 2].map((i) => {
    const from = XS[i] + NODE_W + 8
    const to = XS[i + 1] - 14
    return `@keyframes seg${i}{
  0%{transform:translate(${from}px,${MID}px);opacity:0}
  15%{opacity:1}
  85%{opacity:1}
  100%{transform:translate(${to}px,${MID}px);opacity:0}
}`
  }).join('\n')

  const footer = [
    `${data.commits} commits`,
    `${data.repoCount} repositórios`,
    `${data.contributionsYear} contribuições em ${new Date().getFullYear()}`,
  ].join('   ·   ')

  const body = `
  ${backdrop(t, W, H)}
  <g>
    <rect x="46" y="46" width="4" height="22" rx="2" fill="${t.accent}"/>
    <text x="62" y="65" class="title" fill="${t.text}">IGOR MACEDO</text>
    <text x="62" y="92" class="role" fill="${t.muted}">Full Stack Developer &#183; AI &amp; ML Engineer &#183; Web Scraping</text>
    <line x1="46" y1="116" x2="${W - 46}" y2="116" stroke="${t.borderSoft}"/>
    <g class="live">
      <circle cx="${W - 118}" cy="57" r="4" fill="${t.green}"/>
      <text x="${W - 106}" y="62" class="livet" fill="${t.muted}">shipping</text>
    </g>
  </g>
  <g class="pipe">
    ${links}
    ${nodes}
  </g>
  <text x="${W / 2}" y="${H - 34}" class="foot" fill="${t.muted}">${esc(footer)}</text>`

  const css = `
.title{font:700 30px ${MONO};letter-spacing:4px}
.role{font:400 14px ${SANS};letter-spacing:.3px}
.livet{font:500 12px ${MONO};letter-spacing:1px}
.foot{font:400 12.5px ${MONO};letter-spacing:.6px;text-anchor:middle}
.nlabel{font:700 15px ${MONO};letter-spacing:1.6px;text-anchor:middle}
.nsub{font:400 11px ${MONO};text-anchor:middle}

/* Pacotes comecam invisiveis: sao decorativos. Sem animacao, o pipeline
   continua legivel — so fica parado. */
.pkt{opacity:0;animation:none ${CYCLE}s linear infinite}
${segKeyframes}

.dash{animation:drift 1.1s linear infinite}
@keyframes drift{to{stroke-dashoffset:-10}}

.glow{opacity:0;animation:breathe ${CYCLE}s ease-in-out infinite}
.n0 .glow{animation-delay:0s}
.n1 .glow{animation-delay:.5s}
.n2 .glow{animation-delay:1s}
.n3 .glow{animation-delay:1.5s}
@keyframes breathe{0%,100%{opacity:0}45%{opacity:${t.glow}}}

.live circle{animation:blink 2.4s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
`

  return svg({ w: W, h: H, title: `${data.name} — pipeline`, body, css })
}
