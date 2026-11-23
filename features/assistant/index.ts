// Feature module: Gemini AI Urban Health Assistant
export interface AssistantChatSession {
  sessionId: string;
  activePersona: "pediatric_advisor" | "daily_planner" | "indoor_specialist";
}
