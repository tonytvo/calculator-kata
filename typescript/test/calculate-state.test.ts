import {describe, test} from "@jest/globals";

import {CalculatorNumber, CalculatorOperation, MathOperationError, MathOperationResult} from '../src/Calculator';
import {Either as E, Option as O} from "effect";


type PendingOp = O.Option<[CalculatorOperation, CalculatorNumber]>;

class CalculatorNonZeroDigit {

  constructor(readonly value: number) {
  }
  toString(): string {
    return this.value.toString();
  }
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
    switch (calculatorState.state) {
      case 'zero':
        if (input.type === 'digit') {
          return {state: "accumulator", value: {digit: input.value.toString(), pendingOp: O.none()}};
        }
        if (input.type === 'decimalSeparator') {
          return { state: "accumulatorWithDecimal", value: { digit: "0.", pendingOp: O.none() } };
        }
        break;
      case 'accumulator':
        if (input.type === 'digit') {
          return {state: "accumulator", value: {digit: calculatorState.value.digit + input.value.toString(), pendingOp: O.none()}};
        }
        break;
    }
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

function createServices() {
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
  return services;
}

describe("Calculator tests", () => {

  test("in zero state, pressing zero does nothing", () => {
    const services = createServices();
    const calculate = createCalculate(services);

    const newState = calculate({type: "zero"}, {state: "zero", value: O.none()});

    expect(newState).toEqual({state: "zero", value: O.none()});
  })

  test("in zero state, pressing digit accumulate state", () => {
    const services = createServices();
    const calculate = createCalculate(services);

    const newState = calculate(
        {type: "digit", value: new CalculatorNonZeroDigit(1)},
        {state: "zero", value: O.none()}
    );

    expect(newState).toEqual({state: "accumulator", value: {digit: "1", pendingOp: O.none()}});
  })

  test("in zero state, pressing digit accumulate state", () => {
    const services = createServices();
    const calculate = createCalculate(services);

    const newState = calculate(
        {type: "digit", value: new CalculatorNonZeroDigit(2)},
        {state: "accumulator", value: {digit: "1", pendingOp: O.none()}}
    );

    expect(newState).toEqual({state: "accumulator", value: {digit: "12", pendingOp: O.none()}});
  })

  test("in zero state, pressing decimal separator transitions to accumulatorWithDecimal state", () => {
    const services = createServices();
    const calculate = createCalculate(services);

    // Initial state: Zero state with no pending operations
    const initialState: CalculatorState = { state: "zero", value: O.none() };

    // Input: Press decimal separator
    const input: CalculatorInput = { type: "decimalSeparator" };

    // Expected state: accumulatorWithDecimal state with "0." as the digit
    const expectedState: CalculatorState = {
      state: "accumulatorWithDecimal",
      value: {
        digit: "0.",
        pendingOp: O.none(),
      },
    };

    const newState = calculate(input, initialState);

    // Assertion
    expect(newState).toEqual(expectedState);
  });

});
