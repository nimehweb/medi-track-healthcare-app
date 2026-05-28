'use client'

import { Medication } from '@/lib/firestore'
import { ReminderCard } from './ReminderCard'
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pill, Calendar } from 'lucide-react'

interface ReminderListProps {
  medications: Medication[]
  appointments?: any[]
  onEditMedication?: (medication: Medication) => void
  onDeleteMedication?: (medicationId: string) => void
  onMarkMedicationTaken?: (medicationId: string) => void
  onEditAppointment?: (appointment: any) => void
  onDeleteAppointment?: (appointmentId: string) => void
  isLoading?: boolean
}

export function ReminderList({
  medications = [],
  appointments = [],
  onEditMedication,
  onDeleteMedication,
  onMarkMedicationTaken,
  onEditAppointment,
  onDeleteAppointment,
  isLoading = false,
}: ReminderListProps) {
  const activeMedications = medications.filter((m) => m.status === 'active')
  const completedMedications = medications.filter((m) => m.status === 'completed')

  const hasContent = medications.length > 0 || appointments.length > 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-secondary rounded-lg border border-border animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!hasContent) {
    return (
      <Empty>
        <EmptyTitle>No Reminders Yet</EmptyTitle>
        <EmptyDescription>
          Add your first medication reminder to get started
        </EmptyDescription>
      </Empty>
    )
  }

  return (
    <Tabs defaultValue="medications" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="medications" className="flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Medications
        </TabsTrigger>
        <TabsTrigger value="appointments" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Appointments
        </TabsTrigger>
      </TabsList>

      {/* Medications Tab */}
      <TabsContent value="medications" className="space-y-6">
        {medications.length === 0 ? (
          <Empty>
            <EmptyTitle>No Medications</EmptyTitle>
            <EmptyDescription>
              Add a medication reminder to track your health
            </EmptyDescription>
          </Empty>
        ) : (
          <>
            {/* Active Medications */}
            {activeMedications.length > 0 && (
              <div>
                <h3 className="text-title font-semibold text-foreground mb-4">Active Medications</h3>
                <div className="space-y-4">
                  {activeMedications.map((med) => (
                    <ReminderCard
                      key={med.id}
                      medication={med}
                      onEdit={onEditMedication}
                      onDelete={onDeleteMedication}
                      onMarkTaken={onMarkMedicationTaken}
                      showNextReminder={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Medications */}
            {completedMedications.length > 0 && (
              <div>
                <h3 className="text-title font-semibold text-foreground mb-4">
                  Completed Medications
                </h3>
                <div className="space-y-4">
                  {completedMedications.map((med) => (
                    <ReminderCard
                      key={med.id}
                      medication={med}
                      onEdit={onEditMedication}
                      onDelete={onDeleteMedication}
                      showNextReminder={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* Appointments Tab */}
      <TabsContent value="appointments" className="space-y-4">
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onEdit={onEditAppointment}
                onDelete={onDeleteAppointment}
              />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyTitle>No Appointments</EmptyTitle>
            <EmptyDescription>
              Schedule an appointment to see it here
            </EmptyDescription>
          </Empty>
        )}
      </TabsContent>
    </Tabs>
  )
}

interface AppointmentCardProps {
  appointment: any
  onEdit?: (appointment: any) => void
  onDelete?: (appointmentId: string) => void
}

function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available'
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString()
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString()
    return 'Date not available'
  }

  return (
    <div className="p-5 bg-secondary rounded-lg border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-title font-semibold text-foreground">{appointment.type || 'Appointment'}</h3>
          <p className="text-label text-muted-foreground mt-1">
            {formatDate(appointment.appointmentDate)}
          </p>
          {appointment.description && (
            <p className="text-label text-muted-foreground mt-2">{appointment.description}</p>
          )}
        </div>
        <span className="text-xs px-3 py-1 bg-secondary border border-border rounded-full text-muted-foreground">
          {appointment.status || 'scheduled'}
        </span>
      </div>
    </div>
  )
}
