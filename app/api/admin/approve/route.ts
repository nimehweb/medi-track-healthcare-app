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
    const { labId, userEmail } = await request.json()

    if (!labId) {
      return NextResponse.json({ error: 'labId is required' }, { status: 400 })
    }

    const labRef = adminDb.collection('labs').doc(labId)
    const labSnap = await labRef.get()

    if (!labSnap.exists) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    await labRef.update({
      status: 'active',
      updatedAt: Timestamp.now(),
      approvedAt: Timestamp.now(),
    })

    // Email notification stub — add real email sending later
    if (userEmail) {
      console.log(`[EMAIL STUB] Approval notification sent to ${userEmail}`)
      console.log(`[EMAIL STUB] Subject: Your MediTrack Hospital Account Has Been Approved`)
      console.log(`[EMAIL STUB] Body: Your hospital "${labSnap.data()?.name}" has been approved. Log in at /lab/login`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Approval error:', error)
    return NextResponse.json({ error: error.message || 'Approval failed' }, { status: 500 })
  }
}
