import { describe, test } from "@jest/globals";
import * as Calculator from "../src/Calculator"
import * as O from "effect/Option";
import * as E from "effect/Either";
import {
  CalculatorDigit,
  CalculatorDisplay,
  CalculatorNumber,
  CalculatorOperation,
  CalculatorServices,
  CalculatorState, MathOperationError, MathOperationResult
} from "../src/Calculator";
import {Option} from "effect/Option";


// these tests must be passing in order for the calculator to work

describe("Calculator tests", () => {

  test("updateDisplayFromPendingOp, should return empty given display empty and no pending Op", () => {
    const services: CalculatorServices = {
      setDisplayError(error: MathOperationError): CalculatorDisplay {
        return "";
      },
      doMathOperation(operation: CalculatorOperation, a: CalculatorNumber, b: CalculatorNumber): MathOperationResult {
        return E.right(0);
      }, getDisplayNumber(display: CalculatorDisplay): Option<CalculatorNumber> {
        return O.none();
      }, initState(): CalculatorState {
        return {allowAppend: false, display: "", pendingOperation: O.none()};
      }, setDisplayNumber(number: CalculatorNumber): CalculatorDisplay {
        return "";
      }, updateDisplayFromDigit(digit: CalculatorDigit, display: CalculatorDisplay): CalculatorDisplay {
        return "";
      }
    }

    let calculatorState = Calculator.updateDisplayFromPendingOp(services,
        {allowAppend: false, display: "", pendingOperation: O.none()});

    expect(calculatorState.display).toBe("");
    expect(calculatorState.pendingOperation).toBe(O.none());
  })

  test("updateDisplayFromPendingOp, should return addition", () => {
    const services: CalculatorServices = {
      setDisplayError(error: MathOperationError): CalculatorDisplay {
        return "";
      },
      doMathOperation(operation: CalculatorOperation, a: CalculatorNumber, b: CalculatorNumber): MathOperationResult {
        if (operation === CalculatorOperation.Add) {
          return E.left(a + b);
        }
        return E.left(0);
      }, getDisplayNumber(display: CalculatorDisplay): Option<CalculatorNumber> {
        const displayNumber = Number(display as string);
        if (isNaN(displayNumber)) {
          return O.none();
        }
        return O.fromNullable(displayNumber);
      }, initState(): CalculatorState {
        return {allowAppend: false, display: "", pendingOperation: O.none()};
      }, setDisplayNumber(number: CalculatorNumber): CalculatorDisplay {
        return "";
      }, updateDisplayFromDigit(digit: CalculatorDigit, display: CalculatorDisplay): CalculatorDisplay {
        return "";
      }
    }

    let calculatorState = Calculator.updateDisplayFromPendingOp(services,
        {allowAppend: false, display: "1", pendingOperation: O.fromNullable([CalculatorOperation.Add, 2])});

    expect(calculatorState.display).toBe("");
    expect(calculatorState.pendingOperation).toEqual(O.none());
  })
});
