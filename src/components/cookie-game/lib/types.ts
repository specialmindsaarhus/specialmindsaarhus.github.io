export interface Cookie {
  id: string;
  shape: "star" | "circle" | "tree";
  position: number;
}

export interface DecoratedCookie extends Cookie {
  icing: "red" | "green" | "blue" | "yellow" | "pink" | "none";
  sprinkles: boolean;
}

export interface GoalPattern {
  shape: "star" | "circle" | "tree";
  icing: string;
  sprinkles: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: number;
  goalPattern: GoalPattern[];
  cookies: Cookie[];
  exampleSolution?: string;
}

export interface Solution {
  challengeId: string;
  algorithm: string;
  completed: boolean;
  attempts: number;
  score?: number;
  lastUpdated: number;
}
