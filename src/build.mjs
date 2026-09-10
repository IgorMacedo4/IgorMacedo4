import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { THEMES } from './theme.mjs'
import { scan } from './scan.mjs'
import { activityCard, languagesCard } from './cards.mjs'


const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url)))
const out = new URL('../assets/', import.meta.url)
mkdirSync(out, { recursive: true })

const write = (name, content) => {
  writeFileSync(new URL(name, out), content)
  console.log(`  ${name}  ${(content.length / 1024).toFixed(1)} KB`)
}

for (const theme of Object.values(THEMES)) {
  write(`hero-${theme.id}.svg`, scan(theme, data))
  write(`activity-${theme.id}.svg`, activityCard(theme, data))
  write(`langs-${theme.id}.svg`, languagesCard(theme, data))
}
