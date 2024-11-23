export const MODEL_COSTS = {
    'gpt-4': {
        input: 0.03,
        output: 0.06
    },
    'gpt-3.5-turbo': {
        input: 0.001,
        output: 0.002
    },
    'claude-3-opus': {
        input: 0.015,
        output: 0.075
    },
    'claude-3-sonnet': {
        input: 0.003,
        output: 0.015
    }
};

export const FILE_CONFIGS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedTypes: [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ],
    supportedExtensions: ['.txt', '.pdf', '.doc', '.docx']
};