import {describe, test} from "@jest/globals";

import {CalculatorNumber, CalculatorOperation, MathOperationError, MathOperationResult} from '../src/Calculator';
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
      switch (mathOps.op) {
        case '+':
          return E.left(number1 + number2);
        case '-':
          return E.left(number1 - number2);
        case '*':
          return E.left(number1 * number2);
        case '/':
          if (number2 === 0) {
            return E.right(MathOperationError.DivideByZero);
          }
          return E.left(number1 / number2);
      }

      return E.left(0);
    },
    getDisplayFromState(accumulatorStateData: AccumulatorStateData): string {
      return "";
    },
    getNumberFromAccumulator(accumulatorStateData: AccumulatorStateData): CalculatorNumber {
      return Number(accumulatorStateData.digit.toString());
    },
    getPendingOpsFromState(accumulatorStateData: AccumulatorStateData): string {
      return "";
    }
  };
  return services;
}

describe("Calculator tests", () => {
  describe("accumulator state", () => {
    test("in accumulator state, pressing zero appends zero to the digit buffer", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.none()}
      };

      const newState = calculate({type: "zero"}, initialState);

      expect(newState).toEqual({
        state: "accumulator",
        value: {digit: "50", pendingOp: O.none()}
      });
    });

    test("in accumulator state, pressing a digit appends it to the buffer", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.none()}
      };

      const newState = calculate({type: "digit", value: new CalculatorNonZeroDigit(3)}, initialState);

      expect(newState).toEqual({
        state: "accumulator",
        value: {digit: "53", pendingOp: O.none()}
      });
    });

    test("in accumulator state, pressing decimal separator transitions to accumulatorWithDecimal state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.none()}
      };

      const newState = calculate({type: "decimalSeparator"}, initialState);

      expect(newState).toEqual({
        state: "accumulatorWithDecimal",
        value: {digit: "5.", pendingOp: O.none()}
      });
    });

    test("in accumulator state, pressing clear transitions to zero state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.none()}
      };

      const newState = calculate({type: "clear"}, initialState);

      expect(newState).toEqual({state: "zero", value: O.none()});
    });

    test("in accumulator state, pressing equals computes the result and transitions to computed state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.some([{op: '+'}, 10])}
      };

      const newState = calculate({type: "equal"}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 15, pendingOp: O.none()}
      });
    });

    test("in accumulator state, pressing a math operation computes the result and sets a new pending operation", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.some([{op: '+'}, 10])}
      };

      const newState = calculate({type: "op", value: {op: '-'}}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 15, pendingOp: O.some([{op: '-'}, 15])}
      });
    });

    test("in accumulator state, pressing a math operation without pending op return new computed state and sets a new pending operation", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulator",
        value: {digit: "5", pendingOp: O.none()}
      };

      const newState = calculate({type: "op", value: {op: '-'}}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.some([{op: '-'}, 5])}
      });
    });
  });

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

    // todo - add tests for pressing operation or equals with pending ops

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

  // accumulatorWithDecimal state
  describe("accumulatorWithDecimal state", () => {
    test("in accumulatorWithDecimal state, pressing zero appends zero to the digit buffer", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.", pendingOp: O.none()}
      };

      const newState = calculate({type: "zero"}, initialState);

      expect(newState).toEqual({
        state: "accumulatorWithDecimal",
        value: {digit: "5.0", pendingOp: O.none()}
      });
    });

    test("in accumulatorWithDecimal state, pressing a digit appends it to the buffer", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.", pendingOp: O.none()}
      };

      const newState = calculate({type: "digit", value: new CalculatorNonZeroDigit(3)}, initialState);

      expect(newState).toEqual({
        state: "accumulatorWithDecimal",
        value: {digit: "5.3", pendingOp: O.none()}
      });
    });

    test("in accumulatorWithDecimal state, pressing decimal separator does nothing", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.", pendingOp: O.none()}
      };

      const newState = calculate({type: "decimalSeparator"}, initialState);

      expect(newState).toEqual(initialState);
    });

    test("in accumulatorWithDecimal state, pressing clear transitions to zero state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.", pendingOp: O.none()}
      };

      const newState = calculate({type: "clear"}, initialState);

      expect(newState).toEqual({state: "zero", value: O.none()});
    });

    test("in accumulatorWithDecimal state, pressing equals when pendingOp is divide by zero returns error state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "0", pendingOp: O.some([{op: '/'}, 5.5])}
      };

      const newState = calculate({type: "equal"}, initialState);

      expect(newState).toEqual({
        state: "error",
        value: MathOperationError.DivideByZero
      });
    });

    test("in accumulatorWithDecimal state, pressing equals computes the result and transitions to computed state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.5", pendingOp: O.some([{op: '+'}, 10])}
      };

      const newState = calculate({type: "equal"}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 15.5, pendingOp: O.none()}
      });
    });

    test("in accumulatorWithDecimal state, pressing a math operation computes the result and sets a new pending operation", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.5", pendingOp: O.some([{op: '+'}, 10])}
      };

      const newState = calculate({type: "op", value: {op: '-'}}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 15.5, pendingOp: O.some([{op: '-'}, 15.5])}
      });


    });

    test("in accumulatorWithDecimal state with no pendingOp, pressing a math operation sets a new pending operation", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "accumulatorWithDecimal",
        value: {digit: "5.5", pendingOp: O.none()}
      };

      const newState = calculate({type: "op", value: {op: '-'}}, initialState);

      expect(newState).toEqual({
        state: "computed",
        value: {displayNumber: 5.5, pendingOp: O.some([{op: '-'}, 5.5])}
      });


    });

  });

  describe("computed state", () => {
    test("in computed state, pressing zero transitions to zero state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.none()}
      };

      const newState = calculate({type: "zero"}, initialState);

      expect(newState).toEqual({state: "zero", value: O.none()});
    });


    test("in computed state, pressing zero with pending ops transitions to zero state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.some([{op: '+'}, 10])}
      };

      const newState = calculate({type: "zero"}, initialState);

      expect(newState).toEqual({state: "zero", value: O.some([{op: '+'}, 10])});
    });

    test.skip("in computed state, pressing a digit transitions to accumulator state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.none()}
      };

      const newState = calculate({type: "digit", value: new CalculatorNonZeroDigit(1)}, initialState);

      expect(newState).toEqual({state: "accumulator", value: {digit: "1", pendingOp: O.none()}});
    });

    test.skip("in computed state, pressing decimal separator transitions to accumulatorWithDecimal state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.none()}
      };

      const newState = calculate({type: "decimalSeparator"}, initialState);

      expect(newState).toEqual({state: "accumulatorWithDecimal", value: {digit: "0.", pendingOp: O.none()}});
    });

    test.skip("in computed state, pressing clear transitions to zero state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.none()}
      };

      const newState = calculate({type: "clear"}, initialState);

      expect(newState).toEqual({state: "zero", value: O.none()});
    });

    // todo - add tests for pressing equals given a pending operation
    test.skip("in computed state, pressing equals transitions to computed state", () => {
      const services = createServices();
      const calculate = createCalculate(services);

      const initialState: CalculatorState = {
        state: "computed",
        value: {displayNumber: 5, pendingOp: O.none()}
      };

      const newState = calculate({type: "equal"}, initialState);

      expect(newState).toEqual({state: "computed", value: {displayNumber: 5, pendingOp: O.none()}});
    });
  });
  // todo - add tests for error cases when evaluate the equal input
  // todo - add tests for minus and divide operations with operands in different order
  // computed state

  // error state

});
