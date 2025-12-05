import { storage } from "./lib/storage";
import type { Challenge } from "./lib/types";

interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge: (challengeId: string) => void;
}

export function ChallengeList({ challenges, onSelectChallenge }: ChallengeListProps) {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3: return "bg-red-100 text-red-800 border-red-200";
      case 4: return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLevelText = (level: number) => {
    switch (level) {
      case 1: return "Beginner";
      case 2: return "Intermediate";
      case 3: return "Advanced";
      case 4: return "Expert";
      default: return `Level ${level}`;
    }
  };

  const getChallengeStatus = (challengeId: string) => {
    const solution = storage.getSolution(challengeId);
    return solution;
  };

  // Group challenges by level
  const challengesByLevel = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.level]) acc[challenge.level] = [];
    acc[challenge.level].push(challenge);
    return acc;
  }, {} as Record<number, Challenge[]>);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🍪 Algorithm Cookie Game
        </h1>
        <p className="text-gray-600">
          Learn algorithmic thinking through cookie decoration! Complete challenges from beginner to expert level.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="font-semibold text-green-700">Completed:</span>{" "}
            <span className="text-gray-700">{storage.getCompletedCount()} / {challenges.length}</span>
          </div>
          <div>
            <span className="font-semibold text-blue-700">Total Score:</span>{" "}
            <span className="text-gray-700">{storage.getTotalScore()}</span>
          </div>
        </div>
      </div>

      {[1, 2, 3, 4].map(level => (
        <div key={level}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {getLevelText(level)} Challenges
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(challengesByLevel[level] || []).map((challenge) => {
              const status = getChallengeStatus(challenge.id);
              return (
                <div
                  key={challenge.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => onSelectChallenge(challenge.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {challenge.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(challenge.level)}`}>
                        {getLevelText(challenge.level)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {challenge.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {status?.completed && (
                          <span className="text-green-600 text-xl" title="Completed">
                            ✅
                          </span>
                        )}
                        <span className="text-2xl">🍪</span>
                        {status && !status.completed && (
                          <span className="text-xs text-gray-500">
                            {status.attempts} {status.attempts === 1 ? 'attempt' : 'attempts'}
                          </span>
                        )}
                      </div>

                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium">
                        {status?.completed ? 'Review' : 'Start Challenge'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Tips for Success:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Start with the basics - understand loops and conditions first</li>
          <li>• Pay attention to indentation - it matters!</li>
          <li>• Use the "Show Help" button to see available syntax</li>
          <li>• Try the example code to learn the patterns</li>
          <li>• Nested loops are powerful for complex patterns</li>
        </ul>
      </div>
    </div>
  );
}
