'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ContextValue = {
  names: string[]
  addName: (name: string) => void
  addNamesBulk: (names: string[]) => number
}

const ExerciseNamesContext = createContext<ContextValue | null>(null)

export function ExerciseNamesProvider({ children }: { children: ReactNode }) {
  const [names, setNames] = useState<string[]>([])

  const addName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setNames((prev) => {
      const lower = trimmed.toLowerCase()
      if (prev.some((n) => n.toLowerCase() === lower)) return prev
      return [...prev, trimmed]
    })
  }, [])

  const addNamesBulk = useCallback((newNames: string[]) => {
    let added = 0
    setNames((prev) => {
      const existingLower = new Set(prev.map((n) => n.toLowerCase()))
      const next = [...prev]
      for (const name of newNames) {
        const trimmed = name.trim()
        if (!trimmed) continue
        if (existingLower.has(trimmed.toLowerCase())) continue
        existingLower.add(trimmed.toLowerCase())
        next.push(trimmed)
        added++
      }
      return next
    })
    return added
  }, [])

  return (
    <ExerciseNamesContext.Provider value={{ names, addName, addNamesBulk }}>
      {children}
    </ExerciseNamesContext.Provider>
  )
}

export function useExerciseNames(): ContextValue {
  const ctx = useContext(ExerciseNamesContext)
  if (!ctx) throw new Error('useExerciseNames must be used within ExerciseNamesProvider')
  return ctx
}
