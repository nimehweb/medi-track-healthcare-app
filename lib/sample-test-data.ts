/**
 * Sample test data for Test Result Detail Page with Gemini AI
 * This file contains example data structures for testing the enhanced page
 */

import { Timestamp } from 'firebase/firestore'

// Example 1: Complete Blood Count with Medications
export const sampleCompleteBloodCount = {
  id: 'test-001-cbc',
  patientId: 'patient-123',
  labId: 'lab-001-pathology-center',
  testName: 'Complete Blood Count (CBC)',
  testType: 'blood',
  status: 'viewed',
  uploadedAt: Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
  viewedAt: Timestamp.fromDate(new Date('2024-01-15T14:00:00')),
  results: {
    'WBC (White Blood Cells)': 7.2,
    'RBC (Red Blood Cells)': 4.8,
    'Hemoglobin': 14.5,
    'Hematocrit': 43,
    'Platelets': 245,
  },
  normalRanges: {
    'WBC (White Blood Cells)': '4.5-11.0 K/uL',
    'RBC (Red Blood Cells)': '4.5-5.9 M/uL',
    'Hemoglobin': '13.5-17.5 g/dL',
    'Hematocrit': '40-50 %',
    'Platelets': '150-400 K/uL',
  },
  explanation: 'Your Complete Blood Count shows all values within normal ranges. The WBC level of 7.2 K/uL indicates your immune system is functioning normally with no signs of infection or immunosuppression. Your hemoglobin and hematocrit levels are healthy, suggesting good oxygen-carrying capacity in your blood. The platelet count of 245 K/uL is normal, indicating normal blood clotting ability. These results are reassuring and suggest your overall blood health is good.',
  medications: [
    {
      id: 'med-001',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'once daily',
      prescribedBy: 'Dr. Sarah Johnson',
      drugInfo: 'Vitamin D3 is a form of Vitamin D that helps your body absorb calcium and maintain bone health. It also supports immune system function. Common side effects are rare when taken at recommended doses, but can include nausea or constipation. Take it with a meal containing fat to improve absorption. Most people tolerate this well as a daily supplement.',
    },
    {
      id: 'med-002',
      name: 'Iron Supplement',
      dosage: '325mg',
      frequency: 'once daily',
      prescribedBy: 'Dr. Sarah Johnson',
      drugInfo: 'Iron supplements help treat or prevent iron-deficiency anemia by increasing the amount of iron in your body. Common side effects include nausea, constipation, or dark stools. Take on an empty stomach for better absorption, or with food if stomach upset occurs. Avoid taking with tea or coffee as they can reduce iron absorption.',
    },
  ],
  pdfUrl: 'https://example.com/results/test-001-cbc.pdf',
  notes: 'Patient appeared in good health. No symptoms reported. Follow-up test recommended in 6 months.',
}

// Example 2: Lipid Panel (without medications)
export const sampleLipidPanel = {
  id: 'test-002-lipid',
  patientId: 'patient-123',
  labId: 'lab-001-pathology-center',
  testName: 'Lipid Panel',
  testType: 'blood',
  status: 'ready',
  uploadedAt: Timestamp.fromDate(new Date('2024-01-20T11:00:00')),
  results: {
    'Total Cholesterol': 185,
    'LDL (Bad Cholesterol)': 110,
    'HDL (Good Cholesterol)': 55,
    'Triglycerides': 100,
  },
  normalRanges: {
    'Total Cholesterol': '<200 mg/dL',
    'LDL (Bad Cholesterol)': '<100 mg/dL (optimal)',
    'HDL (Good Cholesterol)': '>40 mg/dL (men), >50 mg/dL (women)',
    'Triglycerides': '<150 mg/dL',
  },
  // No explanation yet - will be fetched from Gemini
  medications: [],
  pdfUrl: 'https://example.com/results/test-002-lipid.pdf',
  notes: 'Patient fasting blood work. Good results overall.',
}

// Example 3: Thyroid Function Test (with error state)
export const sampleThyroidTest = {
  id: 'test-003-thyroid',
  patientId: 'patient-123',
  labId: 'lab-001-pathology-center',
  testName: 'Thyroid Function Test (TSH, T3, T4)',
  testType: 'blood',
  status: 'ready',
  uploadedAt: Timestamp.fromDate(new Date('2024-01-22T09:15:00')),
  results: {
    'TSH': 2.5,
    'Free T4': 0.95,
    'Total T3': 130,
  },
  normalRanges: {
    'TSH': '0.4-4.0 mIU/L',
    'Free T4': '0.7-1.9 ng/dL',
    'Total T3': '80-200 ng/dL',
  },
  // Explanation will be fetched from Gemini
  // If Gemini API fails, fallback message will be shown
  medications: [
    {
      id: 'med-003',
      name: 'Levothyroxine',
      dosage: '50 mcg',
      frequency: 'once daily',
      prescribedBy: 'Dr. Emily Chen',
      // drugInfo will be fetched from Gemini if not cached
    },
  ],
  pdfUrl: 'https://example.com/results/test-003-thyroid.pdf',
  notes: 'Regular thyroid monitoring. Patient on levothyroxine.',
}

// Example 4: Glucose Tolerance Test (abnormal values)
export const sampleGlucoseTest = {
  id: 'test-004-glucose',
  patientId: 'patient-123',
  labId: 'lab-002-diagnostic-center',
  testName: 'Fasting Blood Glucose',
  testType: 'blood',
  status: 'ready',
  uploadedAt: Timestamp.fromDate(new Date('2024-01-25T08:00:00')),
  results: {
    'Fasting Glucose': 118,
  },
  normalRanges: {
    'Fasting Glucose': '70-100 mg/dL (normal), 100-125 mg/dL (prediabetes), >125 mg/dL (diabetes)',
  },
  medications: [
    {
      id: 'med-004',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'twice daily',
      prescribedBy: 'Dr. James Wilson',
    },
  ],
  pdfUrl: 'https://example.com/results/test-004-glucose.pdf',
  notes: 'Patient shows elevated fasting glucose. Recommend dietary changes and increased exercise.',
}

// Example 5: Liver Function Test (multiple values)
export const sampleLiverFunctionTest = {
  id: 'test-005-liver',
  patientId: 'patient-123',
  labId: 'lab-001-pathology-center',
  testName: 'Liver Function Test (LFT)',
  testType: 'blood',
  status: 'viewed',
  uploadedAt: Timestamp.fromDate(new Date('2024-01-10T14:30:00')),
  viewedAt: Timestamp.fromDate(new Date('2024-01-10T16:00:00')),
  results: {
    'Total Bilirubin': 0.7,
    'Direct Bilirubin': 0.2,
    'Indirect Bilirubin': 0.5,
    'AST (SGOT)': 28,
    'ALT (SGPT)': 32,
    'Alkaline Phosphatase': 75,
    'Albumin': 4.0,
    'Total Protein': 6.8,
  },
  normalRanges: {
    'Total Bilirubin': '<1.2 mg/dL',
    'Direct Bilirubin': '<0.3 mg/dL',
    'Indirect Bilirubin': '<0.9 mg/dL',
    'AST (SGOT)': '10-40 U/L',
    'ALT (SGPT)': '7-56 U/L',
    'Alkaline Phosphatase': '44-147 U/L',
    'Albumin': '3.5-5.0 g/dL',
    'Total Protein': '6.0-8.3 g/dL',
  },
  medications: [],
  pdfUrl: 'https://example.com/results/test-005-liver.pdf',
  notes: 'All liver function parameters are normal. No hepatic dysfunction detected.',
}

// Type definitions for reference
export interface SampleTestResult {
  id: string
  patientId: string
  labId: string
  testName: string
  testType: string
  status: 'pending' | 'ready' | 'viewed'
  uploadedAt: Timestamp
  viewedAt?: Timestamp
  results: Record<string, number>
  normalRanges: Record<string, string>
  explanation?: string
  medications: Array<{
    id?: string
    name: string
    dosage: string
    frequency: string
    prescribedBy?: string
    drugInfo?: string
  }>
  pdfUrl?: string
  notes?: string
}

/**
 * Usage in tests:
 *
 * import { sampleCompleteBloodCount } from '@/lib/sample-test-data'
 *
 * // Mock Firestore to return sample data
 * jest.mock('@/lib/firestore', () => ({
 *   getTestResultById: jest.fn(() => ({
 *     data: sampleCompleteBloodCount,
 *     error: null,
 *   })),
 * }))
 *
 * // Test the page
 * render(<TestDetailPage />)
 * // Assert component displays sample data
 */
