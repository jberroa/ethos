import { Type } from "@google/genai";

export type UserRole = 'ADMIN' | 'EXECUTIVE' | 'MANAGER';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hospitalId: string;
  // For Managers
  employeeId?: string;
  permissions?: string[];
  // For Executives/Admins
  email?: string;
  password?: string;
}

export interface Round {
  id: number;
  managerId: string;
  managerName: string;
  department: 'EVS' | 'Food Service' | 'Nursing' | 'Other';
  patientRoom: string;
  patientName: string;
  timestamp: string;
  dayOfWeek: string;
  isWeekend: boolean;
  mood: 'Positive' | 'Neutral' | 'Negative';
  notes: string;
  durationMinutes: number;
  authenticityScore: number; // 0-100
  sentimentScore: number; // -1 to 1
  checklistData: Record<string, any>;
}

export interface Room {
  id: number;
  roomNumber: string;
  unit: string;
  department: string;
  hospitalId?: string;
}

export interface ManagerFeedback {
  id: number;
  managerId: string;
  managerName: string;
  feedback: string;
  timestamp: string;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string;
  type: 'Behavioral' | 'Quality';
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface UnitSatisfaction {
  unit: string;
  hcahpsCleanliness: number;
  hcahpsQuietness: number;
  hcahpsNurseComm: number;
  hcahpsStaffResponsiveness: number;
  trend: 'up' | 'down' | 'stable';
}

export interface BehavioralMetric {
  managerId: string;
  managerName: string;
  averageRoundsPerDay: number;
  fridayRushIndex: number; // Ratio of Friday PM rounds vs rest of week
  weekendConsistency: number; // Ratio of weekend rounds vs weekday
  averageAuthenticity: number;
  moodTrend: string;
}

export const ROUND_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    authenticityScore: {
      type: Type.NUMBER,
      description: "Score from 0-100 indicating how genuine the rounding notes feel. Low scores for generic, repetitive, or extremely brief notes.",
    },
    sentimentScore: {
      type: Type.NUMBER,
      description: "Sentiment of the interaction from -1 (very negative) to 1 (very positive).",
    },
    detectedMood: {
      type: Type.STRING,
      description: "The manager's likely mood during the round based on the text.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the interaction.",
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["Behavioral", "Quality"] }
        }
      }
    }
  },
  required: ["authenticityScore", "sentimentScore", "detectedMood", "summary", "suggestedActions"],
};
