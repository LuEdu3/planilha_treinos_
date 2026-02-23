'use client'

import { useMemo } from 'react'
import { type ExerciseRow, type SeriesLoad } from '@/lib/types'
import { filterBySimilarity } from '@/lib/exerciseNames'

type Props = {
  row: ExerciseRow
  savedNames: string[]
  onLoadChange: (updates: Partial<SeriesLoad>) => void
  onNameChange: (name: string) => void
  onSaveName: (name: string) => void
  onDelete: () => void
}

function KgAndSets({
  kg,
  sets,
  onSetsChange,
  kgLabel,
  setsLabel,
}: {
  kg: number
  sets: number
  onSetsChange: (n: number) => void
  kgLabel: string
  setsLabel: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-medium text-primary-700" aria-label={kgLabel}>
        {kg}
      </span>
      <span className="text-primary-500 text-xs">kg</span>
      <input
        type="number"
        min={0}
        max={99}
        step={1}
        value={sets || ''}
        onChange={(e) => {
          const v = e.target.value === '' ? 0 : Number(e.target.value)
          onSetsChange(v)
        }}
        className="w-12 border border-primary-200 rounded px-1 py-0.5 text-center text-sm"
        placeholder="séries"
        aria-label={setsLabel}
      />
    </div>
  )
}

export function LoadRow({ row, savedNames, onLoadChange, onNameChange, onSaveName, onDelete }: Props) {
  const { load, exerciseName } = row
  const validNum = load.valid || ''

  const suggestions = useMemo(
    () => filterBySimilarity(savedNames, exerciseName),
    [savedNames, exerciseName]
  )

  return (
    <tr className="border-b border-primary-100 hover:bg-primary-50/50">
      <td className="p-2 sm:p-3">
        <input
          type="text"
          list={`suggestions-${row.exerciseId}`}
          value={exerciseName}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => onSaveName(exerciseName)}
          className="w-full min-w-[120px] sm:min-w-[160px] border border-primary-200 rounded px-2 py-2 text-primary-900 bg-white"
          placeholder="Nome do exercício"
          aria-label="Nome do exercício"
        />
        <datalist id={`suggestions-${row.exerciseId}`}>
          {suggestions.slice(0, 20).map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </td>
      <td className="p-2 sm:p-3 text-center align-top">
        <KgAndSets
          kg={load.warmup}
          sets={load.warmupSets}
          onSetsChange={(n) => onLoadChange({ warmupSets: n })}
          kgLabel="Aquecimento kg"
          setsLabel="Séries aquecimento"
        />
      </td>
      <td className="p-2 sm:p-3 text-center align-top">
        <KgAndSets
          kg={load.preparation}
          sets={load.preparationSets}
          onSetsChange={(n) => onLoadChange({ preparationSets: n })}
          kgLabel="Preparação kg"
          setsLabel="Séries preparação"
        />
      </td>
      <td className="p-2 sm:p-3 align-top">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={1}
              value={validNum}
              onChange={(e) => {
                const v = e.target.value === '' ? 0 : Number(e.target.value)
                onLoadChange({ valid: v })
              }}
              className="w-16 sm:w-20 border border-primary-300 rounded px-2 py-2 text-center font-medium text-primary-900 bg-white"
              placeholder="0"
              aria-label="Carga da série válida em kg"
            />
            <span className="text-primary-500 text-sm">kg</span>
          </div>
          <input
            type="number"
            min={0}
            max={99}
            step={1}
            value={load.validSets || ''}
            onChange={(e) => {
              const v = e.target.value === '' ? 0 : Number(e.target.value)
              onLoadChange({ validSets: v })
            }}
            className="w-12 border border-primary-200 rounded px-1 py-0.5 text-center text-sm"
            placeholder="séries"
            aria-label="Séries válidas"
          />
        </div>
      </td>
      <td className="p-2 sm:p-3 w-10 align-top">
        <button
          type="button"
          onClick={onDelete}
          className="touch-target min-w-[44px] rounded-lg text-primary-600 hover:bg-red-100 hover:text-red-700 font-medium text-sm"
          aria-label="Excluir exercício"
          title="Excluir exercício"
        >
          Excluir
        </button>
      </td>
    </tr>
  )
}
