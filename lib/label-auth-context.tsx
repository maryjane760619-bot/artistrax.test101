'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

type LabelAuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string, slug: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const LabelAuthContext = createContext<LabelAuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function LabelAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string, slug: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) return { error: authError }

    // Create label profile
    if (authData.user) {
      const { error: profileError } = await supabase.from('labels').insert({
        id: authData.user.id,
        email,
        slug: slug.toLowerCase(),
        name,
      })

      if (profileError) return { error: profileError }
    }

    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <LabelAuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </LabelAuthContext.Provider>
  )
}

export const useLabelAuth = () => useContext(LabelAuthContext)
