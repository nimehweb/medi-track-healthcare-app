import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  QueryConstraint,
  addDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'patient' | 'lab_staff' | 'admin'
export type TestStatus = 'pending' | 'ready' | 'viewed'
export type ReminderType = 'medication' | 'appointment'
export type MedicationStatus = 'active' | 'completed' | 'cancelled'
export type LabStatus = 'active' | 'inactive' | 'suspended'

// Extended User Profile
export interface User {
  id?: string
  email?: string
  name: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  role: UserRole
  registeredAt: Timestamp
  // Patient-specific fields
  healthId?: string // Unique patient ID
  bloodType?: string
  allergies?: string[]
  medicalHistory?: string[]
  // Lab staff-specific fields
  labId?: string
}

// Labs Collection
export interface Lab {
  id?: string
  name: string
  address: string
  licenseNumber: string
  status: LabStatus
  phone?: string
  email?: string
  website?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// Extended Test Results
export interface TestResult {
  id?: string
  patientId: string
  patientHealthId?: string // Link to patient's healthId
  labId: string
  testName: string
  testType?: string
  results?: Record<string, any>
  normalRanges?: Record<string, any> // Normal ranges for test values
  explanation?: string // Gemini-generated explanation
  medications?: Medication[]
  status: TestStatus
  uploadedAt: Timestamp
  viewedAt?: Timestamp
  pdfUrl?: string // URL to uploaded PDF/image
  notes?: string
}

// Medications Collection
export interface Medication {
  id?: string
  patientId: string
  name: string
  dosage: string
  frequency: string // e.g., "twice daily", "every 8 hours"
  startDate: Timestamp
  endDate?: Timestamp
  reminderTimes: string[] // e.g., ["08:00", "20:00"]
  status: MedicationStatus
  prescribedBy?: string
  notes?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// Reminders Collection
export interface Reminder {
  id?: string
  patientId: string
  type: ReminderType
  linkedId: string // medicationId or appointmentId
  reminderTime: Timestamp
  isActive: boolean
  description?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// ============================================================================
// HEALTH ID GENERATION
// ============================================================================

/**
 * Generate a unique 10-character Health ID (format: MT-XXXXXXXX)
 * Checks Firestore to ensure uniqueness
 */
export async function generateHealthId(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  while (attempts < 10) {
    let id = 'MT-'
    for (let i = 0; i < 7; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const existing = await getUserByHealthId(id)
    if (!existing.data) return id
    attempts++
  }
  return `MT-${Date.now().toString(36).toUpperCase()}`
}

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

export const createUserProfile = async (userId: string, profileData: Partial<User>) => {
  try {
    const userData: User = {
      ...profileData,
      registeredAt: Timestamp.now(),
    } as User
    await setDoc(doc(db, 'users', userId), userData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as User, error: null }
    }
    return { data: null, error: 'User profile not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateUserProfile = async (userId: string, profileData: Partial<User>) => {
  try {
    await updateDoc(doc(db, 'users', userId), profileData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getUsersByRole = async (role: UserRole) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role))
    const querySnapshot = await getDocs(q)
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[]
    return { data: users, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getUserByHealthId = async (healthId: string) => {
  try {
    const q = query(collection(db, 'users'), where('healthId', '==', healthId))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0]
      return { data: { id: doc.id, ...doc.data() } as User, error: null }
    }
    return { data: null, error: 'User with this health ID not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getUserByPhone = async (phone: string) => {
  try {
    const q = query(collection(db, 'users'), where('phone', '==', phone))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0]
      return { data: { id: doc.id, ...doc.data() } as User, error: null }
    }
    return { data: null, error: 'User with this phone number not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ============================================================================
// TEST RESULTS OPERATIONS
// ============================================================================

export const getTestResults = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'testResults'),
      where('patientId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TestResult[]
    return { data: results, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getTestResultById = async (testId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'testResults', testId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as TestResult, error: null }
    }
    return { data: null, error: 'Test result not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const createTestResult = async (testData: Partial<TestResult>) => {
  try {
    const testResultData: TestResult = {
      ...testData,
      uploadedAt: Timestamp.now(),
    } as TestResult
    const docRef = await addDoc(collection(db, 'testResults'), testResultData)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateTestResult = async (testId: string, testData: Partial<TestResult>) => {
  try {
    await updateDoc(doc(db, 'testResults', testId), testData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getTestResultsByLab = async (labId: string) => {
  try {
    const q = query(
      collection(db, 'testResults'),
      where('labId', '==', labId)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TestResult[]
    return { data: results, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getTestResultsByStatus = async (status: TestStatus) => {
  try {
    const q = query(
      collection(db, 'testResults'),
      where('status', '==', status)
    )
    const querySnapshot = await getDocs(q)
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TestResult[]
    return { data: results, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ============================================================================
// APPOINTMENTS OPERATIONS
// ============================================================================

export const getAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const appointments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]
    return { data: appointments, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const createAppointment = async (appointmentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const deleteAppointment = async (appointmentId: string) => {
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId))
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// LABS OPERATIONS
// ============================================================================

export const getLabs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'labs'))
    const labs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lab[]
    return { data: labs, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getLabById = async (labId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'labs', labId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as Lab, error: null }
    }
    return { data: null, error: 'Lab not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const createLab = async (labData: Partial<Lab>) => {
  try {
    const lab: Lab = {
      ...labData,
      createdAt: Timestamp.now(),
    } as Lab
    const docRef = await addDoc(collection(db, 'labs'), lab)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const updateLab = async (labId: string, labData: Partial<Lab>) => {
  try {
    await updateDoc(doc(db, 'labs', labId), {
      ...labData,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getActiveLabsByStatus = async (status: LabStatus) => {
  try {
    const q = query(collection(db, 'labs'), where('status', '==', status))
    const querySnapshot = await getDocs(q)
    const labs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lab[]
    return { data: labs, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ============================================================================
// MEDICATIONS OPERATIONS
// ============================================================================

export const createMedication = async (medData: Partial<Medication>) => {
  try {
    const medication: Medication = {
      ...medData,
      createdAt: Timestamp.now(),
    } as Medication
    const docRef = await addDoc(collection(db, 'medications'), medication)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getMedicationsByPatient = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId)
    )
    const querySnapshot = await getDocs(q)
    const medications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Medication[]
    return { data: medications, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getActiveMedicationsByPatient = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId),
      where('status', '==', 'active')
    )
    const querySnapshot = await getDocs(q)
    const medications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Medication[]
    return { data: medications, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getMedicationById = async (medicationId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'medications', medicationId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as Medication, error: null }
    }
    return { data: null, error: 'Medication not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateMedication = async (medicationId: string, medData: Partial<Medication>) => {
  try {
    await updateDoc(doc(db, 'medications', medicationId), {
      ...medData,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteMedication = async (medicationId: string) => {
  try {
    await deleteDoc(doc(db, 'medications', medicationId))
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// REMINDERS OPERATIONS
// ============================================================================

export const createReminder = async (reminderData: Partial<Reminder>) => {
  try {
    const reminder: Reminder = {
      ...reminderData,
      createdAt: Timestamp.now(),
    } as Reminder
    const docRef = await addDoc(collection(db, 'reminders'), reminder)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getRemindersByPatient = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('patientId', '==', patientId)
    )
    const querySnapshot = await getDocs(q)
    const reminders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reminder[]
    return { data: reminders, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getActiveRemindersByPatient = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('patientId', '==', patientId),
      where('isActive', '==', true)
    )
    const querySnapshot = await getDocs(q)
    const reminders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reminder[]
    return { data: reminders, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getRemindersByType = async (patientId: string, type: ReminderType) => {
  try {
    const q = query(
      collection(db, 'reminders'),
      where('patientId', '==', patientId),
      where('type', '==', type)
    )
    const querySnapshot = await getDocs(q)
    const reminders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reminder[]
    return { data: reminders, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getReminderById = async (reminderId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'reminders', reminderId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as Reminder, error: null }
    }
    return { data: null, error: 'Reminder not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>) => {
  try {
    await updateDoc(doc(db, 'reminders', reminderId), {
      ...reminderData,
      updatedAt: Timestamp.now(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteReminder = async (reminderId: string) => {
  try {
    await deleteDoc(doc(db, 'reminders', reminderId))
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ============================================================================
// PHARMACIES OPERATIONS
// ============================================================================

export const getPharmacies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pharmacies'))
    const pharmacies = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]
    return { data: pharmacies, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const subscribeToTestResults = (
  userId: string,
  onData: (results: TestResult[]) => void,
  onError?: (error: string) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'testResults'),
    where('patientId', '==', userId)
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TestResult[]
      onData(results)
    },
    (error) => {
      console.error('Test results subscription error:', error)
      onError?.(error.message)
    }
  )
}

export const subscribeToAppointments = (
  userId: string,
  onData: (appointments: any[]) => void,
  onError?: (error: string) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'appointments'),
    where('patientId', '==', userId)
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      onData(appointments)
    },
    (error) => {
      console.error('Appointments subscription error:', error)
      onError?.(error.message)
    }
  )
}

// ============================================================================
// BULK/UTILITY OPERATIONS
// ============================================================================

/**
 * Get all data for a patient profile including medications and reminders
 * Useful for patient dashboard initialization
 */
export const getPatientFullProfile = async (patientId: string) => {
  try {
    const [userRes, medsRes, remindersRes, testResultsRes] = await Promise.all([
      getUserProfile(patientId),
      getMedicationsByPatient(patientId),
      getRemindersByPatient(patientId),
      getTestResults(patientId),
    ])

    if (userRes.error || medsRes.error || remindersRes.error || testResultsRes.error) {
      const errors = [userRes.error, medsRes.error, remindersRes.error, testResultsRes.error].filter(Boolean)
      return {
        data: null,
        error: `Failed to fetch some data: ${errors.join(', ')}`,
      }
    }

    return {
      data: {
        user: userRes.data,
        medications: medsRes.data,
        reminders: remindersRes.data,
        testResults: testResultsRes.data,
      },
      error: null,
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

/**
 * Get lab dashboard data with staff and recent test results
 */
export const getLabDashboard = async (labId: string) => {
  try {
    const [labRes, testResultsRes, staffRes] = await Promise.all([
      getLabById(labId),
      getTestResultsByLab(labId),
      getUsersByRole('lab_staff'),
    ])

    const labStaff = staffRes.data?.filter((u) => u.labId === labId) ?? []

    return {
      data: {
        lab: labRes.data,
        testResults: testResultsRes.data,
        staff: labStaff,
      },
      error: null,
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
