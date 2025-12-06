export enum DietType {
  NONE = 'None',
  VEGAN = 'Vegan',
  VEGETARIAN = 'Vegetarian',
  PESCATARIAN = 'Pescatarian',
  HALAL = 'Halal',
  KOSHER = 'Kosher'
}

export interface UserPreferences {
  diet: DietType;
  allergies: string[];
  customAvoidances: string;
}

export enum SafetyStatus {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  UNSAFE = 'UNSAFE',
  UNKNOWN = 'UNKNOWN'
}

export interface IngredientFlag {
  name: string;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TechnicalTerm {
  term: string;
  explanation: string;
  commonName?: string;
}

export interface AnalysisResult {
  status: SafetyStatus;
  summary: string;
  flaggedIngredients: IngredientFlag[];
  technicalTerms: TechnicalTerm[];
  veganStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNCERTAIN' | 'NOT_APPLICABLE';
}
