/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface MeetingSummaryResult {
  summary: string;
  keyDecisions: string[];
  actionItems: { task: string; owner?: string; deadline?: string }[];
  risks: string[];
  nextSteps: string[];
  rawTranscript: string;
}

const MeetingSummaryState = Annotation.Root({
  transcript: Annotation<string>,
  meetingContext: Annotation<string>,
  participants: Annotation<string[]>,
  summary: Annotation<string>,
  keyDecisions: Annotation<string[]>,
  actionItems: Annotation<any[]>,
  risks: Annotation<string[]>,
  nextSteps: Annotation<string[]>,
});

async function parseTranscript(state: typeof MeetingSummaryState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are a meeting transcript analyzer. Parse the following meeting transcript and extract key information.

Transcript: ${state.transcript}
Context: ${state.meetingContext}
Participants: ${JSON.stringify(state.participants)}

Provide analysis as JSON: { "summary": string (2-3 sentence overview of the meeting) }`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return { summary: analysis.summary };
}

async function identifyDecisions(state: typeof MeetingSummaryState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `Identify all decisions made during this meeting from the transcript.

Transcript: ${state.transcript}

Provide as JSON: { "keyDecisions": string[] (list of decisions reached, each as a clear statement) }

Only include actual decisions, not discussions or ideas.`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { keyDecisions: result.keyDecisions };
}

async function extractActions(state: typeof MeetingSummaryState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `Extract all action items from this meeting transcript.

Transcript: ${state.transcript}

Provide as JSON: { "actionItems": [{ "task": string, "owner": string (name or "unassigned"), "deadline": string (date or "not specified") }] }

Include who is responsible and deadline if mentioned.`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { actionItems: result.actionItems };
}

async function assessRisks(state: typeof MeetingSummaryState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `Assess risks mentioned in this meeting transcript.

Transcript: ${state.transcript}
Context: ${state.meetingContext}

Provide as JSON: { "risks": string[] (list of identified risks or concerns) }

Only include explicit risks or concerns raised during the meeting.`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { risks: result.risks };
}

async function determineNextSteps(state: typeof MeetingSummaryState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `Based on this meeting transcript, propose the next steps.

Transcript: ${state.transcript}
Summary: ${state.summary}
Key Decisions: ${JSON.stringify(state.keyDecisions)}
Action Items: ${JSON.stringify(state.actionItems)}

Provide as JSON: { "nextSteps": string[] (list of recommended next steps in priority order) }

Next steps should be forward-looking actions beyond the specific action items.`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return { nextSteps: result.nextSteps };
}

async function formatSummary(state: typeof MeetingSummaryState.State) {
  return {
    summary: state.summary,
    keyDecisions: state.keyDecisions,
    actionItems: state.actionItems,
    risks: state.risks,
    nextSteps: state.nextSteps,
  };
}

const workflow = new StateGraph(MeetingSummaryState)
  .addNode("parseTranscript", parseTranscript)
  .addNode("identifyDecisions", identifyDecisions)
  .addNode("extractActions", extractActions)
  .addNode("assessRisks", assessRisks)
  .addNode("determineNextSteps", determineNextSteps)
  .addNode("formatSummary", formatSummary)
  .addEdge("__start__", "parseTranscript")
  .addEdge("parseTranscript", "identifyDecisions")
  .addEdge("identifyDecisions", "extractActions")
  .addEdge("extractActions", "assessRisks")
  .addEdge("assessRisks", "determineNextSteps")
  .addEdge("determineNextSteps", "formatSummary")
  .addEdge("formatSummary", "__end__");

export const meetingSummaryAgent = workflow.compile();

export async function summarizeMeeting(params: {
  transcript: string;
  meetingContext: string;
  participants: string[];
}): Promise<MeetingSummaryResult> {
  try {
    const result = await meetingSummaryAgent.invoke(params);
    return {
      summary: result.summary,
      keyDecisions: result.keyDecisions,
      actionItems: result.actionItems,
      risks: result.risks,
      nextSteps: result.nextSteps,
      rawTranscript: params.transcript,
    };
  } catch (error) {
    console.error("Meeting summary agent error:", error);
    throw new Error(
      `Failed to summarize meeting: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
