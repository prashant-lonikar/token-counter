import * as PDFJS from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

class ParserError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "ParserError";
    this.type = type;
  }
}

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

export class DocumentParser {
  static async parseFile(file, onProgress) {
    try {
      onProgress?.(0);
      const result = await this._parseFile(file, onProgress);
      onProgress?.(100);
      return result;
    } catch (error) {
      onProgress?.(0);
      throw error;
    }
  }

  static parseTxtFile(file) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const reader = new FileReader();
      const stream = file.stream();
      const decoder = new TextDecoder();

      stream
        .getReader()
        .read()
        .then(function processText({ done, value }) {
          if (done) {
            resolve(chunks.join(""));
            return;
          }

          chunks.push(decoder.decode(value, { stream: true }));
          return reader.read().then(processText);
        })
        .catch(reject);
    });
  }

  static async parsePdfFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    // Process pages in chunks to optimize memory
    const CHUNK_SIZE = 5;
    for (let i = 1; i <= pdf.numPages; i += CHUNK_SIZE) {
      const pagePromises = [];
      const endPage = Math.min(i + CHUNK_SIZE - 1, pdf.numPages);

      for (let j = i; j <= endPage; j++) {
        pagePromises.push(this.extractPageText(pdf, j));
      }

      const texts = await Promise.all(pagePromises);
      fullText += texts.join("\n");
    }

    return fullText.trim();
  }

  static async extractPageText(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Improved text extraction with better formatting
    return textContent.items
      .map((item) => ({
        text: item.str,
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x)
      .map((item) => item.text)
      .join(" ");
  }

  static async parseWordFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  static validateFile(file) {
    const errors = [];

    if (file.size > FILE_SIZE_LIMIT) {
      errors.push(`File size exceeds ${FILE_SIZE_LIMIT / 1024 / 1024}MB limit`);
    }

    const supportedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!supportedTypes.includes(file.type)) {
      errors.push("Unsupported file type");
    }

    return errors;
  }
}
