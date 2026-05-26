'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, Check, Loader2 } from 'lucide-react'
import { uploadTestFile, validateTestFile } from '@/lib/storage'
import { createTestResult } from '@/lib/firestore'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface TestResultUploadProps {
  onUploadComplete?: () => void
}

export function TestResultUpload({ onUploadComplete }: TestResultUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [testName, setTestName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [labName, setLabName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const validationError = validateTestFile(selected)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }

    setError(null)
    setFile(selected)
  }

  const handleUpload = async () => {
    if (!user || !file || !testName) return

    setUploading(true)
    setError(null)

    const { url, error: uploadError } = await uploadTestFile(user.uid, file)
    if (uploadError || !url) {
      setError(uploadError || 'Upload failed')
      setUploading(false)
      return
    }

    const { id, error: createError } = await createTestResult({
      patientId: user.uid,
      testName,
      status: 'ready',
      labId: 'manual-upload',
      notes: labName ? `Uploaded from: ${labName}` : 'Manually uploaded',
      pdfUrl: url,
    })

    if (createError) {
      setError(createError)
      setUploading(false)
      return
    }

    setSuccess(true)
    setUploading(false)
    toast.success('Test result uploaded successfully')
    onUploadComplete?.()

    setTimeout(() => {
      setSuccess(false)
      setFile(null)
      setTestName('')
      setTestDate(new Date().toISOString().split('T')[0])
      setLabName('')
    }, 2000)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="size-5 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-foreground">Upload Test Result</h3>
          <p className="text-sm text-muted-foreground">
            Add a past test result as PDF or image
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="testName" className="text-sm font-medium mb-2 block">
            Test Name *
          </Label>
          <Input
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., Complete Blood Count"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="testDate" className="text-sm font-medium mb-2 block">
              Test Date
            </Label>
            <Input
              id="testDate"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="labName" className="text-sm font-medium mb-2 block">
              Lab / Hospital Name
            </Label>
            <Input
              id="labName"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g., City Diagnostics"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Upload File *
          </Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="size-5 text-primary" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              </div>
            ) : (
              <div>
                <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop a file or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPEG, PNG up to 10MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-accent/10 border-accent/20">
            <Check className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent">
              Test result uploaded successfully!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || !testName || uploading || success}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="size-4 mr-2" />
              Upload Result
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
