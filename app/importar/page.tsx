'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useExerciseNames } from '@/context/ExerciseNamesContext'
import * as XLSX from 'xlsx'

function parseTxtOrCsv(text: string, isCsv: boolean): string[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  const names: string[] = []
  for (const line of lines) {
    const cells = isCsv ? line.split(',').map((c) => c.trim()) : [line.trim()]
    const first = cells[0]
    if (first) names.push(first)
  }
  return names
}

/** Parse pasted text: one name per line and/or comma-separated */
function parsePastedList(text: string): string[] {
  return text
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseExcel(buffer: ArrayBuffer): string[] {
  const wb = XLSX.read(buffer, { type: 'array' })
  const firstSheet = wb.Sheets[wb.SheetNames[0]]
  if (!firstSheet) return []
  const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 })
  const names: string[] = []
  for (const row of data) {
    if (Array.isArray(row) && row[0] != null) {
      const val = String(row[0]).trim()
      if (val) names.push(val)
    }
  }
  return names
}

export default function ImportarPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { addNamesBulk, names, importedNames, removeImportedName, removeImportedNames } = useExerciseNames()
  const importedSorted = [...importedNames].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const [dropdownValue, setDropdownValue] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [result, setResult] = useState<{ added: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null)
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const ext = (file.name.split('.').pop() ?? '').toLowerCase()
    let parsedNames: string[] = []

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        const buf = await file.arrayBuffer()
        parsedNames = parseExcel(buf)
      } else if (ext === 'csv') {
        const text = await file.text()
        parsedNames = parseTxtOrCsv(text, true)
      } else if (ext === 'txt' || ext === '') {
        const text = await file.text()
        parsedNames = parseTxtOrCsv(text, false)
      } else {
        setError('Formato não suportado. Use .xlsx, .xls, .csv ou .txt.')
        return
      }
    } catch (err) {
      setError('Erro ao ler o arquivo.')
      return
    }

    const currentTotal = names.length
    const added = addNamesBulk(parsedNames)
    setResult({ added, total: currentTotal + added })
    setDropdownValue('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handlePasteImport = () => {
    setResult(null)
    setError(null)
    const parsedNames = parsePastedList(pastedText)
    if (parsedNames.length === 0) {
      setError('Cole uma lista com pelo menos um nome (um por linha ou separados por vírgula).')
      return
    }
    const currentTotal = names.length
    const added = addNamesBulk(parsedNames)
    setResult({ added, total: currentTotal + added })
    setPastedText('')
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-primary-600 hover:text-primary-800 underline text-sm"
        >
          ← Voltar para a planilha
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-primary-800 mb-2">
        Importar exercícios
      </h1>
      <p className="text-primary-600 text-sm mb-6">
        Escolha um arquivo ou cole uma lista. Os nomes serão usados para autocompletar ao digitar na planilha. No celular você pode escolher um arquivo ou colar a lista diretamente.
      </p>

      <div className="bg-white rounded-xl shadow-md border border-primary-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-primary-800 mb-2">Importar do dispositivo (arquivo)</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <label className="flex-1 w-full sm:max-w-xs">
              <span className="sr-only">Selecionar arquivo</span>
              <select
                className="block w-full rounded-lg border border-primary-300 bg-primary-50 px-4 py-3 text-primary-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 cursor-pointer"
                value={dropdownValue}
                onChange={(e) => {
                  setDropdownValue(e.target.value)
                  inputRef.current?.click()
                }}
              >
                <option value="" disabled>
                  Escolher arquivo...
                </option>
                <option value="excel">Excel (.xlsx, .xls)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="txt">Texto (.txt)</option>
              </select>
            </label>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              className="hidden"
              onChange={handleFile}
              aria-label="Arquivo do dispositivo"
            />
          </div>
          <p className="mt-3 text-sm text-primary-600">
            Arquivo: use a primeira coluna (ou uma linha por nome no .txt).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-primary-800 mb-2">Colar lista</h2>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Um nome por linha ou separados por vírgula..."
            rows={4}
            className="w-full rounded-lg border border-primary-300 bg-white px-4 py-3 text-primary-900 placeholder:text-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            aria-label="Lista de nomes para importar"
          />
          <button
            type="button"
            onClick={handlePasteImport}
            className="mt-2 touch-target px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Importar da lista colada
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-primary-50 text-primary-800 border border-primary-200">
          <strong>Importação concluída.</strong> {result.added} novo(s) exercício(s) adicionado(s). Total de nomes salvos: {result.total}. Eles aparecerão ao digitar na planilha.
        </div>
      )}

      {importedSorted.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-md border border-primary-200 p-6">
          <h2 className="text-lg font-semibold text-primary-800 mb-2">Nomes importados</h2>
          <p className="text-primary-600 text-sm mb-3">
            Estes nomes vieram de arquivo ou lista colada. Você pode excluir um por um ou todos.
          </p>
          <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {importedSorted.map((name) => (
              <li key={name} className="flex items-center justify-between gap-2 py-1 border-b border-primary-100 last:border-0">
                <span className="text-primary-900">{name}</span>
                <button
                  type="button"
                  onClick={() => removeImportedName(name)}
                  className="touch-target px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium shrink-0"
                  aria-label={`Excluir ${name}`}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => removeImportedNames(importedSorted)}
            className="touch-target px-4 py-2 rounded-lg bg-red-100 text-red-800 font-medium hover:bg-red-200"
          >
            Excluir todos os importados
          </button>
        </div>
      )}
    </div>
  )
}
