import { ChatOpenAI } from "@langchain/openai";

export type LLMProvider = "openai" | "openrouter" | "custom";

function getProvider(): {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseURL?: string;
} {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const customBaseURL = process.env.LLM_BASE_URL;

  if (customBaseURL) {
    return {
      provider: "custom",
      apiKey: openRouterKey || openAIKey || "",
      model: process.env.LLM_MODEL || "gpt-4",
      baseURL: customBaseURL,
    };
  }

  if (openRouterKey) {
    return {
      provider: "openrouter",
      apiKey: openRouterKey,
      model: process.env.LLM_MODEL || "openrouter/auto",
      baseURL: "https://openrouter.ai/api/v1",
    };
  }

  return {
    provider: "openai",
    apiKey: openAIKey || "",
    model: process.env.LLM_MODEL || "gpt-4",
  };
}

export function createLLM(config?: { temperature?: number; model?: string }): ChatOpenAI {
  const { provider, apiKey, model, baseURL } = getProvider();

  const params: Record<string, unknown> = {
    temperature: config?.temperature ?? 0.3,
    modelName: config?.model || model,
    openAIApiKey: apiKey,
  };

  if (provider === "openrouter" || provider === "custom") {
    const headers: Record<string, string> = {};
    if (provider === "openrouter") {
      headers["HTTP-Referer"] =
        process.env.OPENROUTER_REFERRER || "http://localhost:3000";
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "LeadCRM";
    }
    params.configuration = {
      baseURL,
      defaultHeaders: headers,
    };
  }

  return new ChatOpenAI(params as ConstructorParameters<typeof ChatOpenAI>[0]);
}

