
export enum ViewState {
  HOME = 'HOME',
  CHANGE_MANAGER = 'CHANGE_MANAGER',
  LEADERSHIP_RADAR = 'LEADERSHIP_RADAR',
  ORGANIZATION_ANALYZER = 'ORGANIZATION_ANALYZER',
  REORG_SIMULATOR = 'REORG_SIMULATOR',
  CULTURE_SCANNER = 'CULTURE_SCANNER',
  STRATEGY_CLARIFIER = 'STRATEGY_CLARIFIER',
  INNOVATION_IDEATOR = 'INNOVATION_IDEATOR',
  MICROTRAININGS = 'MICROTRAININGS',
  MINIMAL_INVASIVE_CHANGE = 'MINIMAL_INVASIVE_CHANGE',
  QUICKSTART = 'QUICKSTART',
  SPRINT_MY_ORG = 'SPRINT_MY_ORG',
  PIMP_MY_ORG = 'PIMP_MY_ORG',
  AGILE_CHANGE_BOOTCAMP = 'AGILE_CHANGE_BOOTCAMP',
  CLIENTS = 'CLIENTS',
  PUBLICATIONS = 'PUBLICATIONS',
  SECURITY = 'SECURITY',
  FILE_VAULT = 'FILE_VAULT',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE',
  LEGAL = 'LEGAL',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: string;
}

export interface FileRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  downloadURL: string;
  storagePath: string;
  notes: string;
  aiSummary: string;
  status: 'processing' | 'ready' | 'error';
}

export interface SavedProject {
  id: string;
  title: string;
  toolId: string;
  inputs: any; 
  results: any;
  createdAt: string;
  updatedAt: string;
}

export interface OrgContextData {
  id?: string;
  templateName: string;
  size: string;
  establishedSince: string;
  industry: string;
  innovationLevel: number;
  mainProblem: string;
  profitability: number;
  /** Optional: Adresse der Organisations-Webseite und daraus erzeugte Kurzzusammenfassung (fließt in die KI-Prompts). */
  websiteUrl?: string;
  websiteSummary?: string;
  lastAnalysisResults?: {
    toolId: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    score?: number;
    updatedAt: string;
  };
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  performance: number; 
  motivation: number; 
  workload: number; 
  department: string;
  softSkills?: string[];
  lastFeedback?: string;
  hbdiQuadrant?: 'A' | 'B' | 'C' | 'D';
  observations?: {
    positive: string[];
    critical: string[];
  };
}

export type ChangeToolId = 
  | 'plan_kotter' 
  | 'analysis_swot' 
  | 'analysis_stakeholder' 
  | 'analysis_gap' 
  | 'model_adkar' 
  | 'risk_assessment'
  | 'tool_culture_amp'
  | 'tool_qualtrics'
  | 'tool_viva'
  | 'story_creation';

export interface ChangeToolDefinition {
  id: ChangeToolId;
  name: string;
  description: string;
  icon: any;
}

export interface OrgContext {
  scenario: string;
  companyDesc: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  reorgDetails?: {
    type: string;
    goal: string;
    risks: string[];
    roadmap: any;
  };
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  placeholder: string;
  options?: string[];
}

export interface AssessmentResponse {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface AnalysisResult {
  toolId: ChangeToolId;
  summary: string;
  data: any;
}

export interface HBDIProfile {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface CoachingGuide {
  employeeName: string;
  focusArea: string;
  openingQuestion: string;
  keyPoints: string[];
  actionPlan: string;
}

export interface HBDIQuestion {
  id: number;
  question: string;
  options: {
    type: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
}