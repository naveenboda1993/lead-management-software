/* eslint-disable @typescript-eslint/no-explicit-any */
import { Annotation, StateGraph } from "@langchain/langgraph";
import { createLLM } from "@/lib/ai/llm";

interface GeneratedEmail {
  subject: string;
  body: string;
  emailType: string;
  personalizationFields: string[];
}

const EmailWriterState = Annotation.Root({
  leadProfile: Annotation<any>,
  emailType: Annotation<string>,
  companyContext: Annotation<string>,
  additionalContext: Annotation<string>,
  template: Annotation<string>,
  subject: Annotation<string>,
  body: Annotation<string>,
  personalizationFields: Annotation<string[]>,
});

async function determineTemplate(state: typeof EmailWriterState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `You are an email template specialist. Determine the appropriate template structure for this email type.

Email Type: ${state.emailType}
Lead: ${JSON.stringify(state.leadProfile)}
Company Context: ${state.companyContext}

Available email types:
- cold_outreach: Introduction email to a new lead
- proposal: Sending a proposal or quote
- meeting_reminder: Reminder for an upcoming meeting
- thank_you: Post-meeting or post-closure thank you

Provide analysis as JSON: { "template": string (description of the template structure to use), "personalization_fields": string[] (list of fields to personalize) }`;

  const response = await llm.invoke(prompt);
  const result = JSON.parse(response.content as string);

  return {
    template: result.template,
    personalizationFields: result.personalization_fields,
  };
}

async function gatherContext(state: typeof EmailWriterState.State) {
  const llm = createLLM({ temperature: 0.2 });

  const prompt = `Extract and enrich context for writing a ${state.emailType} email.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Additional Context: ${state.additionalContext}
Personalization Fields: ${JSON.stringify(state.personalizationFields)}

Provide enriched context as JSON: { "context_summary": string (key points to include), "tone_guidance": string (how to strike the right tone), "key_value_props": string[] (value propositions to highlight) }`;

  const _response = await llm.invoke(prompt);
  void _response;
  return {};
}

async function draftEmail(state: typeof EmailWriterState.State) {
  const llm = createLLM({ temperature: 0.7 });

  const prompt = `You are a professional business email writer. Draft a ${state.emailType} email.

Lead Profile: ${JSON.stringify(state.leadProfile)}
Company Context: ${state.companyContext}
Additional Context: ${state.additionalContext}
Template Structure: ${state.template}

Provide the email as JSON:
{
  "subject": "Compelling subject line (max 60 chars)",
  "body": "Full HTML email body with proper formatting"
}

Rules:
- Use professional business tone
- Personalize with lead's name, company, and industry
- Include clear call-to-action
- Keep cold outreach under 150 words
- Keep proposal emails detailed but scannable
- Meeting reminders should include date/time confirmation
- Thank you emails should be warm but professional`;

  const response = await llm.invoke(prompt);
  const email = JSON.parse(response.content as string);

  return {
    subject: email.subject,
    body: email.body,
  };
}

async function polishEmail(state: typeof EmailWriterState.State) {
  const llm = createLLM({ temperature: 0.3 });

  const prompt = `You are an email polish editor. Refine this ${state.emailType} email for maximum professionalism and impact.

Subject: ${state.subject}
Body: ${state.body}

Return the polished version as JSON:
{
  "subject": "Improved subject line",
  "body": "Polished HTML email body"
}

Focus on:
- Professional tone and clarity
- Grammar and spelling
- Compelling opening
- Strong call-to-action
- Proper email signature`;

  const response = await llm.invoke(prompt);
  const polished = JSON.parse(response.content as string);

  return {
    subject: polished.subject,
    body: polished.body,
  };
}

const workflow = new StateGraph(EmailWriterState)
  .addNode("determineTemplate", determineTemplate)
  .addNode("gatherContext", gatherContext)
  .addNode("draftEmail", draftEmail)
  .addNode("polishEmail", polishEmail)
  .addEdge("__start__", "determineTemplate")
  .addEdge("determineTemplate", "gatherContext")
  .addEdge("gatherContext", "draftEmail")
  .addEdge("draftEmail", "polishEmail")
  .addEdge("polishEmail", "__end__");

export const emailWriterAgent = workflow.compile();

export async function writeEmail(params: {
  leadProfile: any;
  emailType: string;
  companyContext: string;
  additionalContext: string;
}): Promise<GeneratedEmail> {
  try {
    const result = await emailWriterAgent.invoke(params);
    return {
      subject: result.subject,
      body: result.body,
      emailType: result.emailType,
      personalizationFields: result.personalizationFields,
    };
  } catch (error) {
    console.error("Email writer agent error:", error);
    throw new Error(
      `Failed to write email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
