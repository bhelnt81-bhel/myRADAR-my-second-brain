// Gemini AI Priority Engine integration

const getApiEndpoint = (modelOverride = null) => {
  if (modelOverride) return `https://generativelanguage.googleapis.com/v1beta/models/${modelOverride}:generateContent`;
  try {
    const saved = localStorage.getItem('myradar_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      const model = settings.geminiModel || 'gemini-1.5-flash-latest';
      return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    }
  } catch (e) {}
  return "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
};

function getApiKey() {
  try {
    // First try to load from local storage (User Settings)
    const saved = localStorage.getItem('myradar_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
        return settings.geminiApiKey;
      }
    }
    // Fallback to environment variable
    if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    console.error("Error reading geminiApiKey", e);
  }
  return null;
}

export const ai = {
  hasKey: () => {
    return !!getApiKey();
  },

  getAvailableModels: async (apiKey) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        return { success: false, error: errData && errData.error ? errData.error.message : `HTTP Error ${response.status}` };
      }
      const data = await response.json();
      const models = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      return { success: true, models };
    } catch (e) {
      console.error("Failed to fetch models", e);
      return { success: false, error: e.message };
    }
  },

  testConnection: async (apiKey, modelOverride = null) => {
    try {
      const response = await fetch(`${getApiEndpoint(modelOverride)}?key=${apiKey.trim()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the word 'Success' if you can read this." }] }]
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        return { success: false, error: errData && errData.error ? errData.error.message : `HTTP Error ${response.status}` };
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text.toLowerCase().includes("success")) {
        return { success: true };
      }
      return { success: false, error: "API connected but did not return expected response." };
    } catch (e) {
      console.error("API Connection test failed", e);
      return { success: false, error: e.message };
    }
  },

  prioritizeTasks: async (tasks, settings, energyLevel) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please add it in Settings.");
    }

    const goals = JSON.parse(localStorage.getItem('myradar_goals') || '{}');

    const systemPrompt = `You are the AI Priority Engine for 'myRADAR', the personal Second Brain system of Santosh Kumar, Deputy Engineer (Estate) at BHEL Noida, founder of Intimus Enterprises LLP (MSME Web Development), student preparing for IIT Delhi EMBA, Himalayan trekker, and AI learner.

Your goal is to evaluate, score, and categorize the given list of tasks based on context, goals, and current energy.

User Context:
- Name: Santosh Kumar (Address him as 'Santosh' or 'Sir').
- Current Role: Deputy Engineer (Estate), BHEL Noida. BHEL tasks must be heavily prioritized, especially during work hours, due to PSU compliance, vendor/financial deadlines, and DGM/AGM hierarchies.
- Secondary Role: Founder of Intimus Enterprises LLP. Focused on MSME clients, website building (React/HTML), hostings.
- Academic: Studying for IIT Delhi EMBA, case studies, assignments.
- Personal: Trekking prep (Himalayan treks), daily workout.
- Energy Level right now: ${energyLevel || 'Medium'}.
- Office Working Hours: ${settings.workHourStart || '09:00'} to ${settings.workHourEnd || '18:00'}. (Note: If current time is during work hours, prioritize BHEL tasks. Post-6PM, study and Intimus tasks should surface).

Current Goals:
- BHEL: ${goals.BHEL || 'Complete disposal of 56 unserviceable AC units'}
- Intimus: ${goals.Intimus || 'Acquire 3 new MSME clients in NCR'}
- Academic: ${goals.Academic || 'Solve 10 marketing case studies for EMBA prep'}
- Trekking: ${goals.Trekking || 'Walk 10,000 steps daily for altitude training'}
- AI & Tech: ${goals['AI & Tech'] || 'Build and deploy myRADAR Phase 2'}

Active Tasks:
${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, domain: t.domain, urgency: t.urgency, energy: t.energy, time: t.time, status: t.status, deadlineDays: t.deadlineDays || 7 })), null, 2)}

Instructions for each task:
1. Re-evaluate urgency ('High', 'Medium', 'Low') and importance ('High', 'Medium', 'Low').
2. Calculate a priority score (1.0 to 10.0). Formula: (UrgencyScore * 0.35) + (ImportanceScore * 0.30) + (DeadlineProximityScore * 0.20) + (GoalAlignmentScore * 0.15).
   - High = 10, Medium = 6, Low = 2.
   - DeadlineProximity = 10 if deadlineDays <= 2, 6 if <= 7, 2 if > 7.
   - GoalAlignment = 10 if it directly moves the active domain goal forward, 3 otherwise.
   - If the task is BHEL domain, multiply final score by 1.5 (cap at 10.0).
3. Assign an Eisenhower quadrant:
   - "Q1 — DO NOW" (Urgent & Important)
   - "Q2 — SCHEDULE" (Important, Not Urgent)
   - "Q3 — DELEGATE" (Urgent, Not Important)
   - "Q4 — ELIMINATE" (Not Urgent/Important)
4. Create a "microAction" (a 5-minute easy step to break procrastination).
5. Suggest a "timeBlockSuggestion" based on current energy and domain.

Generate a single paragraph "insight" (2-3 sentences) summarizing today's focus strategy matching the user's energy level.
Identify the "top3Ids" in order of execution.`;

    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tasks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "INTEGER" },
                  urgency: { type: "STRING", enum: ["High", "Medium", "Low"] },
                  importance: { type: "STRING", enum: ["High", "Medium", "Low"] },
                  priorityScore: { type: "NUMBER" },
                  quadrant: { type: "STRING", enum: ["Q1 — DO NOW", "Q2 — SCHEDULE", "Q3 — DELEGATE", "Q4 — ELIMINATE"] },
                  microAction: { type: "STRING" },
                  timeBlockSuggestion: { type: "STRING" }
                },
                required: ["id", "urgency", "importance", "priorityScore", "quadrant", "microAction", "timeBlockSuggestion"]
              }
            },
            insight: { type: "STRING" },
            top3Ids: {
              type: "ARRAY",
              items: { type: "INTEGER" }
            }
          },
          required: ["tasks", "insight", "top3Ids"]
        }
      }
    };

    try {
      const response = await fetch(`${getApiEndpoint()}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData && errData.error ? errData.error.message : `API Error: Status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to prioritize tasks using Gemini API", e);
      throw e;
    }
  },

  askAIChat: async (query, tasks, settings, energyLevel) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const goals = JSON.parse(localStorage.getItem('myradar_goals') || '{}');

    const prompt = `You are the AI Chief of Staff/Second Brain for Santosh Kumar, Deputy Engineer (Estate) at BHEL Noida.
You are helping him decide what to do next based on his workload, current energy level, and local context.

User Profile:
- Role: Deputy Engineer (Estate) at BHEL (handles AC Fleet, vendor Sehgal, guest houses, admin drafts).
- Secondary: Founder of Intimus Enterprises (web development).
- Academic: IIT Delhi EMBA student.
- Energy: ${energyLevel || 'Medium'}
- Goals: ${JSON.stringify(goals)}

Active Pending Tasks:
${JSON.stringify(tasks.filter(t => t.status !== 'completed').map(t => ({ id: t.id, title: t.title, domain: t.domain, urgency: t.urgency, priorityScore: t.priorityScore, quadrant: t.quadrant, time: t.time })), null, 2)}

User Question: "${query}"

Provide a concise, encouraging, and highly specific answer (2-4 sentences max). Give direct recommendations on which exact task to select and what first micro-step to take. Speak in a helpful corporate/chief-of-staff tone.`;

    try {
      const response = await fetch(`${getApiEndpoint()}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData && errData.error ? errData.error.message : "Failed to consult AI");
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to consult your tasks. Please check your network connection.";
    } catch (e) {
      console.error("AI Chat consulting failed", e);
      return \`Error: \${e.message}\`;
    }
  },

  scanTaskFromImage: async (base64Image) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const prompt = `Analyze this image (which may be a printed office memo, a notice circular, a whiteboard capture, or a handwritten note).
Identify the main action item or task described in the document.
Extract the task details and return them as a JSON object with the following properties:
- title: A clear, concise title of the action item/task. If it refers to a document number, file reference, or vendor, include that (e.g. "Prepare AC fleet disposal note (File Ref: BHEL/EST/2026)").
- domain: One of ['BHEL', 'Intimus', 'Academic', 'Trekking', 'AI & Tech', 'Personal'] based on content keywords.
- urgency: One of ['High', 'Medium', 'Low'] based on dates or tone.
- importance: One of ['High', 'Medium', 'Low'].
- energy: One of ['High', 'Medium', 'Low'] representing cognitive cost.
- time: A time estimate (e.g. '30m', '45m', '1h', '2h').

Return ONLY this JSON object. Do not include markdown code block formatting or backticks.`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            domain: { type: "STRING", enum: ["BHEL", "Intimus", "Academic", "Trekking", "AI & Tech", "Personal"] },
            urgency: { type: "STRING", enum: ["High", "Medium", "Low"] },
            importance: { type: "STRING", enum: ["High", "Medium", "Low"] },
            energy: { type: "STRING", enum: ["High", "Medium", "Low"] },
            time: { type: "STRING" }
          },
          required: ["title", "domain", "urgency", "importance", "energy", "time"]
        }
      }
    };

    const response = await fetch(`${getApiEndpoint()}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error("Gemini Vision API request failed");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  }
};
