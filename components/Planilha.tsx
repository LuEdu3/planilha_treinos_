'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { computeLoads, getDefaultLoad, newWorkoutType, type WorkoutType, type Exercise, type ExerciseRow, type SeriesLoad } from '@/lib/types'
import { useExerciseNames } from '@/context/ExerciseNamesContext'
import { LoadRow } from './LoadRow'

function getTodayLabel(): string {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const defaultWorkoutTypes: WorkoutType[] = [
  { id: '1', name: getTodayLabel(), date: getTodayLabel() },
]

const defaultExercises: Exercise[] = [
  { id: '1', name: '' },
]

function buildRows(exercises: Exercise[], rows: Map<string, ExerciseRow>): ExerciseRow[] {
  return exercises.map((ex) => {
    const existing = rows.get(ex.id)
    const load = existing?.load ?? getDefaultLoad()
    return {
      exerciseId: ex.id,
      exerciseName: ex.name,
      load,
    }
  })
}

export function Planilha() {
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>(defaultWorkoutTypes)
  const [exercises, setExercises] = useState<Exercise[]>(defaultExercises)
  const [selectedWorkout, setSelectedWorkout] = useState<string>(defaultWorkoutTypes[0]?.id ?? '')
  const [rowsByWorkout, setRowsByWorkout] = useState<Record<string, Map<string, ExerciseRow>>>({})
  const { names: savedExerciseNames, addName } = useExerciseNames()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; workoutId: string } | null>(null)
  const [focusedExerciseId, setFocusedExerciseId] = useState<string | null>(null)
  const [focusedSortIndex, setFocusedSortIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [contextMenu])

  const rows = buildRows(
    exercises,
    rowsByWorkout[selectedWorkout] ?? new Map()
  )
  const rowsSorted = (() => {
    const sorted = [...rows].sort((a, b) => {
      const na = a.exerciseName?.trim() ?? ''
      const nb = b.exerciseName?.trim() ?? ''
      if (!na && !nb) return 0
      if (!na) return 1
      if (!nb) return -1
      return na.localeCompare(nb, 'pt-BR')
    })
    if (!focusedExerciseId) return sorted
    const focusedRow = rows.find((r) => r.exerciseId === focusedExerciseId)
    if (!focusedRow) return sorted
    const rest = sorted.filter((r) => r.exerciseId !== focusedExerciseId)
    const idx = Math.min(focusedSortIndex, rest.length)
    return [...rest.slice(0, idx), focusedRow, ...rest.slice(idx)]
  })()

  const updateLoad = useCallback(
    (exerciseId: string, updates: Partial<SeriesLoad>) => {
      setRowsByWorkout((prev) => {
        const workout = prev[selectedWorkout] ?? new Map()
        const row = workout.get(exerciseId) ?? {
          exerciseId,
          exerciseName: exercises.find((e) => e.id === exerciseId)?.name ?? '',
          load: getDefaultLoad(),
        }
        let newLoad = { ...row.load, ...updates }
        if (updates.valid !== undefined) {
          newLoad = computeLoads(updates.valid, newLoad)
        }
        const next = new Map(workout)
        next.set(exerciseId, { ...row, load: newLoad })
        return { ...prev, [selectedWorkout]: next }
      })
    },
    [selectedWorkout, exercises]
  )

  const addWorkoutType = () => {
    const newW = newWorkoutType()
    setWorkoutTypes((prev) => [...prev, newW])
    setSelectedWorkout(newW.id)
  }

  const removeWorkout = useCallback((workoutId: string) => {
    setWorkoutTypes((prev) => {
      const next = prev.filter((w) => w.id !== workoutId)
      if (next.length === 0) {
        const newW = newWorkoutType()
        setSelectedWorkout(newW.id)
        return [newW]
      }
      if (selectedWorkout === workoutId) {
        const idx = prev.findIndex((w) => w.id === workoutId)
        const newSelected = prev[idx === 0 ? 1 : idx - 1]
        if (newSelected) setSelectedWorkout(newSelected.id)
      }
      return next
    })
    setRowsByWorkout((prev) => {
      const next = { ...prev }
      delete next[workoutId]
      return next
    })
  }, [selectedWorkout])

  const updateWorkoutName = (id: string, name: string) => {
    setWorkoutTypes((prev) => prev.map((w) => (w.id === id ? { ...w, name, date: name } : w)))
  }

  const removeExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId))
    setRowsByWorkout((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((wid) => {
        const m = next[wid]
        if (m?.has(exerciseId)) {
          const m2 = new Map(m)
          m2.delete(exerciseId)
          next[wid] = m2
        }
      })
      return next
    })
  }, [])

  const addExercise = () => {
    const id = String(Date.now())
    setExercises((prev) => [...prev, { id, name: '' }])
  }

  const updateExerciseName = (id: string, name: string) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)))
  }

  const handleSaveExerciseName = useCallback((name: string) => {
    addName(name)
  }, [addName])

  const cloneWorkout = useCallback((workoutId: string) => {
    const sourceRows = rowsByWorkout[workoutId]
    const newId = String(Date.now())
    const newWorkout: WorkoutType = {
      id: newId,
      name: 'Clone',
      date: 'Clone',
    }
    setWorkoutTypes((prev) => [...prev, newWorkout])
    setSelectedWorkout(newId)
    if (sourceRows && sourceRows.size > 0) {
      setRowsByWorkout((prev) => ({
        ...prev,
        [newId]: new Map(sourceRows),
      }))
    }
    setContextMenu(null)
  }, [rowsByWorkout])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">
          Planilha Progressão de Carga
        </h1>
        <p className="text-primary-600 text-sm sm:text-base mt-1">
          1 aquecimento (50%) · 1 preparação (70%) · 3 válidas (100%)
        </p>
      </header>

      {/* Abas de treino por data — clicável, nome na caixa azul, pode excluir */}
      <section className="bg-white rounded-xl shadow-md border border-primary-200 p-4">
        <h2 className="text-lg font-semibold text-primary-800 mb-3">Treinos por data</h2>
        <div className="flex flex-wrap gap-2 items-center relative">
          {workoutTypes.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-1"
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, workoutId: w.id })
              }}
            >
              {selectedWorkout === w.id ? (
                <input
                  type="text"
                  value={w.name}
                  onChange={(e) => updateWorkoutName(w.id, e.target.value)}
                  className="touch-target px-4 py-2 rounded-lg font-medium bg-primary-600 text-white border-2 border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 min-w-[120px]"
                  aria-label="Nome ou data do treino"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedWorkout(w.id)}
                  className="touch-target px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
                >
                  {w.name}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeWorkout(w.id)}
                className="p-2 rounded-lg text-primary-600 hover:bg-red-100 hover:text-red-700 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Excluir treino"
                title="Excluir treino"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addWorkoutType}
            className="touch-target px-4 py-2 rounded-lg bg-primary-200 text-primary-800 font-medium hover:bg-primary-300"
          >
            + Treino
          </button>
        </div>
        {contextMenu && (
          <div
            ref={menuRef}
            className="fixed z-50 min-w-[140px] py-1 bg-white rounded-lg shadow-lg border border-primary-200"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-primary-800 hover:bg-primary-100"
              onClick={() => cloneWorkout(contextMenu.workoutId)}
            >
              Clonar aba
            </button>
          </div>
        )}
      </section>

      {/* Tabela de cargas */}
      <section className="bg-white rounded-xl shadow-md border border-primary-200 overflow-x-auto">
        <h2 className="text-lg font-semibold text-primary-800 p-4 pb-0">Cargas por exercício</h2>
        <p className="text-primary-600 text-sm px-4 pt-1">
          Preencha a carga da série válida (100%) — aquecimento e preparação são calculados automaticamente.
        </p>
        <table className="w-full min-w-[320px] border-collapse mt-4">
          <thead>
            <tr className="bg-primary-700 text-white">
              <th className="text-left p-2 sm:p-3 text-sm font-semibold">Exercício</th>
              <th className="p-2 sm:p-3 text-sm font-semibold">Aquec. (50%)</th>
              <th className="p-2 sm:p-3 text-sm font-semibold">Prep. (70%)</th>
              <th className="p-2 sm:p-3 text-sm font-semibold">Válida (100%)</th>
              <th className="p-2 sm:p-3 text-sm font-semibold w-10">Ações</th>
            </tr>
            <tr className="bg-primary-600/90 text-white text-xs">
              <th className="p-2 sm:p-3 font-normal">—</th>
              <th className="p-1 sm:p-2 font-normal">kg · séries</th>
              <th className="p-1 sm:p-2 font-normal">kg · séries</th>
              <th className="p-1 sm:p-2 font-normal">kg · séries</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rowsSorted.map((row, sortIndex) => (
              <LoadRow
                key={row.exerciseId}
                row={row}
                sortIndex={sortIndex}
                savedNames={savedExerciseNames}
                onLoadChange={(updates) => updateLoad(row.exerciseId, updates)}
                onNameChange={(name) => updateExerciseName(row.exerciseId, name)}
                onSaveName={handleSaveExerciseName}
                onNameFocus={() => {
                  setFocusedExerciseId(row.exerciseId)
                  setFocusedSortIndex(sortIndex)
                }}
                onNameBlur={() => setFocusedExerciseId(null)}
                onDelete={() => removeExercise(row.exerciseId)}
              />
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-primary-200">
          <button
            type="button"
            onClick={addExercise}
            className="touch-target w-full sm:w-auto px-4 rounded-lg bg-primary-100 text-primary-800 font-medium hover:bg-primary-200"
          >
            + Adicionar exercício
          </button>
        </div>
      </section>
    </div>
  )
}
