/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface FollowUpMessages {
  followUpMessage: string;
  whatsappMessage: string;
  emailFollowUp: { subject: string; body: string };
}

interface FollowUpResult {
  messages: FollowUpMessages;
  channel: string;
  tone: string;
  timing: string;
}

const FollowUpState = Annotation.Root({
  leadProfile: Annotation<any>,
  leadStatus: Annotation<string>,
  previousCommunication: Annotation<any[]>,
  industry: Annotation<string>,
  channel: Annotation<string>,
  messages: Annotation<FollowUpMessages>,
  tone: Annotation<string>,
  timing: Annotation<string>,
});

async function analyzeContext(state: typeof FollowUpState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a follow-up strategist. Analyze this lead's context and determine the optimal tone and timing for follow-up.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Lead Status: ${state.leadStatus}
Previous Communication: ${JSON.stringify(state.previousCommunication)}
Industry: ${state.industry}

Provide analysis as JSON: { "tone": string (e.g. "professional", "friendly", "urgent"), "timing": string (e.g. "immediate", "within_24h", "within_3_days", "within_a_week") }

Consider:
- Lead status determines urgency (WON/LOST needs different approach)
- Previous communication history shapes tone
- Industry norms affect timing`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return {
    tone: analysis.tone,
    timing: analysis.timing,
  };
}

async function generateMessages(state: typeof FollowUpState.State) {
  const llm = createLLM({ temperature: 0.7 });

  const prompt = `You are a sales communication expert. Generate follow-up messages for this lead.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Lead Status: ${state.leadStatus}
Previous Communication: ${JSON.stringify(state.previousCommunication)}
Industry: ${state.industry}
Tone: ${state.tone}
Channel: ${state.channel}

Generate messages for all channels as JSON:
{
  "followUpMessage": "A general follow-up message (2-3 sentences)",
  "whatsappMessage": "A concise WhatsApp message (under 500 chars, conversational)",
  "emailFollowUp": {
    "subject": "Email subject line",
    "body": "Full email body in HTML format with proper greeting, body, and signature"
  }
}

Rules:
- Keep messages professional but personalized
- Reference previous interactions where relevant
- Include clear call-to-action
- Adapt length to channel (whatsapp = short, email = detailed)`;

  const response = await llm.invoke(prompt);
  const messages = JSON.parse(response.content as string);

  return {
    messages: {
      followUpMessage: messages.followUpMessage,
      whatsappMessage: messages.whatsappMessage,
      emailFollowUp: messages.emailFollowUp,
    },
  };
}

async function formatOutput(state: typeof FollowUpState.State) {
  return {
    channel: state.channel,
    tone: state.tone,
    timing: state.timing,
    messages: state.messages,
  };
}

const workflow = new StateGraph(FollowUpState)
  .addNode("analyzeContext", analyzeContext)
  .addNode("generateMessages", generateMessages)
  .addNode("formatOutput", formatOutput)
  .addEdge("__start__", "analyzeContext")
  .addEdge("analyzeContext", "generateMessages")
  .addEdge("generateMessages", "formatOutput")
  .addEdge("formatOutput", "__end__");

export const followUpAgent = workflow.compile();

export async function generateFollowUp(params: {
  leadProfile: any;
  leadStatus: string;
  previousCommunication: any[];
  industry: string;
  channel: string;
}): Promise<FollowUpResult> {
  try {
    const result = await followUpAgent.invoke(params);
    return result as unknown as FollowUpResult;
  } catch (error) {
    console.error("Follow-up agent error:", error);
    throw new Error(
      `Failed to generate follow-up: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
