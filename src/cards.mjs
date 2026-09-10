// Cards de atividade e linguagens — substituem os do github-readme-stats.
// Ficam lado a lado no README, 430px cada.

import { svg, backdrop, MONO, SANS, esc } from './theme.mjs'

const W = 430
const H = 232
const PAD = 22

function header(t, label) {
  return `
  <rect x="${PAD}" y="24" width="3" height="15" rx="1.5" fill="${t.accent}"/>
  <text x="${PAD + 12}" y="36" class="h" fill="${t.text}">${esc(label)}</text>
  <line x1="${PAD}" y1="52" x2="${W - PAD}" y2="52" stroke="${t.borderSoft}"/>`
}

const baseCss = (t) => `
.h{font:700 12px ${MONO};letter-spacing:2.2px}
.big{font:700 27px ${MONO};letter-spacing:-.5px}
.cap{font:400 10.5px ${SANS};letter-spacing:.4px}
.lbl{font:500 12px ${MONO}}
.pct{font:400 11px ${MONO};text-anchor:end}
.yr{font:400 9.5px ${MONO};text-anchor:middle}
.note{font:400 10px ${SANS};text-anchor:middle}

/* As barras nascem completas. A animacao so encolhe o inicio e devolve ao
   tamanho natural, entao sem CSS elas continuam corretas. */
.bar{transform-box:fill-box;transform-origin:left center;animation:grow .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes grow{from{transform:scaleX(0)}}
.col{transform-box:fill-box;transform-origin:bottom;animation:rise .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes rise{from{transform:scaleY(0)}}
`

export function activityCard(t, data) {
  // O terceiro numero se adapta ao token: com um PAT o total inclui os repos
  // privados e "publicos" diz algo; com o GITHUB_TOKEN os dois sao iguais e
  // repetir o mesmo numero nao informa nada.
  const stats = [
    { n: data.commits, cap: 'commits no ano' },
    { n: data.repoCount, cap: 'repositórios' },
    data.repoCount > data.publicRepoCount
      ? { n: data.publicRepoCount, cap: 'públicos' }
      : { n: data.languages.length, cap: 'linguagens' },
  ]
  const colW = (W - PAD * 2) / 3
  const numbers = stats.map((s, i) => {
    const cx = PAD + colW * i + colW / 2
    return `
    <text x="${cx}" y="88" class="big" fill="${t.text}" text-anchor="middle">${s.n}</text>
    <text x="${cx}" y="105" class="cap" fill="${t.muted}" text-anchor="middle">${esc(s.cap)}</text>`
  }).join('')

  // Barras de repos por ano — a curva de atividade.
  const years = data.activity
  const max = Math.max(...years.map((y) => y.count))
  const chartTop = 128
  const chartH = 46
  const slot = (W - PAD * 2) / years.length
  const bw = Math.min(34, slot - 12)
  const cols = years.map((y, i) => {
    const h = Math.max(3, Math.round((y.count / max) * chartH))
    const x = PAD + slot * i + (slot - bw) / 2
    const yTop = chartTop + chartH - h
    const last = i === years.length - 1
    return `
    <rect class="col" x="${x}" y="${yTop}" width="${bw}" height="${h}" rx="3"
          fill="${last ? t.accent : t.accent}" fill-opacity="${last ? 1 : 0.32}"
          style="animation-delay:${(i * 0.07).toFixed(2)}s"/>
    <text x="${x + bw / 2}" y="${chartTop + chartH + 15}" class="yr" fill="${t.muted}">${esc(y.year)}</text>`
  }).join('')

  const body = `
  ${backdrop(t, W, H)}
  ${header(t, 'ATIVIDADE')}
  ${numbers}
  ${cols}
  <text x="${W / 2}" y="${H - 14}" class="note" fill="${t.muted}">repositórios com push por ano</text>`

  return svg({ w: W, h: H, title: 'Atividade no GitHub', body, css: baseCss(t) })
}

export function languagesCard(t, data) {
  const langs = data.languages.slice(0, 6)
  const rowH = 23
  const top = 72
  const trackX = 128
  const trackW = W - PAD - trackX - 42

  const rows = langs.map((l, i) => {
    const y = top + rowH * i
    const w = Math.max(4, Math.round((l.pct / langs[0].pct) * trackW))
    return `
    <circle cx="${PAD + 5}" cy="${y - 4}" r="4.5" fill="${l.color || t.muted}"/>
    <text x="${PAD + 17}" y="${y}" class="lbl" fill="${t.text}">${esc(l.name)}</text>
    <rect x="${trackX}" y="${y - 9}" width="${trackW}" height="7" rx="3.5" fill="${t.borderSoft}"/>
    <rect class="bar" x="${trackX}" y="${y - 9}" width="${w}" height="7" rx="3.5"
          fill="${l.color || t.accent}" style="animation-delay:${(i * 0.07).toFixed(2)}s"/>
    <text x="${W - PAD}" y="${y}" class="pct" fill="${t.muted}">${l.pct.toFixed(0)}%</text>`
  }).join('')

  const body = `
  ${backdrop(t, W, H)}
  ${header(t, 'LINGUAGENS')}
  ${rows}
  <text x="${W / 2}" y="${H - 14}" class="note" fill="${t.muted}">por número de repositórios, não por bytes</text>`

  return svg({ w: W, h: H, title: 'Linguagens mais usadas', body, css: baseCss(t) })
}
