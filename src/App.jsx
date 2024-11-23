import React from "react";
import { encode } from "gpt-tokenizer";
import { MODEL_CONFIGS } from "./constants/models";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// Set up the PDF.js worker
if (typeof window !== "undefined" && "Worker" in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const App = () => {
  const [text, setText] = React.useState("");
  const [results, setResults] = React.useState(null);
  const [fileName, setFileName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(null);

  const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      setProgress(`Processing page ${i} of ${numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  const readTextFile = async (file) => {
    return await file.text();
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setProgress(null);
    try {
      let text;
      if (file.type === "application/pdf") {
        text = await readPdfFile(file);
      } else if (file.type === "text/plain") {
        text = await readTextFile(file);
      } else {
        throw new Error("Unsupported file type");
      }

      setText(text);
      setFileName(file.name);
      analyzeText(text);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    }
    setIsLoading(false);
    setProgress(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const analyzeText = (textToAnalyze) => {
    const gptTokenCount = encode(textToAnalyze).length;

    const modelResults = Object.entries(MODEL_CONFIGS).reduce(
      (acc, [modelId, config]) => {
        const tokenCount = modelId.includes("claude")
          ? Math.ceil(gptTokenCount * 1.15)
          : gptTokenCount;

        const inputCost = (tokenCount * config.inputCost) / 1000000;
        const outputCost = (tokenCount * config.outputCost) / 1000000;

        acc[modelId] = {
          name: config.name,
          description: config.description,
          tokenCount,
          inputCost,
          outputCost,
          contextWindow: config.contextWindow,
        };

        return acc;
      },
      {}
    );

    setResults(modelResults);
  };

  const handleAnalyze = () => {
    analyzeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Token Counter for LLMs</h1>

      <div className="mb-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center"
        >
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-gray-600">
              {isLoading
                ? "Processing..."
                : "Drop files here or click to upload"}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Supports .txt and .pdf files
            </span>
          </label>
        </div>

        {isLoading && progress && (
          <div className="text-sm text-blue-600 mb-2">{progress}</div>
        )}

        {fileName && (
          <div className="text-sm text-gray-600 mb-2">Uploaded: {fileName}</div>
        )}

        <textarea
          className="w-full h-32 p-2 border rounded mb-4"
          placeholder="Or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleAnalyze}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? "Processing..." : "Calculate Tokens"}
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(results).map(([modelId, result]) => (
            <div
              key={modelId}
              className="border rounded p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{result.name}</h3>
                <span className="text-sm text-gray-500">
                  {result.description}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-medium">Tokens: </span>
                  {result.tokenCount.toLocaleString()}
                </p>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Context Window: </span>
                  {MODEL_CONFIGS[modelId].contextWindow.toLocaleString()} tokens
                </p>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">Input Cost: </span>$
                    {result.inputCost.toFixed(4)}
                  </p>
                  <p>
                    <span className="text-gray-600">Output Cost: </span>$
                    {result.outputCost.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
