export const MODEL_CONFIGS = {
    'gpt-4o': {
        name: "GPT-4o",
        inputCost: 2.5, // per 1M tokens
        outputCost: 10.0,
        description: "Most advanced OpenAI model",
        contextWindow: 128000,
    },
    'gpt-4o-mini': {
        name: "GPT-4o mini",
        inputCost: 0.15, // per 1M tokens
        outputCost: 0.60,
        description: "Most cost-efficient OpenAI model",
        contextWindow: 128000,
    },
    'gpt-o1-preview': {
        name: "OpenAI o1-preview",
        inputCost: 15.0, // per 1M tokens
        outputCost: 60.0,
        description: "OpenAI's new reasoning model for complex tasks",
        contextWindow: 128000,
    },
    'gpt-o1-mini': {
        name: "OpenAI o1-mini",
        inputCost: 3.0, // per 1M tokens
        outputCost: 12.0,
        description: "OpenAI's fast, cost-efficient reasoning model tailored to coding, math, and science use cases",
        contextWindow: 128000,
    },
    'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        inputCost: 0.5,
        outputCost: 1.5,
        description: 'Old OpenAI model',
        contextWindow: 16385,
    },
    'claude-3.5-sonnet': {
        name: "Claude 3.5 Sonnet",
        inputCost: 3.0,
        outputCost: 15.0,
        description: "Anthropic's most intelligent model at the moment",
        contextWindow: 200000,
    },
    'claude-3.5-haiku': {
        name: "Claude 3.5 Haiku",
        inputCost: 1.0,
        outputCost: 5.0,
        description: "Anthropic's fastest, most cost-effective model",
        contextWindow: 200000,
    },
    'claude-3-opus': {
        name: "Claude 3 Opus",
        inputCost: 15.0,
        outputCost: 75.0,
        description: "Anthropic's powerful model for complex tasks",
        contextWindow: 200000,
    },
};
