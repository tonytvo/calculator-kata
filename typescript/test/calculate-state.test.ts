import { describe, test } from "@jest/globals";

import {
  CalculatorOperation,
  CalculatorNumber,
  MathOperationError,
  MathOperationResult,
  CalculatorDigit
} from '../src/Calculator';
import {Option as O, Either as E} from "effect";
import {undefined} from "effect/Match";


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

type Calculate = (calculatorInput: CalculatorInput, calculatorState: CalculatorState) => CalculatorState;

function createCalculate(calculatorService: CalculatorServices): Calculate {
  return (input, calculatorState) => {
    return calculatorState;
  }
}

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

  test("in zero state, pressing zero does nothing", () => {
    const services: CalculatorServices = {
      accumulateNonZeroDigit(nonZeroDigit: CalculatorNonZeroDigit, accumulator: DigitAccumulator): DigitAccumulator {
        return accumulator;
      },
      accumulateSeparator(accumulator: DigitAccumulator): DigitAccumulator {
        return accumulator;
      },
      accumulateZero(accumulator: DigitAccumulator): DigitAccumulator {
        return accumulator;
      },
      doMathOperation(mathOps: CalculatorMathOps, number1: CalculatorNumber, number2: CalculatorNumber): MathOperationResult {
        return E.left(0);
      },
      getDisplayFromState(accumulatorStateData: AccumulatorStateData): string {
        return "";
      },
      getNumberFromAccumulator(accumulatorStateData: AccumulatorStateData): CalculatorNumber {
        return 0;
      },
      getPendingOpsFromState(accumulatorStateData: AccumulatorStateData): string {
        return "";
      }
    };
    const calculate = createCalculate(services);

    const newState = calculate({type: "zero"}, {state: "zero", value: O.none()});

    expect(newState).toEqual({state: "zero", value: O.none()});
  })

  test("", () => {
    //we are in empty state
    //we get non zero calculatorInput
    //we transition to accumulateDigit state
  })
});
