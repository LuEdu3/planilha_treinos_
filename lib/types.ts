/** Formato dd/MM/yyyy */
function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export type WorkoutType = {
  id: string
  /** Rótulo da aba (por padrão a data do treino) */
  name: string
  /** Data do treino (ISO ou dd/MM/yyyy) */
  date: string
}

export function newWorkoutType(): WorkoutType {
  const d = new Date()
  const dateStr = formatDate(d)
  return {
    id: String(Date.now()),
    name: dateStr,
    date: dateStr,
  }
}

export type Exercise = {
  id: string
  name: string
}

export type SeriesLoad = {
  warmup: number
  warmupSets: number
  preparation: number
  preparationSets: number
  valid: number
  validSets: number
}

export type ExerciseRow = {
  exerciseId: string
  exerciseName: string
  load: SeriesLoad
}

const defaultLoad: SeriesLoad = {
  warmup: 0,
  warmupSets: 1,
  preparation: 0,
  preparationSets: 1,
  valid: 0,
  validSets: 3,
}

/** Dado o valor da série válida (100%), calcula aquecimento (50%) e preparação (70%); mantém séries. */
export function computeLoads(validLoad: number, current?: Partial<SeriesLoad>): SeriesLoad {
  const valid = Math.round(validLoad)
  const preparation = Math.round(valid * 0.7)
  const warmup = Math.round(valid * 0.5)
  return {
    warmup,
    warmupSets: current?.warmupSets ?? 1,
    preparation,
    preparationSets: current?.preparationSets ?? 1,
    valid,
    validSets: current?.validSets ?? 3,
  }
}

export function getDefaultLoad(): SeriesLoad {
  return { ...defaultLoad }
}
