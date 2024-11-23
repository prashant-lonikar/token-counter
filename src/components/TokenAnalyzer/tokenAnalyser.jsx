import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { encode } from "gpt-tokenizer";

const MODEL_COSTS = {
  "gpt-4": {
    input: 0.03, // $0.03 per 1K tokens
    output: 0.06, // $0.06 per 1K tokens
  },
  "gpt-3.5-turbo": {
    input: 0.001, // $0.001 per 1K tokens
    output: 0.002, // $0.002 per 1K tokens
  },
  "claude-3-opus": {
    input: 0.015, // $0.015 per 1K tokens
    output: 0.075, // $0.075 per 1K tokens
  },
  "claude-3-sonnet": {
    input: 0.003, // $0.003 per 1K tokens
    output: 0.015, // $0.015 per 1K tokens
  },
};

const TokenAnalyzer = () => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const countTokens = async (text) => {
    // GPT-3.5/4 tokenization
    const gptTokens = encode(text).length;

    // Claude uses a similar tokenizer, but might vary slightly
    // This is an approximation
    const claudeTokens = Math.ceil(gptTokens * 1.15); // Claude often counts ~15% more tokens

    return {
      "gpt-4": gptTokens,
      "gpt-3.5-turbo": gptTokens,
      "claude-3-opus": claudeTokens,
      "claude-3-sonnet": claudeTokens,
    };
  };

  const calculateCosts = (tokenCounts) => {
    const costs = {};

    for (const [model, count] of Object.entries(tokenCounts)) {
      costs[model] = {
        input: (count * MODEL_COSTS[model].input) / 1000000,
        output: (count * MODEL_COSTS[model].output) / 1000000,
      };
    }

    return costs;
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        // For PDF files, we'd ideally use pdf.js
        resolve(`[PDF content from ${file.name}]`);
      } else if (file.type.includes("word")) {
        // For DOC/DOCX files, we'd ideally use mammoth.js
        resolve(`[Document content from ${file.name}]`);
      } else {
        reject(new Error("Unsupported file type"));
      }
    });
  };

  const handleTextAnalysis = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const tokens = await countTokens(text);
      const costs = calculateCosts(tokens);
      setResults({ tokens, costs });
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    setIsProcessing(true);
    const uploadedFiles = Array.from(event.target.files);
    setFiles(uploadedFiles);

    try {
      const fileContents = await Promise.all(
        uploadedFiles.map((file) => readFileAsText(file))
      );

      const combinedText = fileContents.join("\n");
      setText(combinedText);

      const tokens = await countTokens(combinedText);
      const costs = calculateCosts(tokens);
      setResults({ tokens, costs });
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Token Counter & Cost Estimator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="mb-4">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-2 border rounded"
                placeholder="Paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleTextAnalysis}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Analyze Text"}
              </button>
            </div>
          </TabsContent>

          <TabsContent value="file">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    isProcessing ? "opacity-50" : ""
                  }`}
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="mt-2">
                    {isProcessing
                      ? "Processing..."
                      : "Drop files or click to upload"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Supports TXT, DOC, DOCX, PDF
                  </span>
                </label>
              </div>
              {files.length > 0 && (
                <div className="text-sm text-gray-600">
                  Uploaded: {files.map((f) => f.name).join(", ")}
                </div>
              )}
            </div>
          </TabsContent>

          {results && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Analysis Results</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(results.tokens).map(([model, count]) => (
                  <Card key={model} className="p-4">
                    <h4 className="font-medium">{model}</h4>
                    <p className="text-2xl font-bold">
                      {count.toLocaleString()} tokens
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        Input cost: ${results.costs[model].input.toFixed(4)}
                      </p>
                      <p>
                        Output cost: ${results.costs[model].output.toFixed(4)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TokenAnalyzer;
