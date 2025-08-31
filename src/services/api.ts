// =====================
// API Configuration
// =====================
const API_BASE_URL = 'http://localhost:5000/api';

// DeepSeek API Configuration
const DEEPSEEK_API_KEY = 'sk-57104a7f80b94a2eb28e88abe51203b6';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// =====================
// Type Definitions
// =====================
export interface User {
  user(user: any): unknown;
  data: any;
  id: string;
  name: string;
  email: string;
  role: 'hr' | 'candidate';
}

export interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
}

export interface JobMatch {
  id: number;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  certificationsMatch: number;
  summary: string;
  requirements: string[];
  salary: string;
  type: string;
  courses: Array<{
    title: string;
    provider: string;
    url: string;
  }>;
}

export interface Interview {
  id: number;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'completed';
  meetingLink?: string;
  notes?: string;
  interviewer?: string;
}

export interface FeedbackAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  keywords: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  redFlags: string[];
  strengths: string[];
  recommendation: string;
}

// =====================
// DeepSeek API Client
// =====================
class DeepSeekClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = DEEPSEEK_API_URL;
  }

  async generateText(prompt: string, temperature: number = 0.7): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }
}

// Singleton client
const deepSeekClient = new DeepSeekClient(DEEPSEEK_API_KEY);

// =====================
// Resume Extractor
// =====================
export class ResumeExtractor {
  static async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const text = new TextDecoder().decode(uint8Array);
          const extractedText = text
            .replace(/[^\x20-\x7E\n]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          resolve(extractedText || 'Unable to extract text from PDF');
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  static async extractTextFromDOCX(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve('DOCX content extracted (demo mode)');
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  static async getResumeText(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.extractTextFromDOCX(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }
}

// =====================
// Resume Analysis Service
// =====================
export class ResumeAnalysisService {
  static getUserResumes() {
    throw new Error('Method not implemented.');
  }
  static findJobMatches(resumeId: string) {
    throw new Error('Method not implemented.');
  }
  static async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `Analyze the following resume and return structured JSON data.

Resume:
${resumeText}

Format:
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "skills": [],
  "experience": [{"title": "...", "company": "...", "duration": "...", "description": "..."}],
  "education": [{"degree": "...", "school": "...", "year": "..."}]
}`;
    try {
      const response = await deepSeekClient.generateText(prompt, 0.3);
      const cleaned = this.cleanJsonResponse(response);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Resume analysis failed:', error);
      return {
        name: 'Demo User',
        email: 'demo@email.com',
        phone: '+1 (000) 000-0000',
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
      };
    }
  }

  private static cleanJsonResponse(response: string): string {
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}');
    return jsonStart !== -1 && jsonEnd !== -1
      ? response.substring(jsonStart, jsonEnd + 1)
      : response;
  }
}

// =====================
// Job Matching Service
// =====================
export class JobMatchingService {
  static applyToJob(id: number, currentAnalysisId: any) {
    throw new Error('Method not implemented.');
  }
  // ... keep your existing code here ...
}

// =====================
// Interview Scheduling Service
// =====================
export class InterviewSchedulingService {
  static async getUserInterviews() {
    const res = await fetch(`${API_BASE_URL}/interviews`);
    if (!res.ok) throw new Error('Failed to fetch interviews');
    return res.json();
  }

  static async respondToInterview(interviewId: string, response: 'accept' | 'decline') {
    const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response }),
    });
    if (!res.ok) throw new Error('Failed to respond to interview');
    return res.json();
  }

  static generateInterviewSlots(startDate: Date, daysAhead = 7): Date[] {
    const slots: Date[] = [];
    const currentDate = new Date(startDate);
    for (let day = 0; day < daysAhead; day++) {
      for (let hour of [9, 10, 11, 14, 15, 16]) {
        const slot = new Date(currentDate);
        slot.setHours(hour, 0, 0, 0);
        slots.push(slot);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return slots;
  }
}

// =====================
// Feedback Analysis Service
// =====================
export class FeedbackAnalysisService {
  static async analyzeFeedback(
    feedbackText: string
  ): Promise<FeedbackAnalysis> {
    const prompt = `Analyze the feedback and return ONLY JSON.
Feedback:
${feedbackText}

Format:
{"sentiment":"positive","score":0.8,"confidence":0.9,"keywords":{"positive":[],"negative":[],"neutral":[]},"redFlags":[],"strengths":[],"recommendation":""}`;

    try {
      const response = await deepSeekClient.generateText(prompt, 0.3);
      return JSON.parse(this.cleanJsonResponse(response));
    } catch {
      return {
        sentiment: 'positive',
        score: 0.75,
        confidence: 0.87,
        keywords: { positive: [], negative: [], neutral: [] },
        redFlags: [],
        strengths: [],
        recommendation: 'Proceed.',
      };
    }
  }

  private static cleanJsonResponse(response: string): string {
    const start = response.indexOf('{');
    const end = response.lastIndexOf('}');
    return start !== -1 && end !== -1
      ? response.substring(start, end + 1)
      : response;
  }
}

// =====================
// Auth Service
// =====================
export class AuthService {
  static register(arg0: { email: string; password: string; name: string; role: "hr" | "candidate"; }) {
    throw new Error('Method not implemented.');
  }
  static setAuthToken(token: string) {
    throw new Error('Method not implemented.');
  }
  static async login(
    email: string,
    password: string,
    role: 'hr' | 'candidate'
  ): Promise<User> {
    await new Promise((r) => setTimeout(r, 500));
    const user: User = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      user: function (user: any): unknown {
        throw new Error("Function not implemented.");
      },
      data: undefined
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  static logout() {
    localStorage.removeItem('user');
  }

  static getCurrentUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}

// =====================
// Storage Service
// =====================
export class StorageService {
  static saveResumeAnalysis(analysis: ResumeAnalysis) {
    const analyses = this.getResumeAnalyses();
    analyses.push({ ...analysis, id: Date.now().toString() });
    localStorage.setItem('resumeAnalyses', JSON.stringify(analyses));
  }

  static getResumeAnalyses(): any[] {
    const stored = localStorage.getItem('resumeAnalyses');
    return stored ? JSON.parse(stored) : [];
  }

  static saveJobMatches(matches: JobMatch[]) {
    localStorage.setItem('jobMatches', JSON.stringify(matches));
  }

  static getJobMatches(): JobMatch[] {
    const stored = localStorage.getItem('jobMatches');
    return stored ? JSON.parse(stored) : [];
  }

  static saveInterview(interview: Interview) {
    const interviews = this.getInterviews();
    interviews.push(interview);
    localStorage.setItem('interviews', JSON.stringify(interviews));
  }

  static getInterviews(): Interview[] {
    const stored = localStorage.getItem('interviews');
    return stored ? JSON.parse(stored) : [];
  }

  static updateInterview(id: number, updates: Partial<Interview>) {
    const interviews = this.getInterviews();
    const idx = interviews.findIndex((i) => i.id === id);
    if (idx !== -1) {
      interviews[idx] = { ...interviews[idx], ...updates };
      localStorage.setItem('interviews', JSON.stringify(interviews));
    }
  }
}
