import { describe, test } from "@jest/globals";

import {CalculatorOperation, CalculatorNumber, MathOperationError} from '../src/Calculator';
import {Option as O} from "effect";


type PendingOp = O.Option<[CalculatorOperation, CalculatorNumber]>;

interface CalculatorNonZeroDigit {
  readonly value: number
}

interface CalculatorMathOps {
  readonly op: '+' | '-' | '/' | '*';
}

interface CalculatorAction {
  readonly action: 'clear' | 'equal'
}

type CalculatorInput =
    { type: 'zero' }
    | { type: 'digit', value: CalculatorNonZeroDigit }
    | { type: 'decimalSeparator'}
    | { type: 'clear'}
    | { type: 'equal'}
    | { type: 'op', value: CalculatorMathOps };

type CalculatorDisplay = string;

type ZeroStateData = PendingOp;

type DigitAccumulator = string;

type AccumulatorStateData = { digit: DigitAccumulator, pendingOp: PendingOp };

type ComputedStateData = { displayNumber: CalculatorNumber, pendingOp: PendingOp };

type ErrorStateData = MathOperationError;

type CalculatorState =
    { state: 'zero', value: ZeroStateData }
    | {state: 'accumulator', value: AccumulatorStateData }
    | {state: 'accumulatorWithDecimal', value: AccumulatorStateData}
    | {state: 'computed', value: ComputedStateData}
    | {state: 'error', value: ErrorStateData};

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
