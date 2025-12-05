import { useState } from "react";
import { ChallengeList } from "./ChallengeList";
import { ChallengeView } from "./ChallengeView";
import challengesData from "../../data/cookie-challenges.json";
import type { Challenge } from "./lib/types";

const challenges = challengesData.challenges as Challenge[];

export default function CookieGameWrapper() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  if (selectedChallenge) {
    return (
      <ChallengeView
        challenge={selectedChallenge}
        onBack={() => setSelectedChallengeId(null)}
      />
    );
  }

  return (
    <ChallengeList
      challenges={challenges}
      onSelectChallenge={setSelectedChallengeId}
    />
  );
}
