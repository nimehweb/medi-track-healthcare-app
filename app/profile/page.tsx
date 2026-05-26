'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserProfile, updateUserProfile } from '@/lib/firestore'

interface UserProfile {
  name?: string
  healthId?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  bloodType?: string
  allergies?: string[]
  medicalHistory?: string[]
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown']

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile>({})
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  const [formData, setFormData] = useState<UserProfile>({})

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, isAuthenticated, router])

  const loadProfile = async () => {
    if (!user) return

    const { data } = await getUserProfile(user.uid)
    if (data) {
      const profileData = data as any
      if (profileData.fullName && !profileData.name) {
        profileData.name = profileData.fullName
      }
      setProfile(profileData as UserProfile)
      setFormData(profileData as UserProfile)
    }
    setPageLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleAllergyChange = (index: number, value: string) => {
    const newAllergies = [...(formData.allergies || [])]
    newAllergies[index] = value
    setFormData({
      ...formData,
      allergies: newAllergies,
    })
  }

  const addAllergy = () => {
    setFormData({
      ...formData,
      allergies: [...(formData.allergies || []), ''],
    })
  }

  const removeAllergy = (index: number) => {
    const newAllergies = formData.allergies?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      allergies: newAllergies,
    })
  }

  const handleMedicalHistoryChange = (index: number, value: string) => {
    const newHistory = [...(formData.medicalHistory || [])]
    newHistory[index] = value
    setFormData({
      ...formData,
      medicalHistory: newHistory,
    })
  }

  const addMedicalHistory = () => {
    setFormData({
      ...formData,
      medicalHistory: [...(formData.medicalHistory || []), ''],
    })
  }

  const removeMedicalHistory = (index: number) => {
    const newHistory = formData.medicalHistory?.filter((_, i) => i !== index) || []
    setFormData({
      ...formData,
      medicalHistory: newHistory,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    if (!user) return

    const { error: updateError } = await updateUserProfile(user.uid, formData)

    if (updateError) {
      setError(updateError)
      setSaving(false)
      return
    }

    setProfile(formData)
    setIsEditing(false)
    setSuccess('Profile updated successfully!')
    setSaving(false)

    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal and medical information
            </p>
          </div>
          <Button
            onClick={() => {
              if (isEditing) {
                setFormData(profile)
              }
              setIsEditing(!isEditing)
            }}
            variant={isEditing ? 'outline' : 'default'}
            className={isEditing ? '' : 'bg-primary hover:bg-primary/90'}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {success && (
          <div className="p-4 bg-accent/10 border border-accent/20 rounded mb-6 text-accent">
            {success}
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded mb-6 text-destructive">
            {error}
          </div>
        )}

        {/* Health ID Display */}
        {profile.healthId && (
          <Card className="p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold font-mono text-primary">
                  {profile.healthId.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Patient Health ID
                </p>
                <p className="text-lg font-bold font-mono text-foreground tracking-wider">
                  {profile.healthId}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use this ID at any lab to retrieve your records
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {profile.name || '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <p className="text-foreground py-2">{profile.email || user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {profile.phone || '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-foreground py-2">
                    {profile.dateOfBirth || '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-foreground py-2">
                    {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '—'}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Medical Information
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Blood Type
              </label>
              {isEditing ? (
                <select
                  name="bloodType"
                  value={formData.bloodType || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-foreground py-2">
                  {profile.bloodType || '—'}
                </p>
              )}
            </div>

            {/* Allergies */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Allergies
                </label>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllergy}
                  >
                    + Add Allergy
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {(formData.allergies || []).map((allergy, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        value={allergy}
                        onChange={(e) => handleAllergyChange(index, e.target.value)}
                        placeholder="Enter allergy"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAllergy(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground py-2">
                  {profile.allergies && profile.allergies.length > 0
                    ? profile.allergies.join(', ')
                    : '—'}
                </p>
              )}
            </div>

            {/* Medical History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Medical History
                </label>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedicalHistory}
                  >
                    + Add Condition
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {(formData.medicalHistory || []).map((condition, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        value={condition}
                        onChange={(e) => handleMedicalHistoryChange(index, e.target.value)}
                        placeholder="Enter medical condition"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicalHistory(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-foreground py-2">
                  {profile.medicalHistory && profile.medicalHistory.length > 0
                    ? profile.medicalHistory.join(', ')
                    : '—'}
                </p>
              )}
            </div>
          </Card>

          {/* Save Button */}
          {isEditing && (
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </form>
      </main>
    </div>
  )
}
