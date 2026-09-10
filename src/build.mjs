import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { THEMES } from './theme.mjs'
import { hero } from './hero.mjs'
import { activityCard, languagesCard } from './cards.mjs'
import { projectCard } from './projects.mjs'

// Projetos em destaque. O blurb sobrescreve a descricao do GitHub quando ela
// esta vazia ou longa demais para dois renglones.
const FEATURED = [
  { repo: 'web-scraping-tribunais-aws' },
  { repo: 'document-automation-llm-drive' },
  { repo: 'chatbot-juridico-gerador-peticao' },
  { repo: 'transcreve_audio',
    blurb: 'Transcrição de áudio com Whisper via Groq. API FastAPI, conversão OGG para WAV com ffmpeg e front PWA.' },
]

const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url)))
const out = new URL('../assets/', import.meta.url)
mkdirSync(out, { recursive: true })

const write = (name, content) => {
  writeFileSync(new URL(name, out), content)
  console.log(`  ${name}  ${(content.length / 1024).toFixed(1)} KB`)
}

for (const theme of Object.values(THEMES)) {
  write(`hero-${theme.id}.svg`, hero(theme, data))
  write(`activity-${theme.id}.svg`, activityCard(theme, data))
  write(`langs-${theme.id}.svg`, languagesCard(theme, data))
  FEATURED.forEach((f, i) => {
    const repo = data.repos.find((r) => r.name === f.repo)
    if (!repo) throw new Error(`repositorio em destaque nao encontrado: ${f.repo}`)
    write(`project-${i + 1}-${theme.id}.svg`, projectCard(theme, { ...repo, description: f.blurb ?? repo.description }))
  })
}
