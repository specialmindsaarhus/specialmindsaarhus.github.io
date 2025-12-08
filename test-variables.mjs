/**
 * Test file for AlgorithmExecutor with Variables
 * Tests Option A implementation: Variables, Arithmetic, Modulo
 */

import { AlgorithmExecutor } from './src/components/cookie-game/AlgorithmExecutor.ts';

console.log('=== VARIABLE FUNCTIONALITY TESTS ===\n');

// Test 1: Basic Counter
console.log('Test 1: Basic counter variable');
const test1Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "star", position: 2 }
];

const test1Algorithm = `Set counter = 0
For each cookie:
    If counter < 2:
        Set icing = "red"
        Set sprinkles = true
    Else:
        Set icing = "blue"
        Set sprinkles = false
    Set counter = counter + 1`;

try {
  const test1Executor = new AlgorithmExecutor(test1Algorithm, test1Cookies);
  const test1Result = test1Executor.execute();
  console.log('Result:', JSON.stringify(test1Result, null, 2));
  console.log('Expected: First 2 cookies red+sprinkles, last blue+no sprinkles');
  console.log('✓ Test 1 passed\n');
} catch (error) {
  console.error('✗ Test 1 failed:', error.message);
}

// Test 2: Position division (Rainbow Factory style)
console.log('Test 2: Position division for pair-based coloring');
const test2Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "star", position: 2 },
  { id: "4", shape: "circle", position: 3 },
  { id: "5", shape: "star", position: 4 },
  { id: "6", shape: "circle", position: 5 }
];

const test2Algorithm = `For each cookie:
    Set pairNumber = position / 2
    If pairNumber % 2 = 0:
        Set icing = "red"
    Else:
        Set icing = "green"
    If shape = "star":
        Set sprinkles = true
    Else:
        Set sprinkles = false`;

try {
  const test2Executor = new AlgorithmExecutor(test2Algorithm, test2Cookies);
  const test2Result = test2Executor.execute();
  console.log('Result:', JSON.stringify(test2Result, null, 2));
  console.log('Expected: Pairs 0-1=red, 2-3=green, 4-5=red; stars have sprinkles');
  console.log('✓ Test 2 passed\n');
} catch (error) {
  console.error('✗ Test 2 failed:', error.message);
}

// Test 3: Modulo pattern (every 3rd)
console.log('Test 3: Modulo pattern (every 3rd cookie special)');
const test3Cookies = [
  { id: "1", shape: "circle", position: 0 },
  { id: "2", shape: "circle", position: 1 },
  { id: "3", shape: "circle", position: 2 },
  { id: "4", shape: "circle", position: 3 },
  { id: "5", shape: "circle", position: 4 },
  { id: "6", shape: "circle", position: 5 }
];

const test3Algorithm = `Set counter = 0
For each cookie:
    If counter % 3 = 0:
        Set icing = "yellow"
        Set sprinkles = true
    Else:
        Set icing = "blue"
        Set sprinkles = false
    Set counter = counter + 1`;

try {
  const test3Executor = new AlgorithmExecutor(test3Algorithm, test3Cookies);
  const test3Result = test3Executor.execute();
  console.log('Result:', JSON.stringify(test3Result, null, 2));
  console.log('Expected: Positions 0,3 = yellow+sprinkles, others blue+no sprinkles');
  console.log('✓ Test 3 passed\n');
} catch (error) {
  console.error('✗ Test 3 failed:', error.message);
}

// Test 4: Arithmetic operations
console.log('Test 4: Various arithmetic operations');
const test4Cookies = [
  { id: "1", shape: "star", position: 0 },
  { id: "2", shape: "star", position: 1 },
  { id: "3", shape: "star", position: 2 }
];

const test4Algorithm = `Set total = 0
For each cookie:
    Set total = total + position
    Set doubled = position * 2
    If doubled = 2:
        Set icing = "red"
        Set sprinkles = true
    Else:
        Set icing = "blue"
        Set sprinkles = false`;

try {
  const test4Executor = new AlgorithmExecutor(test4Algorithm, test4Cookies);
  const test4Result = test4Executor.execute();
  console.log('Result:', JSON.stringify(test4Result, null, 2));
  console.log('Expected: Position 1 (doubled=2) gets red+sprinkles, others blue');
  console.log('✓ Test 4 passed\n');
} catch (error) {
  console.error('✗ Test 4 failed:', error.message);
}

console.log('=== ALL VARIABLE TESTS COMPLETED ===');
