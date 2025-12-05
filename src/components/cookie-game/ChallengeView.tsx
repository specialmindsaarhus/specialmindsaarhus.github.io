import { useState, useEffect } from "react";
import { CookieDisplay } from "./CookieDisplay";
import { AlgorithmEditor } from "./AlgorithmEditor";
import { AlgorithmExecutor } from "./AlgorithmExecutor";
import { storage } from "./lib/storage";
import type { Challenge, DecoratedCookie } from "./lib/types";

interface ChallengeViewProps {
  challenge: Challenge;
  onBack: () => void;
}

export function ChallengeView({ challenge, onBack }: ChallengeViewProps) {
  const [algorithm, setAlgorithm] = useState("");
  const [executedCookies, setExecutedCookies] = useState<DecoratedCookie[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [userSolution, setUserSolution] = useState(storage.getSolution(challenge.id));

  useEffect(() => {
    // Load saved solution if exists
    const saved = storage.getSolution(challenge.id);
    if (saved?.algorithm) {
      setAlgorithm(saved.algorithm);
      setUserSolution(saved);
    }
  }, [challenge.id]);

  const handleExecuteAlgorithm = () => {
    setIsExecuting(true);
    try {
      const executor = new AlgorithmExecutor(algorithm, challenge.cookies);
      const result = executor.execute();
      setExecutedCookies(result);

      // Check if solution matches goal
      const isCorrect = checkSolution(result, challenge.goalPattern);
      const currentAttempts = userSolution?.attempts || 0;
      const score = isCorrect ? Math.max(100 - currentAttempts * 10, 10) : 0;

      const newSolution = {
        challengeId: challenge.id,
        algorithm,
        completed: isCorrect,
        attempts: currentAttempts + 1,
        score: isCorrect ? score : undefined,
        lastUpdated: Date.now()
      };

      storage.saveSolution(newSolution);
      setUserSolution(storage.getSolution(challenge.id));

      if (isCorrect) {
        alert("🎉 Perfect! Your algorithm works correctly!");
      } else {
        alert("Not quite right. Check your algorithm and try again.");
      }
    } catch (error) {
      alert(`Algorithm Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsExecuting(false);
  };

  const checkSolution = (executed: DecoratedCookie[], goal: any[]) => {
    if (executed.length !== goal.length) return false;

    return executed.every((cookie, index) => {
      const target = goal[index];
      return (
        cookie.icing === target.icing &&
        cookie.sprinkles === target.sprinkles
      );
    });
  };

  const insertExampleSolution = () => {
    if (challenge.exampleSolution) {
      setAlgorithm(challenge.exampleSolution);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Back to Challenges
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-red-600">{challenge.title}</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
              Level {challenge.level}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{challenge.description}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Your Cookies:</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.cookies.map((cookie) => (
                  <CookieDisplay
                    key={cookie.id}
                    shape={cookie.shape}
                    icing="none"
                    sprinkles={false}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Goal Pattern:</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.goalPattern.map((pattern, index) => (
                  <CookieDisplay
                    key={index}
                    shape={pattern.shape}
                    icing={pattern.icing}
                    sprinkles={pattern.sprinkles}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {challenge.exampleSolution && (
            <div className="mt-4">
              <button
                onClick={insertExampleSolution}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Show Solution
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Write Your Algorithm</h2>
          <AlgorithmEditor
            value={algorithm}
            onChange={setAlgorithm}
            onExecute={handleExecuteAlgorithm}
            isExecuting={isExecuting}
          />
          {userSolution && (
            <div className="mt-4 text-sm text-gray-600">
              Attempts: {userSolution.attempts}
              {userSolution.score !== undefined && ` | Best Score: ${userSolution.score}`}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {executedCookies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {executedCookies.map((cookie, index) => (
                <CookieDisplay
                  key={index}
                  shape={cookie.shape}
                  icing={cookie.icing}
                  sprinkles={cookie.sprinkles}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Write an algorithm and click "Run Algorithm" to see your decorated cookies!
            </p>
          )}
        </div>
      </div>

      {userSolution?.completed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="font-semibold text-green-800">Challenge Completed!</span>
            {userSolution.score !== undefined && (
              <span className="text-green-600">Score: {userSolution.score}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
