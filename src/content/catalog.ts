import { markdownSections, parseFrontmatter } from './frontmatter.ts'
import type { Dataset, Exercise, Lesson, TheoryLesson, Topic } from './types.ts'

const lessonFiles = import.meta.glob('../../content/topics/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const sqlFiles = import.meta.glob('../../content/datasets/*.sql', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const indexFiles = import.meta.glob('../../content/datasets/index.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

type TopicDraft = {
  folder: string
  id: string
  title: string
  kicker: string
  blurb: string
  lessons: { file: string; lesson: Lesson }[]
}

const problems: string[] = []

function problem(path: string, message: string) {
  problems.push(`${path}: ${message}`)
}

function fileParts(path: string): { folder: string; file: string } {
  const parts = path.replace(/\\/g, '/').split('/')
  return { folder: parts.at(-2) ?? '', file: parts.at(-1) ?? path }
}

function text(value: unknown, path: string, key: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    problem(path, `поле ${key} должно быть непустой строкой`)
    return ''
  }
  return value.trim()
}

const sqlByName = new Map<string, string>()
for (const [path, sql] of Object.entries(sqlFiles)) {
  sqlByName.set(fileParts(path).file, sql.replace(/\r\n/g, '\n').trim())
}

const indexPath = Object.keys(indexFiles)[0]
const indexValue = indexPath ? indexFiles[indexPath] : undefined
const datasetRows: Dataset[] = []
const seenDatasetIds = new Set<string>()

if (!Array.isArray(indexValue)) {
  problem('content/datasets/index.json', 'нужен массив баз')
} else {
  for (const row of indexValue) {
    if (!row || typeof row !== 'object') {
      problem('content/datasets/index.json', 'элемент должен быть объектом')
      continue
    }
    const item = row as Record<string, unknown>
    const id = text(item.id, 'content/datasets/index.json', 'id')
    const title = text(item.title, `content/datasets/${id || '?'}.json`, 'title')
    const note = text(item.note, `content/datasets/${id || '?'}.json`, 'note')
    const order = item.order
    if (typeof order !== 'number') problem(`content/datasets/${id}`, 'поле order должно быть числом')
    if (!id) continue
    if (seenDatasetIds.has(id)) problem(`content/datasets/${id}`, 'такой id уже есть')
    seenDatasetIds.add(id)
    const visible = sqlByName.get(`${id}.sql`)
    const hidden = sqlByName.get(`${id}.hidden.sql`)
    if (visible === undefined) problem(`content/datasets/${id}.sql`, 'нет видимой базы')
    if (hidden === undefined) problem(`content/datasets/${id}.hidden.sql`, 'нет скрытой базы')
    datasetRows.push({ id, title, note, sql: visible ?? '', order: typeof order === 'number' ? order : 0 })
  }
}

for (const name of sqlByName.keys()) {
  const id = name.replace(/\.hidden\.sql$/, '').replace(/\.sql$/, '')
  if (!seenDatasetIds.has(id)) problem(`content/datasets/${name}`, 'файл не упомянут в index.json')
}

const hiddenById = new Map<string, string>()
for (const id of seenDatasetIds) hiddenById.set(id, sqlByName.get(`${id}.hidden.sql`) ?? '')

const topicDrafts = new Map<string, TopicDraft>()

const sortedLessonPaths = Object.keys(lessonFiles).sort((a, b) => a.localeCompare(b, 'en'))
for (const path of sortedLessonPaths) {
  const { folder, file } = fileParts(path)
  const where = `content/topics/${folder}/${file}`
  if (file === 'topic.md') {
    let data: Record<string, unknown> = {}
    let body = ''
    try {
      const parsed = parseFrontmatter(lessonFiles[path] ?? '')
      data = parsed.data
      body = parsed.body.trim()
    } catch (error) {
      problem(where, error instanceof Error ? error.message : 'шапка не разобрана')
      continue
    }
    const id = text(data.id, where, 'id')
    const title = text(data.title, where, 'title')
    const kicker = text(data.kicker, where, 'kicker')
    if (!body) problem(where, 'под шапкой нужен короткий текст темы')
    const folderId = /^\d{2}-(.+)$/.exec(folder)?.[1]
    if (id && folderId !== id) problem(where, `id «${id}» не совпадает с папкой ${folder}`)
    topicDrafts.set(folder, { folder, id, title, kicker, blurb: body, lessons: [] })
    continue
  }
  if (!/^\d{2}-[a-z0-9-]+\.md$/.test(file)) {
    problem(where, 'имя файла: две цифры, дефис, латиница, например 03-join-orders.md')
  }
}

for (const path of sortedLessonPaths) {
  const { folder, file } = fileParts(path)
  if (file === 'topic.md') continue
  const where = `content/topics/${folder}/${file}`
  const topic = topicDrafts.get(folder)
  if (!topic) {
    problem(where, 'в папке нет topic.md')
    continue
  }
  let data: Record<string, unknown> = {}
  let body = ''
  try {
    const parsed = parseFrontmatter(lessonFiles[path] ?? '')
    data = parsed.data
    body = parsed.body
  } catch (error) {
    problem(where, error instanceof Error ? error.message : 'шапка не разобрана')
    continue
  }
  const kind = data.kind
  const id = text(data.id, where, 'id')
  const title = text(data.title, where, 'title')
  if (kind === 'theory') {
    if (!body.trim()) problem(where, 'у теории пустой текст')
    const lesson: TheoryLesson = { kind: 'theory', id, topicId: topic.id, title, body: body.trim() }
    topic.lessons.push({ file, lesson })
    continue
  }
  if (kind !== 'exercise') {
    problem(where, 'kind должен быть exercise или theory')
    continue
  }
  const stem = file.replace(/^\d{2}-/, '').replace(/\.md$/, '')
  if (id && stem !== id) problem(where, `id «${id}» должен совпадать с именем файла после номера`)
  const seedId = text(data.seed, where, 'seed')
  if (seedId && !seenDatasetIds.has(seedId)) problem(where, `база «${seedId}» не описана в content/datasets/index.json`)
  const columns = Array.isArray(data.columns) ? data.columns.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : []
  if (!Array.isArray(data.columns) || columns.length === 0) problem(where, 'columns: [столбец, столбец]')
  if (typeof data.orderMatters !== 'boolean') problem(where, 'orderMatters: true или false')
  if (data.level !== 1 && data.level !== 2 && data.level !== 3) problem(where, 'level: 1, 2 или 3')
  const starterSql = text(data.starter, where, 'starter')
  const solutionSql = text(data.solution, where, 'solution')
  const hints = Array.isArray(data.hints) ? data.hints.filter((item): item is string => typeof item === 'string' && item.trim() !== '') : []
  if (hints.length !== 3) problem(where, 'нужны ровно три подсказки в списке hints')
  const sections = markdownSections(body)
  const theory = sections['Теория'] ?? ''
  const prompt = sections['Задание'] ?? ''
  const explanation = sections['Разбор'] ?? ''
  if (!theory) problem(where, 'нужен раздел ## Теория')
  if (!prompt) problem(where, 'нужен раздел ## Задание')
  if (!explanation) problem(where, 'нужен раздел ## Разбор')
  const dialect = data.dialectNote
  if (dialect !== undefined && typeof dialect !== 'string') problem(where, 'dialectNote должна быть строкой')
  const exercise: Exercise = {
    id,
    topicId: topic.id,
    title,
    theory,
    prompt,
    columns,
    orderMatters: data.orderMatters === true,
    level: data.level === 2 || data.level === 3 ? data.level : 1,
    starterSql,
    solutionSql,
    hints: [hints[0] ?? '', hints[1] ?? '', hints[2] ?? ''],
    explanation,
    seedId,
    dialectNote: typeof dialect === 'string' && dialect.trim() ? dialect.trim() : undefined,
  }
  topic.lessons.push({ file, lesson: { kind: 'exercise', exercise } })
}

const seenIds = new Set<string>()
export const topics: Topic[] = [...topicDrafts.values()]
  .sort((a, b) => a.folder.localeCompare(b.folder, 'en'))
  .map((topic) => ({
    id: topic.id,
    title: topic.title,
    kicker: topic.kicker,
    blurb: topic.blurb,
    lessons: topic.lessons
      .sort((a, b) => a.file.localeCompare(b.file, 'en'))
      .map((item) => item.lesson),
  }))

for (const topic of topics) {
  if (!topic.id) continue
  if (seenIds.has(topic.id)) problem(`content/topics/${topic.id}`, 'такая тема уже есть')
  seenIds.add(topic.id)
  for (const lesson of topic.lessons) {
    const id = lesson.kind === 'theory' ? lesson.id : lesson.exercise.id
    if (!id) continue
    if (seenIds.has(id)) problem(id, 'такой id урока уже есть')
    seenIds.add(id)
  }
}

if (problems.length) {
  throw new Error(`Контент не собран:\n${problems.map((line) => `• ${line}`).join('\n')}`)
}

export const exercises: Exercise[] = topics.flatMap((topic) =>
  topic.lessons.flatMap((lesson) => (lesson.kind === 'exercise' ? [lesson.exercise] : [])),
)

export const datasets: Dataset[] = datasetRows.sort((a, b) => a.order - b.order)

export const seeds: Record<string, { visible: string; hidden: string }> = Object.fromEntries(
  datasets.map((dataset) => [dataset.id, { visible: dataset.sql, hidden: hiddenById.get(dataset.id) ?? '' }]),
)

export function exerciseById(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id)
}

export function exercisesByTopic(topicId: string): Exercise[] {
  return exercises.filter((exercise) => exercise.topicId === topicId)
}

export function neighborExercise(id: string, step: -1 | 1): Exercise | undefined {
  const index = exercises.findIndex((exercise) => exercise.id === id)
  if (index < 0) return undefined
  return exercises[index + step]
}
