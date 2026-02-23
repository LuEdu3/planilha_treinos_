'use client'

import Link from 'next/link'
import { useExerciseNames } from '@/context/ExerciseNamesContext'

type Props = {
  open: boolean
  onClose: () => void
}

export function Offcanvas({ open, onClose }: Props) {
  const { names } = useExerciseNames()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl border-r border-primary-200 transition-transform duration-200 ease-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menu adicional"
      >
        <div className="p-4 border-b border-primary-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-800">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-primary-100 text-primary-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <Link
            href="/importar"
            onClick={onClose}
            className="text-primary-600 hover:text-primary-800 underline py-2"
          >
            Importar exercícios (Excel / texto)
          </Link>
        </nav>
        <div className="flex-1 overflow-auto p-4 border-t border-primary-100">
          <h3 className="text-sm font-semibold text-primary-800 mb-2">
            Exercícios (importados e digitados)
          </h3>
          {names.length === 0 ? (
            <p className="text-primary-500 text-sm">Nenhum ainda. Importe um arquivo ou digite na planilha.</p>
          ) : (
            <ul className="space-y-1 text-sm text-primary-800">
              {names.map((name) => (
                <li key={name} className="py-1 border-b border-primary-100 last:border-0">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
