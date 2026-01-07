'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import messages from './messages/en.json'

type Messages = typeof messages

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`
  })
}

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string
  messages: Messages
}

const TranslationContext = createContext<TranslationContextType | null>(null)

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(messages as unknown as Record<string, unknown>, key)

    if (!value) {
      return key
    }

    if (params) {
      return interpolate(value, params)
    }

    return value
  }, [])

  return (
    <TranslationContext.Provider value={{ t, messages }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

export function useT() {
  const { t } = useTranslation()
  return t
}
