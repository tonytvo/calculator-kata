import {describe, test} from "@jest/globals";

import {CalculatorNumber, MathOperationResult} from '../src/Calculator';
import {Either as E, Option as O} from "effect";
import {
    AccumulatorStateData,
    CalculatorInput,
    CalculatorMathOps,
    CalculatorNonZeroDigit,
    CalculatorServices,
    CalculatorState,
    createCalculate,
    DigitAccumulator
} from '../src/calculate-state';


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
