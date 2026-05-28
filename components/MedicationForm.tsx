'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times_daily', 'custom']),
  reminderTimes: z.array(z.string()).min(1, 'At least one reminder time is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endType: z.enum(['ongoing', 'specific_date']),
  endDate: z.string().optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().optional(),
})

export type MedicationFormData = z.infer<typeof medicationSchema>

interface MedicationFormProps {
  onSubmit: (data: MedicationFormData) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<MedicationFormData>
}

const FREQUENCY_DEFAULTS: Record<string, string[]> = {
  once_daily: ['08:00'],
  twice_daily: ['08:00', '20:00'],
  three_times_daily: ['08:00', '14:00', '20:00'],
}

export function MedicationForm({ onSubmit, isLoading = false, defaultValues }: MedicationFormProps) {
  const [customTimes, setCustomTimes] = useState(defaultValues?.reminderTimes || ['08:00'])
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      dosage: defaultValues?.dosage || '',
      frequency: defaultValues?.frequency || 'once_daily',
      reminderTimes: defaultValues?.reminderTimes || ['08:00'],
      startDate: defaultValues?.startDate || new Date().toISOString().split('T')[0],
      endType: defaultValues?.endDate ? 'specific_date' : 'ongoing',
      endDate: defaultValues?.endDate || '',
      prescribedBy: defaultValues?.prescribedBy || '',
      notes: defaultValues?.notes || '',
    },
  })

  const frequency = watch('frequency')
  const endType = watch('endType')

  const handleFrequencyChange = (freq: string) => {
    if (freq !== 'custom' && FREQUENCY_DEFAULTS[freq]) {
      const times = FREQUENCY_DEFAULTS[freq]
      setCustomTimes(times)
      setValue('reminderTimes', times)
    }
  }

  const handleAddTime = () => {
    setCustomTimes([...customTimes, '08:00'])
    setValue('reminderTimes', [...customTimes, '08:00'])
  }

  const handleRemoveTime = (index: number) => {
    const newTimes = customTimes.filter((_, i) => i !== index)
    if (newTimes.length > 0) {
      setCustomTimes(newTimes)
      setValue('reminderTimes', newTimes)
    }
  }

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...customTimes]
    newTimes[index] = time
    setCustomTimes(newTimes)
    setValue('reminderTimes', newTimes)
  }

  const handleFormSubmit = async (data: MedicationFormData) => {
    try {
      setError(null)
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Failed to save medication')
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-title font-bold text-foreground mb-6">Add Medication</h2>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Medication Name */}
        <div>
          <Label htmlFor="name" className="text-label font-medium mb-2 block">
            Medication Name *
          </Label>
          <Input
            id="name"
            placeholder="e.g., Aspirin, Metformin"
            {...register('name')}
            className="w-full"
          />
          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Dosage */}
        <div>
          <Label htmlFor="dosage" className="text-label font-medium mb-2 block">
            Dosage *
          </Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg, 10ml"
            {...register('dosage')}
            className="w-full"
          />
          {errors.dosage && <p className="text-destructive text-sm mt-1">{errors.dosage.message}</p>}
        </div>

        {/* Frequency */}
        <div>
          <Label htmlFor="frequency" className="text-label font-medium mb-2 block">
            Frequency *
          </Label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  handleFrequencyChange(value)
                }}
              >
                <SelectTrigger id="frequency" className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                  <SelectItem value="custom">Custom Times</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.frequency && <p className="text-destructive text-sm mt-1">{errors.frequency.message}</p>}
        </div>

        {/* Reminder Times */}
        <div>
          <Label className="text-label font-medium mb-2 block">Reminder Times *</Label>
          <div className="space-y-3">
            {customTimes.map((time, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="flex-1"
                />
                {customTimes.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveTime(index)}
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          {frequency === 'custom' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTime}
              className="w-full mt-3"
            >
              + Add Time
            </Button>
          )}
          {errors.reminderTimes && (
            <p className="text-destructive text-sm mt-1">{errors.reminderTimes.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <Label htmlFor="startDate" className="text-label font-medium mb-2 block">
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="w-full"
          />
          {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate.message}</p>}
        </div>

        {/* Duration Type */}
        <div>
          <Label className="text-label font-medium mb-2 block">Duration</Label>
          <Controller
            name="endType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="specific_date">Specific End Date</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* End Date (conditional) */}
        {endType === 'specific_date' && (
          <div>
            <Label htmlFor="endDate" className="text-label font-medium mb-2 block">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              className="w-full"
            />
            {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate.message}</p>}
          </div>
        )}

        {/* Prescribed By */}
        <div>
          <Label htmlFor="prescribedBy" className="text-label font-medium mb-2 block">
            Prescribed By (Doctor Name)
          </Label>
          <Input
            id="prescribedBy"
            placeholder="e.g., Dr. Smith"
            {...register('prescribedBy')}
            className="w-full"
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-label font-medium mb-2 block">
            Additional Notes
          </Label>
          <Input
            id="notes"
            placeholder="e.g., Take with food, avoid dairy"
            {...register('notes')}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-background font-semibold"
        >
          {isLoading ? 'Saving...' : 'Save Medication'}
        </Button>
      </form>
    </Card>
  )
}
