export type Exercise = {
  id: string
  topicId: string
  title: string
  /** Короткий текст из раздела «Теория» в файле урока. */
  theory: string
  prompt: string
  columns: string[]
  orderMatters: boolean
  /** 1 легко, 2 средне, 3 сложно. */
  level: 1 | 2 | 3
  starterSql: string
  solutionSql: string
  hints: [string, string, string]
  explanation: string
  seedId: string
  dialectNote?: string
}

export type TheoryLesson = {
  kind: 'theory'
  id: string
  topicId: string
  title: string
  body: string
}

export type ExerciseLesson = {
  kind: 'exercise'
  exercise: Exercise
}

export type Lesson = TheoryLesson | ExerciseLesson

export type Topic = {
  id: string
  title: string
  kicker: string
  blurb: string
  lessons: Lesson[]
}

export type Dataset = {
  id: string
  title: string
  note: string
  sql: string
  order: number
}
