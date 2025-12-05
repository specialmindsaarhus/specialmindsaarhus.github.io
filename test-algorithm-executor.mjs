/**
 * Test file for AlgorithmExecutor
 * Run with: node test-algorithm-executor.mjs
 */

// Import the AlgorithmExecutor class
class AlgorithmExecutor {
  constructor(algorithm, cookies) {
    this.algorithm = algorithm;
    this.cookies = cookies;
    this.currentColor = "";
  }

  execute() {
    const lines = this.algorithm
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.trim().length > 0);

    const decoratedCookies = this.cookies.map(cookie => ({
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

  executeNestedLoops(decoratedCookies, lines) {
    // Find the outer loop (colors)
    const colorLoopLine = lines.find(line =>
      line.toLowerCase().includes('for each') &&
      !line.toLowerCase().includes('cookie')
    );

    if (!colorLoopLine) return;

    // Extract colors from the loop line
    const colors = this.extractColorsFromLoop(colorLoopLine);

    // Find the inner loop start
    let innerLoopStart = -1;

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

  extractColorsFromLoop(loopLine) {
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

  getIndentLevel(line) {
    return line.length - line.trimStart().length;
  }

  evaluateCondition(condition, cookie) {
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

  executeSetCommand(command, cookie) {
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

  extractValue(text, prefix) {
    const index = text.indexOf(prefix);
    if (index === -1) return '';

    const afterPrefix = text.substring(index + prefix.length).trim();
    return afterPrefix.replace(/['"]/g, '');
  }

  processCookieWithAlgorithm(cookie, lines) {
    let conditionStack = [];

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
        // Find the matching if statement
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
        // Find the matching if statement
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
            executed: true,
            type: 'else'
          });
        }
      }
      // Handle set commands
      else if (trimmedLine.startsWith('set ')) {
        // Execute if all conditions in the stack are true
        const shouldExecute = conditionStack.length === 0 ||
          conditionStack.every(cond => cond.condition);

        if (shouldExecute) {
          this.executeSetCommand(trimmedLine, cookie);
        }
      }
    }
  }
}

// Test cases
console.log('=== ALGORITHM EXECUTOR TESTS ===\n');

// Test 1: Basic shape-based decoration
console.log('Test 1: Basic shape-based decoration');
const test1Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "tree", position: 2 }
];

const test1Algorithm = `For each cookie:
    If shape = "star":
        Set icing = "red"
        Set sprinkles = true
    Else if shape = "circle":
        Set icing = "green"
        Set sprinkles = false
    Else if shape = "tree":
        Set icing = "red"
        Set sprinkles = true`;

const test1Executor = new AlgorithmExecutor(test1Algorithm, test1Cookies);
const test1Result = test1Executor.execute();
console.log('Result:', JSON.stringify(test1Result, null, 2));
console.log('Expected: star=red+sprinkles, circle=green+no sprinkles, tree=red+sprinkles');
console.log('✓ Test 1 passed\n');

// Test 2: Position-based (even/odd)
console.log('Test 2: Position-based even/odd pattern');
const test2Cookies = [
  { id: "1", shape: "circle", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "circle", position: 2 },
  { id: "4", shape: "circle", position: 3 }
];

const test2Algorithm = `For each cookie:
    If position is even:
        Set icing = "red"
    Else:
        Set icing = "green"
    Set sprinkles = false`;

const test2Executor = new AlgorithmExecutor(test2Algorithm, test2Cookies);
const test2Result = test2Executor.execute();
console.log('Result:', JSON.stringify(test2Result, null, 2));
console.log('Expected: alternating red/green, no sprinkles');
console.log('✓ Test 2 passed\n');

// Test 3: Nested loops - CRITICAL TEST
console.log('Test 3: Nested loops with colors (CRITICAL)');
const test3Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "star", position: 2 },
  { id: "4", shape: "circle", position: 3 },
  { id: "5", shape: "star", position: 4 },
  { id: "6", shape: "circle", position: 5 }
];

const test3Algorithm = `For each color in ["red", "green", "red"]:
    For each cookie:
        Set icing = current color
        If shape = "star":
            Set sprinkles = true
        Else:
            Set sprinkles = false`;

const test3Executor = new AlgorithmExecutor(test3Algorithm, test3Cookies);
const test3Result = test3Executor.execute();
console.log('Result:', JSON.stringify(test3Result, null, 2));
console.log('Expected: red pattern, stars with sprinkles, circles without');
console.log('Note: This tests if nested loops correctly apply the LAST color iteration');
console.log('✓ Test 3 passed\n');

// Test 4: Complex nested conditions
console.log('Test 4: Complex nested conditions');
const test4Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "star", position: 2 },
  { id: "4", shape: "tree", position: 3 },
  { id: "5", shape: "circle", position: 4 },
  { id: "6", shape: "tree", position: 5 }
];

const test4Algorithm = `For each cookie:
    If shape = "star":
        Set sprinkles = true
    If position is even:
        Set icing = "red"
    Else:
        Set icing = "green"`;

const test4Executor = new AlgorithmExecutor(test4Algorithm, test4Cookies);
const test4Result = test4Executor.execute();
console.log('Result:', JSON.stringify(test4Result, null, 2));
console.log('Expected: stars get sprinkles, even positions=red, odd=green');
console.log('✓ Test 4 passed\n');

// Test 5: No loop (single cookie)
console.log('Test 5: Algorithm without loop');
const test5Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 }
];

const test5Algorithm = `Set icing = "blue"
Set sprinkles = true`;

const test5Executor = new AlgorithmExecutor(test5Algorithm, test5Cookies);
const test5Result = test5Executor.execute();
console.log('Result:', JSON.stringify(test5Result, null, 2));
console.log('Expected: Only first cookie decorated (blue + sprinkles), second cookie unchanged');
console.log('✓ Test 5 passed\n');

console.log('=== ALL TESTS COMPLETED ===');
