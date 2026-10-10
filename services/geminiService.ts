import { 
  ChangeToolId, 
  AnalysisResult, 
  Employee, 
  CoachingGuide, 
  AssessmentQuestion, 
  AssessmentResponse 
} from "../types";

const modelName = "gemini-3.1-pro-preview";
// Schnelles Modell für Zwischenfragen im Frage-Antwort-Fluss (ca. 3x schneller laut Messung vom 2026-10-09).
// Der Abschlussbericht läuft weiter über das Pro-Modell.
const fastModelName = "gemini-3-flash-preview";
const QUESTIONS_BEFORE_RESULT = 4;

export interface VentureConcept {
  id: string;
  name: string;
  tagline: string;
  problem_solved: string;
  reddit_trend_connection: string;
  monetization_strategy: string;
  exit_scenario_300k: string;
  roadmap_6_months: string[];
}

export interface VentureDeepDive {
  market_potential: string;
  target_persona: string;
  usp_details: string;
  tech_stack: string[];
  extended_roadmap: {
    phase: string;
    duration: string;
    milestones: string[];
  }[];
  strategic_risks: {
    risk: string;
    mitigation: string;
  }[];
}

export interface OrgAnalysisOutput {
  executive_summary: string;
  maturity_score: number;
  strengths: string[];
  weaknesses: string[];
  optimization_proposals: {
    short_term: string[];
    long_term: string[];
  };
}

export interface OrgQuestionState {
  next_question?: { text: string; options: string[] };
  final_result?: OrgAnalysisOutput;
}

export interface ReorgSimulatorOutput {
  impact_analysis: { title: string; description: string };
  diagnosis: { key_assumptions: string[] };
  roadmap_30_60_90: {
    day_30: string[];
    day_60: string[];
    day_90: string[];
  };
  risk_register: { risk: string; early_signals: string[]; mitigations: string[] }[];
  communication_plan: {
    talktracks: { audience: string; core_message: string; faq_samples: { q: string; a: string }[] }[];
  };
}

export interface ReorgQuestionState {
  next_question?: { text: string; options: string[] };
  final_result?: ReorgSimulatorOutput;
}

export interface CultureHypothesis {
  id: string;
  text: string;
  reasoning: string;
}

export interface CultureAnalysisResult {
  profile: {
    title: string;
    summary: string;
    shadow_culture_traits: string[];
    strengths: string[];
  };
  levers: { area: string; impact: 'High' | 'Medium' | 'Low'; description: string }[];
  interventions: { title: string; target: string; action: string }[];
  experiment_plan_6_weeks: { week: string; focus: string; experiment: string; success_signal: string }[];
}

export interface StrategyOption {
  id: string;
  title: string;
  description: string;
  opportunity_space: string;
}

export interface StrategyPlanResult {
  one_page_strategy: {
    vision_statement: string;
    target_audience: string;
    unique_value_proposition: string;
  };
  implementation: {
    decision_logic: string;
    main_focus: string;
    initiative_portfolio: { name: string; priority: 'High' | 'Medium' | 'Low'; impact: string }[];
    kpi_framework: { kpi: string; target: string }[];
  };
  roadmap: { phase: string; timing: string; milestones: string[] }[];
  risks: { risk: string; mitigation: string }[];
}

// Helper to safely parse AI responses
const safeParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    const cleaned = text.trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Gemini JSON Parse Error:", e, text);
    return null;
  }
};

// Führt einen Schritt eines Frage-Antwort-Flusses aus: Zwischenfragen mit dem schnellen Modell,
// der Abschluss (nach 4 Antworten) mit dem Pro-Modell. Liefert das schnelle Modell kein
// brauchbares Format, wird einmal mit dem Pro-Modell wiederholt.
const runQuestionStep = async (history: any[], config: any) => {
  const answers = history.filter(m => m.role === 'user').length - 1;
  const isFinalStep = answers >= QUESTIONS_BEFORE_RESULT;
  const run = async (model: string) => {
    const response = await generateContent({ model, contents: history, config });
    return safeParse(response.text);
  };
  if (isFinalStep) return run(modelName);
  try {
    const fast = await run(fastModelName);
    if (fast && (fast.next_question?.text || fast.final_result)) return fast;
  } catch (e) {
    console.error("Fast model failed, falling back to Pro:", e);
  }
  return run(modelName);
};

export const generateContent = async (params: { model?: string, contents: any, config?: any }) => {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- RESULTA CHAT LOGIC ---
export const startResultaChat = (lang: 'de' | 'en' = 'de') => {
  return {
    sendMessage: async ({ message, history }: { message: string, history?: any[] }) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history, lang }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to communicate with chat server');
      }
      
      const data = await res.json();
      return { text: data.text };
    }
  };
};

// Generate systemic questions
export const generateSystemicQuestions = async (scenario: string, companyDesc: string, lang: 'de' | 'en' = 'de'): Promise<AssessmentQuestion[]> => {
  const prompt = `Generiere 4 tiefgehende systemische Fragen für dieses Change-Szenario: ${scenario}. Kontext: ${companyDesc}. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. 
  Antworte in JSON: [{id: string, text: string, placeholder: string}]`;
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text) || [];
};

// Analyze leadership team
export const analyzeLeadershipTeam = async (employees: Employee[], toolAnswers: AssessmentResponse[], lang: 'de' | 'en' = 'de'): Promise<string> => {
  const prompt = `Analysiere dieses Führungsteam: ${JSON.stringify(employees)}. Audit-Antworten: ${JSON.stringify(toolAnswers)}. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. Erstelle einen professionellen Bericht.`;
  const response = await generateContent({
    model: modelName,
    contents: prompt
  });
  return response.text || "";
};

// Generate coaching guide
export const generateEmployeeCoaching = async (employee: Employee, lang: 'de' | 'en' = 'de'): Promise<CoachingGuide | null> => {
  const prompt = `Erstelle einen coaching-leitfaden für diesen Mitarbeiter: ${JSON.stringify(employee)}. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. 
  Antworte in JSON: {employeeName: string, focusArea: string, openingQuestion: string, keyPoints: string[], actionPlan: string}`;
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text);
};

// Returns hardcoded assessment questions
export const getLeadershipAuditQuestions = (lang: 'de' | 'en' = 'de'): AssessmentQuestion[] => {
  return [
    { id: 'l1', text: lang === 'de' ? "Wie schätzen Sie die psychologische Sicherheit im Team ein?" : "How do you assess psychological safety in the team?", placeholder: "..." },
    { id: 'l2', text: lang === 'de' ? "Wie klar sind die Rollen und Verantwortlichkeiten?" : "How clear are roles and responsibilities?", placeholder: "..." },
    { id: 'l3', text: lang === 'de' ? "Gibt es eine gemeinsam Vision?" : "Is there a shared vision?", placeholder: "..." }
  ];
};

// Progress organizational analysis
export const processOrgAnalysisStep = async (history: any[], lang: 'de' | 'en' = 'de'): Promise<OrgQuestionState | null> => {
  return runQuestionStep(history, { 
        responseMimeType: "application/json",
        systemInstruction: `Du bist ein Senior Management Consultant bei hs:results. Deine Aufgabe ist es, ein tiefgehendes Organisations-Audit durchzuführen. 
        
        PROZESS-FLOW:
        1. Evaluiere die Historie. Zähle die Anzahl der Fragen, die der Nutzer bereits beantwortet hat.
        2. Wenn der Nutzer weniger als 4 Fragen beantwortet hat: Stelle die NÄCHSTE schlaue, systemische Frage.
        3. Gib dem Nutzer immer 3-4 Antwortoptionen (options) zur Auswahl.
        4. Rückgabeformat bei Fragen: { "next_question": { "text": "Fragetext", "options": ["Option A", "Option B", "Option C"] } }
        5. ERST WENN GENAU 4 Fragen beantwortet wurden: Liefere das finale Ergebnis (final_result).
        6. Rückgabeformat bei Endergebnis: { "final_result": { "executive_summary": "...", "maturity_score": 0-100, "strengths": ["..."], "weaknesses": ["..."], "optimization_proposals": { "short_term": ["..."], "long_term": ["..."] } } }
        
        WICHTIG: Antworte AUSSCHLIESSLICH im JSON-Format. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}.`
    });
};

// Progress reorg step
export const processReorgStep = async (history: any[], lang: 'de' | 'en' = 'de'): Promise<ReorgQuestionState | null> => {
  return runQuestionStep(history, { 
        responseMimeType: "application/json",
        systemInstruction: `Du bist ein Experte für Reorganisation und Transformation. Du begleitest den Nutzer durch eine Simulation von Strukturveränderungen.
        
        PROZESS-FLOW:
        1. Evaluiere die Historie.
        2. Wenn weniger als 4 strategische Fragen beantwortet wurden: Stelle die nächste präzise Frage.
        3. Gib immer 3-4 Antwortoptionen (options) vor.
        4. Rückgabeformat bei Fragen: { "next_question": { "text": "Fragetext", "options": ["Option 1", "Option 2", "Option 3"] } }
        5. ERST NACH 4 Antworten: Generiere das finale Ergebnis (final_result).
        6. Rückgabeformat bei Endergebnis: { "final_result": { "impact_analysis": { "title": "...", "description": "..." }, "diagnosis": { "key_assumptions": ["..."] }, "roadmap_30_60_90": { "day_30": ["..."], "day_60": ["..."], "day_90": ["..."] }, "risk_register": [{ "risk": "...", "early_signals": ["..."], "mitigations": ["..."] }], "communication_plan": { "talktracks": [{ "audience": "...", "core_message": "...", "faq_samples": [{ "q": "...", "a": "..." }] }] } } }
        
        WICHTIG: Antworte AUSSCHLIESSLICH im JSON-Format. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}.`
    });
};

// Generate culture hypotheses
export const generateCultureHypotheses = async (stories: any, lang: 'de' | 'en' = 'de'): Promise<CultureHypothesis[]> => {
  const prompt = `Du bist ein erfahrener Unternehmensberater. Basierend auf diesen kulturellen Geschichten, generiere genau 3 mutige Kulturhypothesen.
  Stories: ${JSON.stringify(stories)}. 
  Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. 
  Antworte STRENG im JSON-Format als Array mit dieser Struktur: 
  [{"id": "h1", "text": "Hypothesen-Text", "reasoning": "Kurze systemische Begründung"}]`;
  
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text) || [];
};

// Generate dynamic culture goals
export const generateCultureGoals = async (context: any, lang: 'de' | 'en' = 'de'): Promise<string[]> => {
  const prompt = `Basierend auf diesem Organisations-Kontext und diesen kulturellen Beobachtungen: ${JSON.stringify(context)}. 
  Generiere genau 3 prägnante, mutige und gegensätzliche strategische Zielrichtungen (Nordsterne) für die Kulturentwicklung dieser spezifischen Organisation.
  Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. 
  Antworte STRENG im JSON-Format als einfaches Array von Strings: ["Richtung 1", "Richtung 2", "Richtung 3"]`;
  
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text) || [];
};

// Generate final culture analysis plan
export const generateCultureAnalysisPlan = async (stories: any, ratings: any[], direction: string, lang: 'de' | 'en' = 'de'): Promise<CultureAnalysisResult | null> => {
  const prompt = `Erstelle einen umfassenden Kultur-Analyse-Plan als Senior Executive Consultant bei hs:results.
  
  EINGABEN:
  - Beobachtete Geschichten: ${JSON.stringify(stories)}
  - Validierte Hypothesen: ${JSON.stringify(ratings)}
  - Strategische Zielrichtung: ${direction}
  - Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}.
  
  ERGEBNIS-STRUKTUR (STRENGES JSON):
  {
    "profile": {
      "title": "Titel der Analyse",
      "summary": "Executive Zusammenfassung des Ist-Zustands",
      "shadow_culture_traits": ["Negatives Muster 1", "Negatives Muster 2"],
      "strengths": ["Positive Ressource 1", "Positive Ressource 2"]
    },
    "levers": [
      { "area": "Handlungsfeld", "impact": "High/Medium/Low", "description": "Warum wichtig?" }
    ],
    "interventions": [
      { "title": "Maßnahme", "target": "Zielgruppe", "action": "Konkrete Umsetzung" }
    ],
    "experiment_plan_6_weeks": [
      { "week": "Woche 1", "focus": "Schwerpunkt", "experiment": "Hypothesen-Experiment", "success_signal": "Woran messen wir Erfolg?" }
    ]
  }`;

  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text);
};

// Generate strategy options
export const generateStrategyOptions = async (context: any, lang: 'de' | 'en' = 'de'): Promise<StrategyOption[]> => {
  const prompt = `Generiere 3 Strategie-Optionen. Kontext: ${JSON.stringify(context)}. Sprache: ${lang}. Antworte in JSON: [{id: string, title: string, description: string, opportunity_space: string}]`;
  const run = async (model: string) => {
    const response = await generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return safeParse(response.text);
  };
  // Schnelles Modell zuerst, bei unbrauchbarem Ergebnis einmal mit Pro wiederholen.
  try {
    const fast = await run(fastModelName);
    if (Array.isArray(fast) && fast.length > 0 && fast[0]?.title) return fast;
  } catch (e) {
    console.error("Fast model failed, falling back to Pro:", e);
  }
  return (await run(modelName)) || [];
};

// Create a comprehensive strategy plan
export const generateStrategyFinalPlan = async (context: any, selected: StrategyOption, answers: any[], lang: 'de' | 'en' = 'de'): Promise<StrategyPlanResult | null> => {
  const prompt = `Erstelle einen detaillierten und finalen Strategie-Plan als Senior Strategy Consultant bei hs:results.
  
  EINGABEN:
  - Organisations-Kontext: ${JSON.stringify(context)}
  - Gewählte Strategische Option: ${JSON.stringify(selected)}
  - Deep-Dive Antworten des Nutzers: ${JSON.stringify(answers)}
  
  Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. 
  
  Antworte STRENG im JSON-Format gemessen am bereitgestellten Schema.`;

  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { 
      responseMimeType: "application/json"
    }
  });
  return safeParse(response.text);
};

// Generate venture forge concepts
export const generateVentureConcepts = async (dna: any, lang: 'de' | 'en' = 'de'): Promise<VentureConcept[]> => {
  const prompt = `Generiere 3 innovative Venture-Konzepte für: ${JSON.stringify(dna)}. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. Antworte STRENG im JSON-Format.`;
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.9 }
  });
  return safeParse(response.text) || [];
};

// Deep Dive into a specific Venture Concept
export const generateVentureDeepDive = async (concept: VentureConcept, dna: any, lang: 'de' | 'en' = 'de'): Promise<VentureDeepDive | null> => {
  const prompt = `Erstelle eine detaillierte Deep-Dive-Analyse für: ${concept.name}. Kontext: ${JSON.stringify(dna)}. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. Antworte in JSON.`;
  const response = await generateContent({
    model: modelName,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return safeParse(response.text);
};

// Simple text summarization task using Gemini 3 Flash
export const summarizeFileContent = async (fileName: string, contentSnippet: string, lang: 'de' | 'en' = 'de'): Promise<string> => {
  const prompt = `Fasse den Inhalt dieses Dokuments ("${fileName}") prägnant in 2-3 Sätzen zusammen. Sprache: ${lang === 'de' ? 'Deutsch' : 'Englisch'}. Dokument-Ausschnitt: ${contentSnippet}`;
  try {
    const response = await generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    return response.text || "Zusammenfassung nicht verfügbar.";
  } catch (error) {
    return "Fehler bei der Zusammenfassung.";
  }
};

// Utility to fetch questions for assessment tools
export const getAssessmentQuestions = (toolId: ChangeToolId, lang: 'de' | 'en' = 'de'): AssessmentQuestion[] => {
  const questions: Record<string, AssessmentQuestion[]> = {
    plan_kotter: [
      { id: 'k1', text: lang === 'de' ? "Was ist der Haupttreiber für die Dringlichkeit?" : "What is the main driver for urgency?", placeholder: "Wettbewerbsdruck, Marktveränderung..." },
      { id: 'k2', text: lang === 'de' ? "Wer sind die wichtigsten Personen für die Führungskoalition?" : "Who are the key people for the guiding coalition?", placeholder: "Abteilungsleiter X, CEO, Projektleiter Y..." },
      { id: 'k3', text: lang === 'de' ? "Wie lautet die Kernvision?" : "What is the core vision?", placeholder: "Wir werden der effizienteste Anbieter durch..." }
    ],
    story_creation: [
      { id: 'st1', text: lang === 'de' ? "Wer ist der 'Drache' (Gefahr)?" : "Who is the 'Dragon'?", placeholder: "Die Irrelevanz am Markt..." },
      { id: 'st2', text: lang === 'de' ? "Was ist der 'Prinzessin' (Ziel)?" : "What is the 'Princess'?", placeholder: "Führerschaft in Technologie..." }
    ],
    analysis_swot: [
      { id: 'sw1', text: lang === 'de' ? "Stärken?" : "Strengths?", placeholder: "Expertise, Kapital..." },
      { id: 'sw2', text: lang === 'de' ? "Schwächen?" : "Weaknesses?", placeholder: "Alte Systeme, Prozesse..." }
    ],
    model_adkar: [
      { id: 'ad1', text: lang === 'de' ? "Status Bewusstsein?" : "Status Awareness?", placeholder: "Wissen die Mitarbeiter warum?" },
      { id: 'ad2', text: lang === 'de' ? "Größte Barrieren?" : "Main barriers?", placeholder: "Fehlende Skills..." }
    ],
    analysis_stakeholder: [
      { id: 'sh1', text: lang === 'de' ? "Wer sind die wichtigsten Gruppen?" : "Who are the key groups?", placeholder: "Betriebsrat, IT-Team, Kunden..." }
    ],
    analysis_gap: [
      { id: 'gap1', text: lang === 'de' ? "Ist-Zustand?" : "Current state?", placeholder: "Manuelle Prozesse, hohe Fehlerquote..." },
      { id: 'gap2', text: lang === 'de' ? "Soll-Zustand?" : "Desired state?", placeholder: "Automatisierter Workflow..." }
    ],
    risk_assessment: [
      { id: 'r1', text: lang === 'de' ? "Hauptrisiken?" : "Main risks?", placeholder: "Widerstand der Belegschaft, Budgetüberschreitung..." }
    ]
  };
  return questions[toolId] || [];
};

// Professional consultancy report generation
export const generateChangeAnalysis = async (
  toolId: ChangeToolId, 
  scenario: string, 
  companySize: string, 
  companyDesc: string, 
  companyUrl: string, 
  toolAnswers: AssessmentResponse[],
  cultureAnswers: AssessmentResponse[],
  lang: 'de' | 'en' = 'de'
): Promise<AnalysisResult | null> => {
  const prompt = `Du bist ein Senior Change Management Consultant. Erstelle einen tiefgehenden, hochprofessionellen Bericht für folgendes Szenario:
  SZENARIO: ${scenario}
  METHODE: ${toolId}
  KONTEXT: ${companyDesc}
  ANTWORTEN: ${JSON.stringify(toolAnswers)}
  KULTUR: ${JSON.stringify(cultureAnswers)}
  
  SPRACHE: ${lang === 'de' ? 'Deutsch' : 'Englisch'}
  
  DEIN BERICHT MUSS FOLGENDES JSON-FORMAT HABEN:
  {
    "summary": "Prägnante Management-Zusammenfassung",
    "systemic_diagnosis": "Tiefe Analyse der unsichtbaren Dynamiken und Widerstände",
    "strategic_logic": "Warum dieser Weg gewählt wurde",
    "phases": [
      { "title": "Phase 1", "description": "Details..." }
    ],
    "risks": [
      { "risk": "Name", "mitigation": "Gegenmaßnahme" }
    ],
    "action_plan": [
      { "task": "Konkrete Aufgabe", "priority": "High/Medium/Low", "target": "Zielgruppe/Verantwortlich" }
    ],
    "cultural_levers": ["Hebel 1", "Hebel 2"]
  }`;

  try {
    const response = await generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const parsed = safeParse(response.text);
    if (!parsed) return null;
    
    return {
      toolId,
      summary: parsed.summary || "Analyse erfolgreich erstellt.",
      data: parsed
    };
  } catch (error) {
    throw error;
  }
};
