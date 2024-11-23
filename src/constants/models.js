export const MODEL_CONFIGS = {
    'gpt-4': {
        name: 'GPT-4',
        inputCost: 0.03,  // per 1K tokens
        outputCost: 0.06,
        description: 'Most powerful GPT model'
    },
    'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        inputCost: 0.001,
        outputCost: 0.002,
        description: 'Fast and efficient GPT model'
    },
    'claude-3-opus': {
        name: 'Claude 3 Opus',
        inputCost: 0.015,
        outputCost: 0.075,
        description: 'Most capable Claude model'
    },
    'claude-3-sonnet': {
        name: 'Claude 3 Sonnet',
        inputCost: 0.003,
        outputCost: 0.015,
        description: 'Efficient Claude model'
    },
};
