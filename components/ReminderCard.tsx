'use client'

import { Medication } from '@/lib/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Pill, Trash2, Edit2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ReminderCardProps {
  medication: Medication
  onEdit?: (medication: Medication) => void
  onDelete?: (medicationId: string) => void
  onMarkTaken?: (medicationId: string) => void
  showNextReminder?: boolean
}

export function ReminderCard({
  medication,
  onEdit,
  onDelete,
  onMarkTaken,
  showNextReminder = true,
}: ReminderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success border-success/30'
      case 'completed':
        return 'bg-muted text-muted-foreground border-border'
      case 'cancelled':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-secondary text-foreground border-border'
    }
  }

  const getNextReminderTime = () => {
    if (!medication.reminderTimes || medication.reminderTimes.length === 0) {
      return 'No reminder times set'
    }

    const now = new Date()
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const nextTime = medication.reminderTimes.find((time) => time > currentTimeStr)
    if (nextTime) {
      return `Next: ${nextTime} today`
    }

    const firstTime = medication.reminderTimes[0]
    return `Next: ${firstTime} tomorrow`
  }

  const getReminderTimesDisplay = () => {
    if (!medication.reminderTimes || medication.reminderTimes.length === 0) {
      return 'No times set'
    }
    return medication.reminderTimes.join(', ')
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available'
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString()
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString()
    return 'Date not available'
  }

  return (
    <Card className="p-5 hover:shadow-sm transition-shadow border border-border">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="p-2 bg-secondary rounded-lg">
            <Pill className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-title font-semibold text-foreground">{medication.name}</h3>
              <p className="text-label text-muted-foreground">
                {medication.dosage} • {medication.frequency}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(medication.status)}>
              {medication.status}
            </Badge>
          </div>

          {/* Reminder Times */}
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{getReminderTimesDisplay()}</span>
          </div>

          {/* Date Range */}
          <div className="text-sm text-muted-foreground mb-3">
            <span>
              {formatDate(medication.startDate)}
              {medication.endDate ? ` - ${formatDate(medication.endDate)}` : ' - Ongoing'}
            </span>
          </div>

          {/* Next Reminder */}
          {showNextReminder && medication.status === 'active' && (
            <div className="inline-block px-3 py-1 bg-warning/10 text-warning text-sm rounded-md mb-3">
              {getNextReminderTime()}
            </div>
          )}

          {/* Prescribed By & Notes */}
          <div className="text-sm text-muted-foreground space-y-1">
            {medication.prescribedBy && <p>Prescribed by: {medication.prescribedBy}</p>}
            {medication.notes && <p>Notes: {medication.notes}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        {medication.status === 'active' && onMarkTaken && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkTaken(medication.id!)}
            className="flex-1"
          >
            Mark as Taken
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(medication)}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(medication.id!)}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
    </Card>
  )
}
