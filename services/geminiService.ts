
import { GoogleGenAI, Type } from "@google/genai";
import { ChangeToolId, AnalysisResult, Employee, CoachingGuide, AssessmentQuestion, AssessmentResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-2.5-flash";

// --- Configuration & Prompts ---

export const getAssessmentQuestions = (toolId: ChangeToolId): AssessmentQuestion[] => {
  switch (toolId) {
    case 'plan_kotter':
      return [
        { id: 'q1', text: "Was ist der absolute Auslöser, der diesen Wandel jetzt unausweichlich macht?", placeholder: "z.B. Umsatzrückgang, neue Technologie, Marktveränderung..." },
        { id: 'q2', text: "Wer sind die wichtigsten Schlüsselpersonen, die diesen Wandel vorantreiben könnten (Führungskoalition)?", placeholder: "Namen oder Rollen der Unterstützer..." },
        { id: 'q3', text: "Was ist Ihre Vision? Wie sieht das Unternehmen aus, wenn alles perfekt läuft?", placeholder: "In 2 Jahren sind wir..." },
        { id: 'q4', text: "Welche Hindernisse erwarten Sie (Strukturen, Kultur, Skills)?", placeholder: "Veraltete IT, Angst vor Jobverlust..." },
        { id: 'q5', text: "Gibt es sichtbare 'Quick Wins', die wir schnell erreichen können?", placeholder: "Prozessvereinfachung, Pilotprojekt..." }
      ];
    case 'analysis_swot':
      return [
        { id: 'q1', text: "Was läuft intern bei Ihnen aktuell besser als bei jedem Konkurrenten (Stärken)?", placeholder: "Technologie, Teamgeist, Patent..." },
        { id: 'q2', text: "Wo verlieren Sie aktuell am meisten Zeit oder Geld (Schwächen)?", placeholder: "Veraltete Prozesse, Fachkräftemangel..." },
        { id: 'q3', text: "Welche Marktentwicklung könnten Sie nutzen, wenn Sie schnell wären (Chancen)?", placeholder: "Neuer Markt, Gesetzesänderung..." },
        { id: 'q4', text: "Was macht Ihnen am Markt 'bauchschmerzen' (Risiken)?", placeholder: "Aggressive Wettbewerber, Preiskampf..." }
      ];
    case 'analysis_stakeholder':
      return [
        { id: 'q1', text: "Wer hat die Macht, das Projekt sofort zu stoppen?", placeholder: "Geschäftsführung, Betriebsrat..." },
        { id: 'q2', text: "Welche Gruppen verlieren durch den Wandel an Einfluss oder Komfort?", placeholder: "Mittleres Management, Abteilung X..." },
        { id: 'q3', text: "Wer profitiert am meisten von der Veränderung?", placeholder: "Kunden, Sales Team..." },
        { id: 'q4', text: "Wie wird aktuell im Unternehmen kommuniziert (Flurfunk vs. Offiziell)?", placeholder: "Viel Flurfunk, wenig Transparenz..." }
      ];
    case 'model_adkar':
      return [
        { id: 'q1', text: "Verstehen die Mitarbeiter wirklich, WARUM der Wandel nötig ist (Awareness)?", placeholder: "Eher nein, viele denken es ist nur eine Laune..." },
        { id: 'q2', text: "Wie hoch ist die Motivation mitzumachen (Desire)?", placeholder: "Gering, Veränderungsmüdigkeit..." },
        { id: 'q3', text: "Fehlt es an Wissen oder Fähigkeiten (Knowledge)?", placeholder: "Neue Softwarekenntnisse fehlen..." },
        { id: 'q4', text: "Können die Mitarbeiter das Neue im Alltag umsetzen (Ability)?", placeholder: "Zeit fehlt, Prozesse blockieren..." }
      ];
    case 'tool_culture_amp':
      return [
        { id: 'ca1', text: "Wie oft fragen Sie aktuell die Stimmung Ihrer Mitarbeiter ab (Puls)?", placeholder: "Jährlich, Monatlich, noch gar nicht..." },
        { id: 'ca2', text: "In welchen Teams/Abteilungen vermuten Sie die höchste 'Fluchtgefahr' (Retention Risk)?", placeholder: "IT, Sales, High Potentials..." },
        { id: 'ca3', text: "Gibt es Themen, bei denen Mitarbeiter sich nicht trauen, offen zu sprechen?", placeholder: "Kritik am Management, Fehlerkultur..." },
        { id: 'ca4', text: "Welches konkrete Verhalten wollen Sie bei Führungskräften fördern?", placeholder: "Mehr Coaching, mehr Transparenz..." }
      ];
    case 'tool_qualtrics':
      return [
        { id: 'qx1', text: "Welche 'Moments that matter' sind im aktuellen Wandel kritisch?", placeholder: "Onboarding im neuen System, Erstes Training..." },
        { id: 'qx2', text: "Über welche Kanäle erhalten Sie aktuell unstrukturiertes Feedback?", placeholder: "E-Mails, Support-Tickets, Flurfunk..." },
        { id: 'qx3', text: "Wie erleben Mitarbeiter den bisherigen Veränderungsprozess (Sentiment)?", placeholder: "Skeptisch, Überfordert, Neugierig..." },
        { id: 'qx4', text: "Wo bricht die 'Employee Journey' aktuell am häufigsten ab?", placeholder: "Nach dem Training, bei der ersten Anwendung..." }
      ];
    case 'tool_viva':
      return [
        { id: 'vx1', text: "Haben Sie das Gefühl, dass Teams in 'Silos' arbeiten?", placeholder: "Ja, Marketing redet nicht mit Sales..." },
        { id: 'vx2', text: "Wie hoch ist die Meeting-Belastung in Schlüsselrollen?", placeholder: "Extrem hoch, kaum Fokuszeit..." },
        { id: 'vx3', text: "Nutzen Mitarbeiter die neuen digitalen Tools bereits effizient?", placeholder: "Nein, alte Muster herrschen vor..." },
        { id: 'vx4', text: "Gibt es Anzeichen für Burnout durch ständige Erreichbarkeit?", placeholder: "E-Mails am Wochenende sind normal..." }
      ];
    case 'story_creation':
      return [
        { id: 'st1', text: "Was ist der 'Drache' (die Bedrohung), wenn wir uns NICHT ändern?", placeholder: "Insolvenz, Verlust der Marktführerschaft, Veraltung..." },
        { id: 'st2', text: "Was ist der 'Schatz' (die Prinzessin/Belohnung), wenn wir es schaffen?", placeholder: "Sichere Arbeitsplätze, Innovationsführer, Marktanteile..." },
        { id: 'st3', text: "An wen richtet sich die Geschichte primär (Zielgruppe)?", placeholder: "Produktionsmitarbeiter, Mittleres Management, Investoren..." },
        { id: 'st4', text: "Welchen Tonfall braucht die Organisation aktuell?", placeholder: "Ehrlich und schonungslos ODER Ermutigend und Visionär..." }
      ];
    default: // GAP & Risk & Fallback
      return [
        { id: 'q1', text: "Beschreiben Sie den aktuellen Ist-Zustand kurz und knapp.", placeholder: "Status Quo ist..." },
        { id: 'q2', text: "Was ist das konkrete Zielbild?", placeholder: "Ziel ist..." },
        { id: 'q3', text: "Was fehlt aktuell noch, um das Ziel zu erreichen?", placeholder: "Ressourcen, Know-how..." },
        { id: 'q4', text: "Was passiert im schlimmsten Fall, wenn wir nichts tun?", placeholder: "Verlust von Marktanteilen..." }
      ];
  }
};

export const getLeadershipAuditQuestions = (): AssessmentQuestion[] => {
  return [
    { id: 'l1', text: "Wie würden Sie die aktuelle Stimmung im Team in einem Wort beschreiben?", placeholder: "Angespannt, Euphorisch, Müde..." },
    { id: 'l2', text: "Was war der größte Konflikt oder Erfolg in den letzten 4 Wochen?", placeholder: "Deadline verpasst, Erfolgreicher Launch..." },
    { id: 'l3', text: "Wie stark nehmen Sie Ihre Rolle als Coach vs. als Manager wahr?", placeholder: "80% operatives Management, 20% Führung..." },
    { id: 'l4', text: "Welches strategische Ziel muss dieses Team im nächsten Quartal unbedingt erreichen?", placeholder: "Umsatzsteigerung um 10%..." }
  ];
};

const getSystemInstruction = (toolId: ChangeToolId): string => {
  const base = "You are a Senior Organizational Development Consultant at HS Results. You combine systemic consulting with data-driven agility.";
  
  switch (toolId) {
    case 'plan_kotter':
      return `${base} Create a Change Plan based on John Kotter's 8-Step Process. Focus on quick wins and sustaining acceleration. Use the user's answers to tailor the steps specifically.`;
    case 'analysis_swot':
      return `${base} Perform a SWOT analysis specifically regarding the proposed change scenario. Incorporate the specific insights provided by the user in the questionnaire.`;
    case 'analysis_stakeholder':
      return `${base} Perform a Stakeholder Analysis. Map the stakeholders mentioned by the user and suggest specific communication strategies.`;
    case 'analysis_gap':
      return `${base} Perform a GAP Analysis. Contrast the Current State vs. Future State based on user input.`;
    case 'model_adkar':
      return `${base} Apply the ADKAR model (Prosci). Diagnose the blockage points based on the user's answers regarding Awareness, Desire, Knowledge, Ability.`;
    case 'risk_assessment':
      return `${base} Analyze systemic risks based on the user's fears and descriptions.`;
    case 'tool_culture_amp':
      return `${base} Acting as a Culture Amp Expert: Design a 'Listening Strategy' for this change. Suggest specific Pulse Survey themes, identify Engagement Drivers to watch, and propose how to use 'People Science' to reduce turnover risks based on the user's scenario.`;
    case 'tool_qualtrics':
      return `${base} Acting as a Qualtrics EmployeeXM Expert: Design an Experience Management plan. Identify key 'Moments that Matter' in this change lifecycle. Suggest text analytics keywords to monitor and sentiment analysis targets.`;
    case 'tool_viva':
      return `${base} Acting as a Microsoft Viva Insights Expert: Design a Collaboration Analysis plan. Focus on 'Digital Exhaust' metrics like Meeting Load, Focus Time, and Network Silos. Suggest interventions to improve well-being and adoption using Viva data.`;
    case 'story_creation':
      return `${base} Storytelling Expert Mode. Create 3 distinct Change Stories based on the inputs:
      1. Fight the Dragon: Focus on the external threat (Crisis narrative).
      2. Win the Princess: Focus on the vision/reward (Opportunity narrative).
      3. Hybrid Approach: A balanced, realistic approach combining urgency and vision.
      Each story must be compelling, emotional, and suitable for the target audience.`;
    default:
      return base;
  }
};

const getSchemaForTool = (toolId: ChangeToolId): any => {
  // Schema definitions match previous ones to ensure UI compatibility
  switch (toolId) {
    case 'plan_kotter':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.NUMBER },
                name: { type: Type.STRING },
                action: { type: Type.STRING },
                rationale: { type: Type.STRING }
              }
            }
          }
        }
      };
    case 'analysis_swot':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      };
    case 'analysis_stakeholder':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                group: { type: Type.STRING },
                interest: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                power: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                strategy: { type: Type.STRING },
                tactics: { type: Type.STRING }
              }
            }
          }
        }
      };
    case 'analysis_gap':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING },
                current: { type: Type.STRING },
                target: { type: Type.STRING },
                action: { type: Type.STRING }
              }
            }
          }
        }
      };
    case 'model_adkar':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING, enum: ['Awareness', 'Desire', 'Knowledge', 'Ability', 'Reinforcement'] },
                status: { type: Type.STRING },
                tactic: { type: Type.STRING }
              }
            }
          }
        }
      };
    case 'tool_culture_amp':
    case 'tool_qualtrics':
    case 'tool_viva':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                focusArea: { type: Type.STRING, description: "The strategic module or theme" },
                metric: { type: Type.STRING, description: "The specific KPI or Metric to measure" },
                insight: { type: Type.STRING, description: "What the AI predicts we will find or why this matters" },
                intervention: { type: Type.STRING, description: "Recommended action based on this data" }
              }
            }
          }
        }
      };
    case 'story_creation':
      return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, enum: ['Fight the Dragon', 'Win the Princess', 'Hybrid Approach'] },
                headline: { type: Type.STRING },
                narrative: { type: Type.STRING, description: "The actual story text (2-3 sentences)" },
                keyMessage: { type: Type.STRING },
                callToAction: { type: Type.STRING }
              }
            }
          }
        }
      };
    default: 
       return {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          data: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                riskArea: { type: Type.STRING },
                probability: { type: Type.STRING },
                impact: { type: Type.STRING },
                mitigation: { type: Type.STRING }
              }
            }
          }
        }
      };
  }
};

// New function to generate context-specific reflection questions
export const generateSystemicQuestions = async (
  scenario: string,
  companyDesc: string
): Promise<AssessmentQuestion[]> => {
  const prompt = `
    Context:
    Scenario: "${scenario}"
    Company Description: "${companyDesc}"

    Task:
    Generate 4 systemic reflection questions in German for the user.
    - Question 1-3: Should be specific to the cultural barriers, hidden rules, or leadership dynamics relevant to THIS specific scenario.
    - Question 4: MUST be a paradoxical question (e.g., "What exactly must we do to ensure this project fails miserably?").
    
    Output JSON array of objects with 'id', 'text', 'placeholder'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              placeholder: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AssessmentQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Error generating systemic questions:", error);
    // Fallback if AI fails
    return [
      { id: 'f1', text: "Was darf sich durch dieses Projekt auf keinen Fall verändern?", placeholder: "Werte, Traditionen..." },
      { id: 'f2', text: "Wer verliert durch den Erfolg dieses Projekts am meisten?", placeholder: "Abteilung X, Führungskräfte..." },
      { id: 'f3', text: "Welches ungeschriebene Gesetz der Firma wird hier verletzt?", placeholder: "Man kritisiert nie den Chef..." },
      { id: 'f4', text: "Was müssten Sie tun, um das Projekt mit Sicherheit gegen die Wand zu fahren?", placeholder: "Paradoxe Intervention..." }
    ];
  }
};

export const generateChangeAnalysis = async (
  toolId: ChangeToolId,
  scenario: string,
  companySize: string,
  companyDesc: string,
  companyUrl: string,
  assessmentAnswers: AssessmentResponse[],
  cultureAnswers: AssessmentResponse[] // New parameter
): Promise<AnalysisResult> => {
  
  // Construct a rich context from the Q&A
  const toolQaContext = assessmentAnswers.map(a => `Tool Assessment Q: ${a.questionText}\nA: ${a.answer}`).join('\n\n');
  const cultureQaContext = cultureAnswers.map(a => `Culture Reflection Q: ${a.questionText}\nA: ${a.answer}`).join('\n\n');

  const prompt = `
    Basic Context:
    Scenario: "${scenario}".
    Company Size: "${companySize}".
    
    Company Profile:
    Description: "${companyDesc}"
    Website URL: "${companyUrl}"
    (Use the company profile and URL to infer industry context and organizational culture if possible).

    Systemic Culture Reflection (User's insights on hidden dynamics):
    ${cultureQaContext}

    Deep Dive Tool Assessment:
    ${toolQaContext}
    
    Based on the Interview above, perform the requested analysis strictly following the schema.
    Ensure the advice is actionable, specific to the user's answers, and professional.
    Language: German.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(toolId),
        responseMimeType: "application/json",
        responseSchema: getSchemaForTool(toolId)
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        toolId,
        summary: parsed.summary,
        data: parsed.data
      };
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error generating change analysis:", error);
    throw error;
  }
};

export const analyzeLeadershipTeam = async (
  employees: Employee[],
  assessmentAnswers: AssessmentResponse[]
): Promise<string> => {
  const dataString = JSON.stringify(employees);
  const qaContext = assessmentAnswers.map(a => `Manager's Self-Reflection - Q: ${a.questionText}\nA: ${a.answer}`).join('\n\n');

  const prompt = `
    You are the "HS Results Leadership AI Coach".
    
    Context from Manager (User):
    ${qaContext}

    Hard Data (Team Metrics):
    ${dataString}

    Task:
    Analyze the team data in the context of the manager's self-reflection.
    1. Identify the top 3 systemic patterns. Connect the data (e.g., low motivation) with the manager's description (e.g., "team is tired").
    2. Suggest 3 specific, strategic leadership interventions that address both the data and the manager's stated goals.
    
    Keep the tone professional, encouraging, and clear.
    Format with Markdown headers.
    Language: German.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error analyzing leadership data:", error);
    return "An error occurred while analyzing the data. Please try again.";
  }
};

export const generateEmployeeCoaching = async (employee: Employee): Promise<CoachingGuide> => {
  const prompt = `
    Create a 1:1 coaching guide for employee: ${employee.name}.
    Role: ${employee.role}.
    Performance: ${employee.performance}/100.
    Motivation: ${employee.motivation}/100.
    Workload: ${employee.workload}/100.
    
    The goal is to improve performance or retain high performers, depending on the data.
    Be empathetic but results-oriented.
    Language: German.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            employeeName: { type: Type.STRING },
            focusArea: { type: Type.STRING },
            openingQuestion: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CoachingGuide;
    }
    throw new Error("No coaching data generated");
  } catch (error) {
    console.error("Error generating coaching guide:", error);
    throw error;
  }
};
