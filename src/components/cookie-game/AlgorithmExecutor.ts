import type { Cookie, DecoratedCookie } from './lib/types';

interface ConditionFrame {
  condition: boolean;
  indent: number;
  executed: boolean;
  type: 'if' | 'else' | 'elseif';
}

export class AlgorithmExecutor {
  private algorithm: string;
  private cookies: Cookie[];
  private currentColor: string = "";

  constructor(algorithm: string, cookies: Cookie[]) {
    this.algorithm = algorithm;
    this.cookies = cookies;
  }

  execute(): DecoratedCookie[] {
    const lines = this.algorithm
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.trim().length > 0);

    const decoratedCookies: DecoratedCookie[] = this.cookies.map(cookie => ({
      ...cookie,
      icing: "none",
      sprinkles: false
    }));

    // Check for nested loops
    const hasNestedLoop = lines.some(line =>
      line.toLowerCase().includes('for each') &&
      !line.toLowerCase().includes('cookie')
    );

    if (hasNestedLoop) {
      this.executeNestedLoops(decoratedCookies, lines);
    } else {
      // Check if algorithm contains "For each cookie" loop
      const hasLoop = lines.some(line =>
        line.toLowerCase().replace(/[:"]/g, '').includes('for each cookie')
      );

      if (hasLoop) {
        // Process each cookie with the algorithm
        for (let i = 0; i < decoratedCookies.length; i++) {
          this.processCookieWithAlgorithm(decoratedCookies[i], lines);
        }
      } else {
        // Process without loop (apply to first cookie only)
        if (decoratedCookies.length > 0) {
          this.processCookieWithAlgorithm(decoratedCookies[0], lines);
        }
      }
    }

    return decoratedCookies;
  }

  private executeNestedLoops(decoratedCookies: DecoratedCookie[], lines: string[]): void {
    // Find the outer loop (colors)
    const colorLoopLine = lines.find(line =>
      line.toLowerCase().includes('for each') &&
      !line.toLowerCase().includes('cookie')
    );

    if (!colorLoopLine) return;

    // Extract colors from the loop line
    const colors = this.extractColorsFromLoop(colorLoopLine);

    // Find the inner loop start and end
    let innerLoopStart = -1;
    let innerLoopEnd = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('for each cookie')) {
        innerLoopStart = i;
        break;
      }
    }

    if (innerLoopStart === -1) return;

    // For each color, process all cookies
    for (const color of colors) {
      this.currentColor = color;

      // Process each cookie with the current color
      for (let cookieIndex = 0; cookieIndex < decoratedCookies.length; cookieIndex++) {
        const innerLines = lines.slice(innerLoopStart);
        this.processCookieWithAlgorithm(decoratedCookies[cookieIndex], innerLines);
      }
    }
  }

  private extractColorsFromLoop(loopLine: string): string[] {
    // Extract colors from patterns like: For each color in ["red", "green"]
    const match = loopLine.match(/\[(.*?)\]/);
    if (match) {
      return match[1]
        .split(',')
        .map(color => color.trim().replace(/['"]/g, ''));
    }

    // Default colors if pattern not found
    return ["red", "green"];
  }

  private getIndentLevel(line: string): number {
    return line.length - line.trimStart().length;
  }

  private evaluateCondition(condition: string, cookie: DecoratedCookie): boolean {
    if (condition.includes('shape =')) {
      const shape = this.extractValue(condition, 'shape =');
      return cookie.shape === shape;
    }

    if (condition.includes('position is even')) {
      return cookie.position % 2 === 0;
    }

    if (condition.includes('position is odd')) {
      return cookie.position % 2 === 1;
    }

    return false;
  }

  private executeSetCommand(command: string, cookie: DecoratedCookie): void {
    if (command.includes('icing =')) {
      const value = this.extractValue(command, 'icing =');

      // Handle "current color" reference
      if (value === 'current color' && this.currentColor) {
        cookie.icing = this.currentColor;
      } else if (['red', 'green', 'blue', 'yellow', 'pink'].includes(value)) {
        cookie.icing = value;
      }
    }

    if (command.includes('sprinkles =')) {
      const value = this.extractValue(command, 'sprinkles =');
      cookie.sprinkles = value === 'true';
    }
  }

  private extractValue(text: string, prefix: string): string {
    const index = text.indexOf(prefix);
    if (index === -1) return '';

    const afterPrefix = text.substring(index + prefix.length).trim();
    return afterPrefix.replace(/['"]/g, '');
  }

  private processCookieWithAlgorithm(cookie: DecoratedCookie, lines: string[]): void {
    let conditionStack: ConditionFrame[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim().toLowerCase().replace(/[:"]/g, '');
      const currentIndent = this.getIndentLevel(line);

      // Skip loop lines
      if (trimmedLine.includes('for each')) {
        continue;
      }

      // Pop conditions that are no longer in scope (based on indentation)
      // BUT: Don't pop if current line is else/else-if at same indentation
      const isElseOrElseIf = trimmedLine.startsWith('else if ') || trimmedLine === 'else';
      while (conditionStack.length > 0) {
        const topIndent = conditionStack[conditionStack.length - 1].indent;
        // Pop if current indent is less than top, OR equal but not an else/else-if
        if (currentIndent < topIndent || (currentIndent === topIndent && !isElseOrElseIf)) {
          conditionStack.pop();
        } else {
          break;
        }
      }

      // Handle if conditions
      if (trimmedLine.startsWith('if ')) {
        const conditionMet = this.evaluateCondition(trimmedLine, cookie);
        conditionStack.push({
          condition: conditionMet,
          indent: currentIndent,
          executed: conditionMet,
          type: 'if'
        });
      }
      // Handle else if conditions
      else if (trimmedLine.startsWith('else if ')) {
        // Find the matching if statement at the same indentation level
        let matchingIfIndex = -1;
        for (let j = conditionStack.length - 1; j >= 0; j--) {
          if (conditionStack[j].indent === currentIndent &&
              (conditionStack[j].type === 'if' || conditionStack[j].type === 'elseif')) {
            matchingIfIndex = j;
            break;
          }
        }

        if (matchingIfIndex >= 0) {
          const matchingIf = conditionStack[matchingIfIndex];
          const conditionMet = this.evaluateCondition(trimmedLine, cookie);

          // Remove the old condition and add the new else if
          conditionStack.splice(matchingIfIndex, 1);
          conditionStack.push({
            condition: !matchingIf.executed && conditionMet,
            indent: currentIndent,
            executed: matchingIf.executed || conditionMet,
            type: 'elseif'
          });
        }
      }
      // Handle else
      else if (trimmedLine === 'else') {
        // Find the matching if statement at the same indentation level
        let matchingIfIndex = -1;
        for (let j = conditionStack.length - 1; j >= 0; j--) {
          if (conditionStack[j].indent === currentIndent &&
              (conditionStack[j].type === 'if' || conditionStack[j].type === 'elseif')) {
            matchingIfIndex = j;
            break;
          }
        }

        if (matchingIfIndex >= 0) {
          const matchingIf = conditionStack[matchingIfIndex];

          // Remove the old condition and add the else
          conditionStack.splice(matchingIfIndex, 1);
          conditionStack.push({
            condition: !matchingIf.executed,
            indent: currentIndent,
            executed: true, // else always "executes" in terms of the if-else chain
            type: 'else'
          });
        }
      }
      // Handle set commands
      else if (trimmedLine.startsWith('set ')) {
        // Execute if all conditions in the stack are true (or no conditions)
        const shouldExecute = conditionStack.length === 0 ||
          conditionStack.every(cond => cond.condition);

        if (shouldExecute) {
          this.executeSetCommand(trimmedLine, cookie);
        }
      }
    }
  }
}
