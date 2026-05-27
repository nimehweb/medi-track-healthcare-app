'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <main className="max-w-3xl mx-auto">
        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl font-bold text-primary-foreground">M</div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to MediTrack
            </h1>
            <p className="text-muted-foreground">
              Let&apos;s get you set up with Firebase
            </p>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Setup Instructions
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Create a Firebase Project
                  </h3>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a></li>
                    <li>Click "Add project" and create a new Firebase project</li>
                    <li>Enable Email/Password authentication in Authentication settings</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Get Your Firebase Config
                  </h3>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                    <li>In Firebase Console, go to Project Settings</li>
                    <li>Copy your firebaseConfig object from the code snippet</li>
                    <li>You&apos;ll need these keys:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>apiKey</li>
                        <li>authDomain</li>
                        <li>projectId</li>
                        <li>storageBucket</li>
                        <li>messagingSenderId</li>
                        <li>appId</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Set Environment Variables
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Add these to your <code className="bg-muted px-2 py-1 rounded text-sm">.env.local</code> file:
                  </p>
                  <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                    <pre className="text-foreground">{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Create Firestore Database
                  </h3>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                    <li>In Firebase Console, go to Firestore Database</li>
                    <li>Create a new database in production mode</li>
                    <li>Set security rules to allow authenticated users:
                      <div className="bg-muted p-3 rounded mt-2 text-xs">
                        <pre className="text-foreground">{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Restart Your Dev Server
                  </h3>
                  <p className="text-muted-foreground">
                    Stop and restart your development server for the environment variables to take effect
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded">
            <p className="text-sm text-muted-foreground mb-3">
              Once you&apos;ve configured Firebase, you can start using MediTrack:
            </p>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Login
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 mt-6 bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-foreground mb-2">Optional: Additional Features</h3>
          <p className="text-sm text-muted-foreground mb-3">
            MediTrack also supports these optional features when configured:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>🗺️ <strong>Google Maps API:</strong> Set <code className="bg-white px-1 rounded text-xs">GOOGLE_MAPS_API_KEY</code> for the server proxy and <code className="bg-white px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> for the map SDK</li>
            <li>🤖 <strong>Gemini API:</strong> Set <code className="bg-white px-1 rounded text-xs">NEXT_PUBLIC_GEMINI_API_KEY</code> for AI-powered test explanations</li>
          </ul>
        </Card>
      </main>
    </div>
  )
}
