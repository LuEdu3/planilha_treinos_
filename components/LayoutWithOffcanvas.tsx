'use client'

import { useState } from 'react'
import { ExerciseNamesProvider } from '@/context/ExerciseNamesContext'
import { Offcanvas } from './Offcanvas'

function MenuButtonAndOffcanvas({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-30 p-2 rounded-lg bg-primary-600 text-white shadow hover:bg-primary-700 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Abrir menu"
      >
        ☰
      </button>
      <Offcanvas open={open} onClose={() => setOpen(false)} />
      <div className="pl-14">
        {children}
      </div>
    </>
  )
}

export function LayoutWithOffcanvas({ children }: { children: React.ReactNode }) {
  return (
    <ExerciseNamesProvider>
      <MenuButtonAndOffcanvas>{children}</MenuButtonAndOffcanvas>
    </ExerciseNamesProvider>
  )
}
