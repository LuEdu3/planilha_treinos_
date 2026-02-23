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
  const { addNamesBulk, names } = useExerciseNames()
  const [dropdownValue, setDropdownValue] = useState('')
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
        Escolha um arquivo Excel (.xlsx, .xls), CSV ou texto (.txt). Os nomes serão usados para autocompletar ao digitar na planilha. Use a primeira coluna (ou uma linha por nome no .txt).
      </p>

      <div className="bg-white rounded-xl shadow-md border border-primary-200 p-6">
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
                Importar do dispositivo...
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
          Escolha o tipo acima e selecione o arquivo. Os nomes da primeira coluna (ou uma por linha no .txt) serão usados para autocompletar na planilha.
        </p>
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
    </div>
  )
}
