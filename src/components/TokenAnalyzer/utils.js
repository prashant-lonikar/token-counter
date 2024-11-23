export const validateFile = (file) => {
    const errors = [];

    if (file.size > FILE_CONFIGS.maxFileSize) {
        errors.push(`File ${file.name} is too large. Maximum size is 10MB`);
    }

    if (!FILE_CONFIGS.supportedTypes.includes(file.type)) {
        errors.push(`File ${file.name} has unsupported type. Supported types are: txt, pdf, doc, docx`);
    }

    return errors;
};

export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4
    }).format(amount);
};
