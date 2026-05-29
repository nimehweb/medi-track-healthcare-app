'use client'

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadTestFile(
  patientId: string,
  file: File,
  testId?: string
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  try {
    if (!storage) {
      return { url: null, error: 'Firebase Storage not initialized' }
    }

    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'pdf'
    const path = `test-results/${patientId}/${testId || timestamp}.${ext}`
    const storageRef = ref(storage, path)

    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)

    return { url, error: null }
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload file' }
  }
}

export async function deleteTestFile(fileUrl: string): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!storage) {
      return { success: false, error: 'Firebase Storage not initialized' }
    }

    const storageRef = ref(storage, fileUrl)
    await deleteObject(storageRef)
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete file' }
  }
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const MAX_LICENSE_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateTestFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only PDF, JPEG, PNG, and WebP files are allowed'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be under 10MB'
  }
  return null
}

export function validateLicenseFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'Only PDF, JPEG, and PNG files are allowed'
  }
  if (file.size > MAX_LICENSE_FILE_SIZE) {
    return 'File size must be under 5MB'
  }
  return null
}

export async function uploadLicenseDocument(
  labId: string,
  file: File
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  try {
    if (!storage) {
      return { url: null, error: 'Firebase Storage not initialized' }
    }

    const ext = file.name.split('.').pop() || 'pdf'
    const path = `lab-licenses/${labId}/license.${ext}`
    const storageRef = ref(storage, path)

    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)

    return { url, error: null }
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload license document' }
  }
}
