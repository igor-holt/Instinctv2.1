export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface Section {
  title: string;
  icon: string;
  content: string;
  code?: string;
  math?: string;
  details?: string;
}

export interface ModuleData {
  id: string;
  zenodoId?: string;
  title: string;
  subtitle: string;
  icon: string; // key for Icon component
  color: string;
  bgGradient: string;
  summary: string;
  sections: Section[];
}

export interface TermDefinition {
  term: string;
  definition: string;
  category: 'Physics' | 'Architecture' | 'Orchestration';
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
};

export type TaskClassification = {
  complexity: number; // 0-1
  route: 'FAST_PATH' | 'LID_LIFT';
  reasoning: string;
  energyEstimate: number;
};