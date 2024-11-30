import { describe, test } from "@jest/globals";

import {CalculatorOperation, CalculatorNumber, MathOperationError, MathOperationResult} from '../src/Calculator';
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

type AccumulateNonZeroDigit = (nonZeroDigit: CalculatorNonZeroDigit, accumulator: DigitAccumulator) => DigitAccumulator;

type AccumulateZero = (accumulator: DigitAccumulator) => DigitAccumulator;

type AccumulateSeparator = (accumulator: DigitAccumulator) => DigitAccumulator;

type DoMathOperation = (mathOps: CalculatorMathOps, number1: CalculatorNumber, number2: CalculatorNumber) => MathOperationResult;

type GetNumberFromAccumulator = (accumulatorStateData: AccumulatorStateData) => CalculatorNumber;

type GetDisplayFromState = (accumulatorStateData: AccumulatorStateData) => string;

type GetPendingOpsFromState = (accumulatorStateData: AccumulatorStateData) => string;

type CalculatorServices = {
  accumulateNonZeroDigit: AccumulateNonZeroDigit,
  accumulateZero: AccumulateZero,
  accumulateSeparator: AccumulateSeparator,
  doMathOperation: DoMathOperation,
  getNumberFromAccumulator: GetNumberFromAccumulator,
  getDisplayFromState: GetDisplayFromState,
  getPendingOpsFromState: GetPendingOpsFromState
};

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
