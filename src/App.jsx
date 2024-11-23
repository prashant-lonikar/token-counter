import React from "react";
import { encode } from "gpt-tokenizer";
import { MODEL_CONFIGS } from "./constants/models";

const App = () => {
  const [text, setText] = React.useState("");
  const [results, setResults] = React.useState(null);

  const handleAnalyze = () => {
    // Base token count using GPT tokenizer
    const gptTokenCount = encode(text).length;

    // Calculate results for each model
    const modelResults = Object.entries(MODEL_CONFIGS).reduce(
      (acc, [modelId, config]) => {
        // Claude typically counts about 15% more tokens than GPT
        const tokenCount = modelId.includes("claude")
          ? Math.ceil(gptTokenCount * 1.15)
          : gptTokenCount;

        const inputCost = (tokenCount * config.inputCost) / 1000;
        const outputCost = (tokenCount * config.outputCost) / 1000;

        acc[modelId] = {
          name: config.name,
          description: config.description,
          tokenCount,
          inputCost,
          outputCost,
          totalCost: inputCost + outputCost,
        };

        return acc;
      },
      {}
    );

    setResults(modelResults);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Token Counter</h1>

      <textarea
        className="w-full h-32 p-2 border rounded mb-4"
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        onClick={handleAnalyze}
        disabled={!text.trim()}
      >
        Calculate Tokens
      </button>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-600">Input Cost: </span>$
                    {result.inputCost.toFixed(4)}
                  </p>
                  <p>
                    <span className="text-gray-600">Output Cost: </span>$
                    {result.outputCost.toFixed(4)}
                  </p>
                  <p className="text-base font-medium">
                    <span className="text-gray-600">Total Cost: </span>$
                    {result.totalCost.toFixed(4)}
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
