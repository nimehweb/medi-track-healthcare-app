# MediTrack - Healthcare Management Platform

A modern healthcare management application built with Next.js 15, React 19, Firebase, and Tailwind CSS. Patients can manage their health records, book appointments, view test results, and find nearby pharmacies.

## Features

### Core Features
- **User Authentication** - Secure email/password authentication via Firebase
- **Dashboard** - Overview of health data, recent tests, and upcoming appointments
- **Test Results Management** - View detailed test results with normal ranges and historical trends
- **Appointment Booking** - 3-step wizard to book appointments at preferred labs
- **Pharmacy Finder** - MVP with mock data showing nearby pharmacies
- **User Profile** - Manage personal and medical information (blood type, allergies, medical history)

### Design
- Beautiful, healthcare-focused design with professional blue/teal color scheme
- Responsive layout optimized for mobile, tablet, and desktop
- Smooth navigation with intuitive user interface
- Accessible components with semantic HTML

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **UI Components:** shadcn/ui with Tailwind CSS
- **Database & Auth:** Firebase (Firestore + Authentication)
- **State Management:** React Context + Hooks
- **Styling:** Tailwind CSS with custom healthcare theme

## Project Structure

```
app/
├── page.tsx                 # Home page (redirects to dashboard/setup)
├── login/page.tsx          # Login page
├── signup/page.tsx         # Signup page
├── setup/page.tsx          # Firebase setup instructions
├── dashboard/page.tsx      # Main dashboard
├── test-results/
│   ├── page.tsx           # Test results list
│   └── [id]/page.tsx      # Individual test detail
├── appointments/
│   ├── page.tsx           # View appointments
│   └── book/page.tsx      # Book new appointment
├── pharmacy-finder/page.tsx # Find nearby pharmacies
├── profile/page.tsx        # User profile management
└── layout.tsx              # Root layout with AuthProvider

components/
├── Navbar.tsx             # Top navigation bar
├── ui/                    # shadcn components

context/
└── AuthContext.tsx        # Authentication context provider

lib/
├── firebase.ts            # Firebase initialization
├── auth.ts               # Authentication utilities
├── firestore.ts          # Firestore database operations
```

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (free tier available)
- pnpm, npm, or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd meditrack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Email/Password authentication
   - Get your configuration from Project Settings
   - Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Create Firestore Database**
   - In Firebase Console, create a Firestore database in production mode
   - Set security rules to allow authenticated access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   - Navigate to `http://localhost:3000`
   - You'll see the setup guide or can proceed to login

## Database Schema

### Collections

**users/{userId}**
- fullName, email, phone, dateOfBirth, gender
- bloodType, allergies (array), medicalHistory (array)

**testResults/{testId}**
- patientId (reference), testName, testDate, status
- results (object), normalRanges (object), labId, pdfUrl

**appointments/{appointmentId}**
- patientId, testType, appointmentDate, labId, status

**labs/{labId}** (optional)
- name, address, coordinates, phone, availableTests (array)

**pharmacies/{pharmacyId}** (optional)
- name, address, coordinates, distance, phone, hours, rating

## Future Enhancements

### Coming Soon
- **Gemini API Integration** - AI-powered test result explanations
- **Google Maps API** - Real pharmacy locations and directions
- **Lab Portal** - Dashboard for lab staff to manage test results
- **Email Notifications** - Appointment reminders and test result alerts
- **PDF Reports** - Download test results as PDF
- **Advanced Analytics** - Health trends and insights
- **Telemedicine** - Video consultation with healthcare providers

## Optional Features Setup

### Google Maps Integration
1. Get an API key from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
   ```
3. Update `pharmacy-finder/page.tsx` to use real location data

### Gemini API Integration
1. Get an API key from [Google AI Studio](https://aistudio.google.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
3. Create `lib/gemini.ts` for API integration
4. Update test result detail page to use AI explanations

## Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## Security Considerations

- Environment variables for sensitive keys (see `.env.local.example`)
- Firestore security rules for user data isolation
- Client-side authentication validation
- HTTP-only cookies for session management (to be added)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Next.js server-side rendering and static generation
- Firestore real-time queries with proper indexing
- Optimized images and lazy loading
- Tailwind CSS for minimal bundle size

## Contributing

To contribute to MediTrack:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions:
- Check the [setup guide](/app/setup) in the app
- Review Firebase documentation
- Check Next.js documentation

## Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend by [Firebase](https://firebase.google.com/)
