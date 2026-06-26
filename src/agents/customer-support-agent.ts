/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface CustomerSupportResult {
  issueCategory: string;
  sentiment: string;
  suggestedResponse: string;
  resolutionSteps: string[];
  priority: string;
  escalate: boolean;
}

const CustomerSupportState = Annotation.Root({
  ticketTitle: Annotation<string>,
  ticketDescription: Annotation<string>,
  customerHistory: Annotation<any[]>,
  previousMessages: Annotation<any[]>,
  knowledgeBase: Annotation<any[]>,
  issueCategory: Annotation<string>,
  sentiment: Annotation<string>,
  suggestedResponse: Annotation<string>,
  resolutionSteps: Annotation<string[]>,
  priority: Annotation<string>,
  escalate: Annotation<boolean>,
});

async function analyzeIssue(state: typeof CustomerSupportState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a support ticket analyst. Analyze this support ticket and categorize the issue.

Ticket Title: ${state.ticketTitle}
Description: ${state.ticketDescription}
Customer History: ${JSON.stringify(state.customerHistory)}
Previous Messages: ${JSON.stringify(state.previousMessages)}

Provide analysis as JSON: {
  "issueCategory": string (e.g. "billing", "technical", "account", "feature_request", "bug_report", "general"),
  "sentiment": string ("very_negative" | "negative" | "neutral" | "positive" | "very_positive"),
  "priority": string ("critical" | "high" | "medium" | "low"),
  "escalate": boolean
}

Consider:
- Urgency from language and tone
- Customer history (repeat issues, VIP status)
- Business impact of the issue
- Technical complexity`;

  const response = await llm.invoke(prompt);
  const analysis = JSON.parse(response.content as string);

  return {
    issueCategory: analysis.issueCategory,
    sentiment: analysis.sentiment,
    priority: analysis.priority,
    escalate: analysis.escalate,
  };
}

async function suggestSolution(state: typeof CustomerSupportState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a support solution specialist. Suggest a resolution for this support ticket.

Ticket Title: ${state.ticketTitle}
Description: ${state.ticketDescription}
Category: ${state.issueCategory}
Priority: ${state.priority}
Customer History: ${JSON.stringify(state.customerHistory)}
Knowledge Base: ${JSON.stringify(state.knowledgeBase)}

Provide as JSON: {
  "resolutionSteps": string[] (step-by-step resolution instructions, 3-6 steps),
  "suggestedResponse": string (brief internal note on how to resolve)
}

Steps should be clear, actionable, and ordered. Reference knowledge base articles if relevant.`;

  const response = await llm.invoke(prompt);
  const solution = JSON.parse(response.content as string);

  return {
    resolutionSteps: solution.resolutionSteps,
    suggestedResponse: solution.suggestedResponse,
  };
}

async function formatResponse(state: typeof CustomerSupportState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are a customer support agent. Write a professional response to this customer.

Ticket Title: ${state.ticketTitle}
Description: ${state.ticketDescription}
Sentiment: ${state.sentiment}
Priority: ${state.priority}
Resolution Steps: ${JSON.stringify(state.resolutionSteps)}

Write a response as JSON: {
  "suggestedResponse": string (complete response to the customer, 3-6 sentences)
}

Rules:
- Acknowledge the issue empathetically
- Match tone to sentiment (soothe negative, match positive)
- Include estimated resolution time if applicable
- End with next steps or what customer can expect
- Professional and helpful tone`;

  const response = await llm.invoke(prompt);
  const formatted = JSON.parse(response.content as string);

  return { suggestedResponse: formatted.suggestedResponse };
}

const workflow = new StateGraph(CustomerSupportState)
  .addNode("analyzeIssue", analyzeIssue)
  .addNode("suggestSolution", suggestSolution)
  .addNode("formatResponse", formatResponse)
  .addEdge("__start__", "analyzeIssue")
  .addEdge("analyzeIssue", "suggestSolution")
  .addEdge("suggestSolution", "formatResponse")
  .addEdge("formatResponse", "__end__");

export const customerSupportAgent = workflow.compile();

export async function resolveSupportTicket(params: {
  ticketTitle: string;
  ticketDescription: string;
  customerHistory: any[];
  previousMessages: any[];
  knowledgeBase: any[];
}): Promise<CustomerSupportResult> {
  try {
    const result = await customerSupportAgent.invoke(params);
    return {
      issueCategory: result.issueCategory,
      sentiment: result.sentiment,
      suggestedResponse: result.suggestedResponse,
      resolutionSteps: result.resolutionSteps,
      priority: result.priority,
      escalate: result.escalate,
    };
  } catch (error) {
    console.error("Customer support agent error:", error);
    throw new Error(
      `Failed to resolve support ticket: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
