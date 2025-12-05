import { useState } from "react";

interface AlgorithmEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export function AlgorithmEditor({ value, onChange, onExecute, isExecuting }: AlgorithmEditorProps) {
  const [showHelp, setShowHelp] = useState(false);

  const exampleAlgorithm = `For each cookie:
    If shape = "star":
        Set icing = "red"
        Set sprinkles = true
    Else if shape = "circle":
        If position is even:
            Set icing = "red"
        Else:
            Set icing = "green"
        Set sprinkles = false
    Else if shape = "tree":
        Set icing = "green"
        Set sprinkles = true`;

  const nestedLoopExample = `For each color in ["red", "green"]:
    For each cookie:
        If shape = "star":
            Set icing = current color
            Set sprinkles = true
        Else if shape = "circle":
            Set icing = current color
            Set sprinkles = false`;

  const insertExample = () => {
    onChange(exampleAlgorithm);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Algorithm Instructions
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showHelp ? "Hide Help" : "Show Help"}
          </button>
          <button
            onClick={insertExample}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Insert Example
          </button>
          <button
            onClick={() => onChange(nestedLoopExample)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Nested Loop Example
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
          <h4 className="font-semibold text-blue-800 mb-2">Algorithm Syntax:</h4>
          <ul className="space-y-1 text-blue-700">
            <li><strong>For each cookie:</strong> - Loop through all cookies</li>
            <li><strong>For each color in ["red", "green"]:</strong> - Nested loop through colors</li>
            <li><strong>If shape = "star":</strong> - Check cookie shape</li>
            <li><strong>If position is even:</strong> - Check position (0, 2, 4...)</li>
            <li><strong>Set icing = "red":</strong> - Apply red icing</li>
            <li><strong>Set icing = current color:</strong> - Use current loop color</li>
            <li><strong>Set sprinkles = true:</strong> - Add sprinkles</li>
            <li><strong>Else:</strong> - Alternative condition</li>
          </ul>
          <p className="mt-2 text-blue-600">
            Available colors: red, green, blue, yellow, pink
          </p>
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your algorithm here..."
        className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
      />

      <button
        onClick={onExecute}
        disabled={isExecuting || !value.trim()}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isExecuting ? "Running Algorithm..." : "🚀 Run Algorithm"}
      </button>
    </div>
  );
}
