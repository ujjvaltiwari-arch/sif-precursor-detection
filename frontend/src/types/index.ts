export interface Report {
  id: number;
  report_text: string;
  report_type: string;
  site?: string;
  department?: string;
  date?: string;
  created_at?: string;
  prediction?: Prediction;
}

export interface Prediction {
  id: number;
  report_id: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence_score: number;
  sif_precursor: boolean;
  detected_precursors: Precursor[];
  explanation: string;
  review_priority: string;
  model_version?: string;
  created_at?: string;
}

export interface Precursor {
  name: string;
  confidence: number;
  category?: string;
}

export interface MissingControl {
  control: string;
  category: string;
}

export interface AnalysisResult {
  report_id: number;
  analysis: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence_score: number;
    sif_precursor: boolean;
    detected_precursors: Precursor[];
    missing_controls: MissingControl[];
    important_phrases: string[];
    explanation: string;
    review_priority: string;
  };
}

export interface Overview {
  total_reports: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  most_common_precursor: string;
  highest_risk_site: string;
  highest_risk_department: string;
  recent_alerts_count: number;
}

export interface TrendPoint {
  name: string;
  count: number;
}

export interface TrendsData {
  precursor_trends: TrendPoint[];
  risk_distribution: { HIGH: number; MEDIUM: number; LOW: number };
  department_trends: (TrendPoint & { HIGH: number; MEDIUM: number; LOW: number })[];
  site_trends: (TrendPoint & { HIGH: number; MEDIUM: number; LOW: number })[];
  recurring_hazards: { hazard: string; count: number }[];
  missing_control_trends: { control: string; count: number }[];
}

export interface HeatmapSite {
  name: string;
  risk_count: number;
}

export interface HeatmapData {
  sites: HeatmapSite[];
}

export interface Alert {
  id: number;
  report_id: number;
  risk_level: string;
  status: string;
  report_text?: string;
  created_at?: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface Review {
  id: number;
  report_id: number;
  status: 'confirmed' | 'false_positive' | 'needs_review';
  comments?: string;
  preventive_action?: string;
  reviewer?: string;
  created_at?: string;
}
