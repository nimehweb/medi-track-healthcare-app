'use client'

import { useState, useEffect } from 'react'
import { Medication, MedicationStatus } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import { MedicationForm, MedicationFormData } from './MedicationForm'
import { ReminderList } from './ReminderList'
import {
  createMedication,
  getMedicationsByPatient,
  updateMedication,
  deleteMedication,
  getAppointments,
} from '@/lib/firestore'
import { AlertCircle, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'sonner'

interface RemindersManagerProps {
  className?: string
}

export function RemindersManager({ className = '' }: RemindersManagerProps) {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadReminders()
    }
  }, [user?.uid])

  const loadReminders = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      setError(null)

      const [medsResult, appointmentsResult] = await Promise.all([
        getMedicationsByPatient(user.uid),
        getAppointments(user.uid),
      ])

      if (medsResult.error) {
        setError(medsResult.error)
      } else {
        setMedications(medsResult.data || [])
      }

      if (appointmentsResult.error) {
        console.error('Failed to load appointments:', appointmentsResult.error)
      } else {
        setAppointments(appointmentsResult.data || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reminders')
      console.error('Error loading reminders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveMedication = async (formData: MedicationFormData) => {
    if (!user?.uid) {
      setError('User not authenticated')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const medicationData: Partial<Medication> = {
        patientId: user.uid,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        reminderTimes: formData.reminderTimes,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate:
          formData.endType === 'specific_date' && formData.endDate
            ? Timestamp.fromDate(new Date(formData.endDate))
            : undefined,
        prescribedBy: formData.prescribedBy,
        notes: formData.notes,
        status: 'active' as MedicationStatus,
      }

      if (editingMedication?.id) {
        const result = await updateMedication(editingMedication.id, medicationData)
        if (result.error) {
          throw new Error(result.error)
        }
        setMedications((prevMeds) =>
          prevMeds.map((med) =>
            med.id === editingMedication.id
              ? { ...med, ...medicationData }
              : med
          )
        )
        toast.success('Medication updated successfully')
      } else {
        const result = await createMedication(medicationData)
        if (result.error) {
          throw new Error(result.error)
        }
        setMedications((prevMeds) => [
          ...prevMeds,
          {
            ...medicationData,
            id: result.id,
          } as Medication,
        ])
        toast.success('Medication added successfully')
      }

      setDialogOpen(false)
      setEditingMedication(null)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save medication'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMedication = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return

    try {
      setError(null)
      const result = await deleteMedication(medicationId)
      if (result.error) {
        throw new Error(result.error)
      }
      setMedications((prevMeds) => prevMeds.filter((med) => med.id !== medicationId))
      toast.success('Medication deleted successfully')
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete medication'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleMarkAsTaken = async (medicationId: string) => {
    try {
      setError(null)
      const result = await updateMedication(medicationId, {
        status: 'completed' as MedicationStatus,
      })
      if (result.error) {
        throw new Error(result.error)
      }
      setMedications((prevMeds) =>
        prevMeds.map((med) =>
          med.id === medicationId ? { ...med, status: 'completed' } : med
        )
      )
      toast.success('Marked as taken')
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update medication'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingMedication(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="reminders" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="add-medication">Add Medication</TabsTrigger>
          </TabsList>
        </div>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Reminders</h2>
              <p className="text-muted-foreground mt-1">
                Track and manage your medication reminders
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingMedication(null)
                    setDialogOpen(true)
                  }}
                  className="bg-primary hover:bg-primary/90 text-background"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                  </DialogTitle>
                </DialogHeader>
                <MedicationForm
                  onSubmit={handleSaveMedication}
                  isLoading={isSaving}
                  defaultValues={
                    editingMedication ? {
                      name: editingMedication.name,
                      dosage: editingMedication.dosage,
                      frequency: editingMedication.frequency as any,
                      reminderTimes: editingMedication.reminderTimes,
                      startDate: editingMedication.startDate.toDate().toISOString().split('T')[0],
                      endDate: editingMedication.endDate
                        ? editingMedication.endDate.toDate().toISOString().split('T')[0]
                        : undefined,
                      endType: editingMedication.endDate ? 'specific_date' : 'ongoing',
                      prescribedBy: editingMedication.prescribedBy,
                      notes: editingMedication.notes,
                    } : undefined
                  }
                />
              </DialogContent>
            </Dialog>
          </div>

          <ReminderList
            medications={medications}
            appointments={appointments}
            onEditMedication={handleEditMedication}
            onDeleteMedication={handleDeleteMedication}
            onMarkMedicationTaken={handleMarkAsTaken}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Add Medication Tab */}
        <TabsContent value="add-medication">
          <MedicationForm onSubmit={handleSaveMedication} isLoading={isSaving} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
