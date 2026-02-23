'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react'

type ContextValue = {
  names: string[]
  importedNames: string[]
  addName: (name: string) => void
  addNamesBulk: (names: string[]) => number
  removeImportedName: (name: string) => void
  removeImportedNames: (namesToRemove: string[]) => void
}

const ExerciseNamesContext = createContext<ContextValue | null>(null)

type NamesState = { names: string[]; importedNames: string[] }

export function ExerciseNamesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NamesState>({ names: [], importedNames: [] })
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  const names = state.names
  const importedNames = state.importedNames

  const addName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setState((prev) => {
      const lower = trimmed.toLowerCase()
      if (prev.names.some((n) => n.toLowerCase() === lower)) return prev
      return { ...prev, names: [...prev.names, trimmed] }
    })
  }, [])

  const addNamesBulk = useCallback((newNames: string[]) => {
    const prev = stateRef.current
    const existingLower = new Set(prev.names.map((n) => n.toLowerCase()))
    const nextNames = [...prev.names]
    const nextImported = [...prev.importedNames]
    const importedLower = new Set(nextImported.map((n) => n.toLowerCase()))
    let added = 0
    for (const name of newNames) {
      const trimmed = name.trim()
      if (!trimmed) continue
      if (existingLower.has(trimmed.toLowerCase())) continue
      existingLower.add(trimmed.toLowerCase())
      nextNames.push(trimmed)
      if (!importedLower.has(trimmed.toLowerCase())) {
        importedLower.add(trimmed.toLowerCase())
        nextImported.push(trimmed)
      }
      added++
    }
    setState({ names: nextNames, importedNames: nextImported })
    return added
  }, [])

  const removeImportedName = useCallback((name: string) => {
    const lower = name.trim().toLowerCase()
    if (!lower) return
    setState((prev) => ({
      names: prev.names.filter((n) => n.toLowerCase() !== lower),
      importedNames: prev.importedNames.filter((n) => n.toLowerCase() !== lower),
    }))
  }, [])

  const removeImportedNames = useCallback((namesToRemove: string[]) => {
    const toRemove = new Set(namesToRemove.map((n) => n.trim().toLowerCase()).filter(Boolean))
    if (toRemove.size === 0) return
    setState((prev) => ({
      names: prev.names.filter((n) => !toRemove.has(n.toLowerCase())),
      importedNames: prev.importedNames.filter((n) => !toRemove.has(n.toLowerCase())),
    }))
  }, [])

  return (
    <ExerciseNamesContext.Provider value={{ names, importedNames, addName, addNamesBulk, removeImportedName, removeImportedNames }}>
      {children}
    </ExerciseNamesContext.Provider>
  )
}

export function useExerciseNames(): ContextValue {
  const ctx = useContext(ExerciseNamesContext)
  if (!ctx) throw new Error('useExerciseNames must be used within ExerciseNamesProvider')
  return ctx
}
