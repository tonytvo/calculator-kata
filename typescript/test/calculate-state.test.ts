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
  describe("zero state", () => {
    test("in zero state, pressing zero does nothing", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const newState = calculate({type: "zero"}, {state: "zero", value: O.none()});

      expect(newState).toEqual({state: "zero", value: O.none()});
    });

    test("in zero state, pressing a digit transitions to accumulator state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const newState = calculate(
          {type: "digit", value: new CalculatorNonZeroDigit(1)},
          {state: "zero", value: O.none()}
      );

      expect(newState).toEqual({state: "accumulator", value: {digit: "1", pendingOp: O.none()}});
    });

    test("in zero state, pressing decimal separator transitions to accumulatorWithDecimal state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {state: "zero", value: O.none()};

      const newState = calculate({type: "decimalSeparator"}, initialState);

      expect(newState).toEqual({state: "accumulatorWithDecimal", value: {digit: "0.", pendingOp: O.none()}});
    });

    test("in zero state, pressing clear does nothing", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {state: "zero", value: O.none()};

      const newState = calculate({type: "clear"}, initialState);

      expect(newState).toEqual(initialState);
    });

    test("in zero state, pressing equals transitions to computed state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {state: "zero", value: O.none()};

      const newState = calculate({type: "equal"}, initialState);

      expect(newState).toEqual({state: "computed", value: {displayNumber: 0, pendingOp: O.none()}});
    });

    test("in zero state, pressing a math operation transitions to computed state with pending operation", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {state: "zero", value: O.none()};

      const input: CalculatorInput = {type: "op", value: {op: '+'}};

      const newState = calculate(input, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 0, pendingOp: O.some([{op: '+'}, 0])}
      });
    });
  });
});
