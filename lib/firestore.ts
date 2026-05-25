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
} from 'firebase/firestore'
import { db } from './firebase'

// User profile operations
export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), profileData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId))
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null }
    }
    return { data: null, error: 'User profile not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), profileData)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Test results operations
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
    })) as any[]
    return { data: results, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const getTestResultById = async (testId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'testResults', testId))
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
    }
    return { data: null, error: 'Test result not found' }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const createTestResult = async (testData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'testResults'), {
      ...testData,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Appointments operations
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

// Labs operations
export const getLabs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'labs'))
    const labs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]
    return { data: labs, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Pharmacies operations
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
