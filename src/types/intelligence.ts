export type IntelligenceLens =
  "DESIRE" | "VISION" | "MONEY" | "FRICTION" | "TIMING" | "SEKAIROS FIT";

export interface IntelligenceSignal {
  lens: IntelligenceLens;
  question: string;
  example: string;
}

export interface ExampleBrief {
  contact: string;
  role: string;
  company: string;
  context: string;
  signals: IntelligenceSignal[];
}
