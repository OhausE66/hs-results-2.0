
export enum ViewState {
  HOME = 'HOME',
  CHANGE_MANAGER = 'CHANGE_MANAGER',
  LEADERSHIP_RADAR = 'LEADERSHIP_RADAR',
  LOGIN = 'LOGIN'
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  performance: number; // 0-100
  motivation: number; // 0-100
  workload: number; // 0-100
  department: string;
  softSkills?: string[]; // New
  lastFeedback?: string; // New
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
  | 'story_creation'; // New

export interface ChangeToolDefinition {
  id: ChangeToolId;
  name: string;
  description: string;
  icon: any;
}

// New Types for Assessment
export interface AssessmentQuestion {
  id: string;
  text: string;
  placeholder: string;
}

export interface AssessmentResponse {
  questionId: string;
  questionText: string;
  answer: string;
}

// Generic Interfaces for dynamic content
export interface AnalysisResult {
  toolId: ChangeToolId;
  summary: string;
  data: any; // Dynamic based on tool
}

export interface KotterStep {
  step: number;
  name: string;
  action: string;
  rationale: string;
}

export interface SWOTItem {
  category: 'Strengths' | 'Weaknesses' | 'Opportunities' | 'Threats';
  points: string[];
}

export interface StakeholderGroup {
  group: string;
  interest: 'High' | 'Medium' | 'Low';
  power: 'High' | 'Medium' | 'Low';
  strategy: string; // e.g. "Manage Closely", "Keep Informed"
  tactics: string;
}

export interface GapAnalysisItem {
  area: string;
  current: string;
  target: string;
  action: string;
}

export interface AdkarStage {
  stage: 'Awareness' | 'Desire' | 'Knowledge' | 'Ability' | 'Reinforcement';
  status: string;
  tactic: string;
}

export interface ListeningStrategyItem {
  focusArea: string;
  metric: string; // e.g. "Meeting Load", "Sentiment Score"
  insight: string; // What to look for
  intervention: string; // Action
}

// New interface for Story
export interface StoryStrategy {
  style: 'Fight the Dragon' | 'Win the Princess' | 'Hybrid Approach';
  headline: string;
  narrative: string;
  keyMessage: string;
  callToAction: string;
}

// New Types for Leadership Radar
export interface CoachingGuide {
  employeeName: string;
  focusArea: string;
  openingQuestion: string;
  keyPoints: string[];
  actionPlan: string;
}
