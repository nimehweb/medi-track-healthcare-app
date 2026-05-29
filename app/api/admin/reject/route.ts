import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth, isAdminInitialized } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  if (!isAdminInitialized || !adminDb || !adminAuth) {
    return NextResponse.json(
      { error: 'Firebase Admin SDK not configured. Set FIREBASE_ADMIN_* environment variables.' },
      { status: 500 }
    )
  }

  try {
    const { labId } = await request.json()

    if (!labId) {
      return NextResponse.json({ error: 'labId is required' }, { status: 400 })
    }

    // Find the user associated with this lab
    const usersSnapshot = await adminDb
      .collection('users')
      .where('labId', '==', labId)
      .where('role', '==', 'lab_staff')
      .limit(1)
      .get()

    // Delete the Firebase Auth user(s)
    const deletePromises = usersSnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id
      try {
        await adminAuth!.deleteUser(userId)
      } catch (authError: any) {
        if (authError.code !== 'auth/user-not-found') {
          throw authError
        }
      }
      // Delete the user document from Firestore too
      await userDoc.ref.delete()
    })
    await Promise.all(deletePromises)

    // Update lab document to rejected
    const labRef = adminDb.collection('labs').doc(labId)
    const labSnap = await labRef.get()

    if (labSnap.exists) {
      await labRef.update({
        status: 'rejected',
        updatedAt: Timestamp.now(),
        rejectedAt: Timestamp.now(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Rejection error:', error)
    return NextResponse.json({ error: error.message || 'Rejection failed' }, { status: 500 })
  }
}
