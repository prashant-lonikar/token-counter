import * as PDFJS from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export class DocumentParser {
  static async parseFile(file) {
    try {
      switch (file.type) {
        case "text/plain":
          return await this.parseTxtFile(file);
        case "application/pdf":
          return await this.parsePdfFile(file);
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword":
          return await this.parseWordFile(file);
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      throw new Error(`Failed to parse ${file.name}: ${error.message}`);
    }
  }

  static parseTxtFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) =>
        reject(new Error(`Failed to read text file: ${e.message}`));
      reader.readAsText(file);
    });
  }

  static async parsePdfFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }

    return fullText;
  }

  static async parseWordFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
}
