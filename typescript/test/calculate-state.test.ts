import { describe, test } from "@jest/globals";

interface CalculatorNonZeroDigit {
  readonly value: number
}

interface CalculatorMathOps {
  readonly op: '+' | '-' | '/' | '*';
}

interface CalculatorAction {
  readonly action: 'clear' | 'equal'
}

type CalculatorInput = { type: 'zero' }
    | { type: 'digit', value: CalculatorNonZeroDigit }
    | { type: 'decimalSeparator'}
    | { type: 'clear'}
    | { type: 'equal'}
    | { type: 'op', value: CalculatorMathOps };

type CalculatorDisplay = string;

type CalculatorState = { state: 'empty' }
    | {state: 'accumulateDigit', value: CalculatorDisplay};

describe("Calculator tests", () => {

  test("", () => {
    //we are in empty state
    //we get zero calculatorInput
    //we stay in the zero state
  })

  test("", () => {
    //we are in empty state
    //we get non zero calculatorInput
    //we transition to accumulateDigit state
  })
});
