'use client'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from './firebase'

export const signUp = async (email: string, password: string) => {
  if (!auth) return { user: null, error: 'Firebase not configured' }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signIn = async (email: string, password: string) => {
  if (!auth) return { user: null, error: 'Firebase not configured' }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  if (!auth) return { error: 'Firebase not configured' }
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getCurrentUser = (): Promise<User | null> => {
  if (!auth) return Promise.resolve(null)
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}
