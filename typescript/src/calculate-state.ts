import {
    CalculatorDigit,
    CalculatorNumber,
    CalculatorOperation,
    MathOperationError,
    MathOperationResult
} from "@/Calculator";
import {Either as E, Option as O, pipe} from "effect";

export type CalculatorState =
    { state: 'zero', value: ZeroStateData }
    | { state: 'accumulator', value: AccumulatorStateData }
    | { state: 'accumulatorWithDecimal', value: AccumulatorStateData }
    | { state: 'computed', value: ComputedStateData }
    | { state: 'error', value: ErrorStateData };

export type CalculatorInput =
    { type: 'zero' }
    | { type: 'digit', value: CalculatorNonZeroDigit }
    | { type: 'decimalSeparator' }
    | { type: 'clear' }
    | { type: 'equal' }
    | { type: 'op', value: CalculatorMathOps };

type PendingOp = O.Option<[CalculatorMathOps, CalculatorNumber]>;

export class CalculatorNonZeroDigit {

    constructor(readonly value: number) {
    }

    toString(): string {
        return this.value.toString();
    }
}

export interface CalculatorMathOps {
    readonly op: '+' | '-' | '/' | '*';
}

interface CalculatorAction {
    readonly action: 'clear' | 'equal'
}

type CalculatorDisplay = string;
type ZeroStateData = PendingOp;
export type DigitAccumulator = string;
export type AccumulatorStateData = { digit: DigitAccumulator, pendingOp: PendingOp };
type ComputedStateData = { displayNumber: CalculatorNumber, pendingOp: PendingOp };
type ErrorStateData = MathOperationError;

type Calculate = (calculatorInput: CalculatorInput, calculatorState: CalculatorState) => CalculatorState;

type AccumulateNonZeroDigit = (nonZeroDigit: CalculatorNonZeroDigit, accumulator: DigitAccumulator) => DigitAccumulator;
type AccumulateZero = (accumulator: DigitAccumulator) => DigitAccumulator;
type AccumulateSeparator = (accumulator: DigitAccumulator) => DigitAccumulator;
type DoMathOperation = (mathOps: CalculatorMathOps, number1: CalculatorNumber, number2: CalculatorNumber) => MathOperationResult;
type GetNumberFromAccumulator = (accumulatorStateData: AccumulatorStateData) => CalculatorNumber;
type GetDisplayFromState = (accumulatorStateData: AccumulatorStateData) => string;
type GetPendingOpsFromState = (accumulatorStateData: AccumulatorStateData) => string;
export type CalculatorServices = {
    accumulateNonZeroDigit: AccumulateNonZeroDigit,
    accumulateZero: AccumulateZero,
    accumulateSeparator: AccumulateSeparator,
    doMathOperation: DoMathOperation,
    getNumberFromAccumulator: GetNumberFromAccumulator,
    getDisplayFromState: GetDisplayFromState,
    getPendingOpsFromState: GetPendingOpsFromState
};

function calculateFromZeroState(calculatorState: { state: "zero"; value: ZeroStateData }, input: CalculatorInput) {
    let result: CalculatorState = calculatorState;
    if (input.type === 'digit') {
        result = {state: "accumulator", value: {digit: input.value.toString(), pendingOp: O.none()}};
    }
    if (input.type === 'decimalSeparator') {
        result = {state: "accumulatorWithDecimal", value: {digit: "0.", pendingOp: O.none()}};
    }
    if (input.type === 'clear') {
        result = calculatorState;
    }
    if (input.type === 'equal') {
        result = {state: "computed", value: {displayNumber: 0, pendingOp: O.none()}};
    }
    if (input.type === 'op') {
        result = {
            state: "computed",
            value: {displayNumber: 0, pendingOp: O.some([{op: input.value.op}, 0])}
        };
    }
    return result;
}

function calculateFromAccumulatorState(calculatorState: { state: "accumulator"; value: AccumulatorStateData }, input: CalculatorInput, calculatorService: CalculatorServices) {
    let newState: CalculatorState = calculatorState;
    if (input.type === 'digit') {
        newState = {
            state: "accumulator",
            value: {digit: calculatorState.value.digit + input.value.toString(), pendingOp: O.none()}
        };
    } else if (input.type === 'zero') {
        newState = {
            state: "accumulator",
            value: {digit: calculatorState.value.digit + "0", pendingOp: O.none()}
        };
    } else if (input.type === 'decimalSeparator') {
        const value: AccumulatorStateData = {digit: calculatorState.value.digit + ".", pendingOp: O.none()};
        newState = {
            state: "accumulatorWithDecimal",
            value
        };
    } else if (input.type === 'clear') {
        newState = {state: "zero", value: O.none()};
    } else if (input.type === 'equal') {
        const number1 = calculatorService.getNumberFromAccumulator(calculatorState.value);
        const pendingOp = calculatorState.value.pendingOp;
        if (O.isSome(pendingOp)) {
            const [op, number2] = pendingOp.value;
            const result = calculatorService.doMathOperation(op, number2, number1);
            if (E.isLeft(result)) {
                newState = {
                    state: "computed",
                    value: {displayNumber: result.left, pendingOp: O.none()}
                };
            }
        }
    } else if (input.type === 'op') {
        const number1 = calculatorService.getNumberFromAccumulator(calculatorState.value);
        const pendingOp = calculatorState.value.pendingOp;
        if (O.isSome(pendingOp)) {
            const [op, number2] = pendingOp.value;
            const result = calculatorService.doMathOperation(op, number2, number1);
            if (E.isLeft(result)) {
                newState = {
                    state: "computed",
                    value: {displayNumber: result.left, pendingOp: O.some([{op: input.value.op}, result.left])}
                };
            }
        } else {
            newState = {
                state: "accumulator",
                value: {digit: calculatorState.value.digit, pendingOp: O.some([{op: input.value.op}, number1])}
            };
        }
    }

    return newState;
}

function calculateFromAccumulatorWithDecimalState(calculatorState: {
    state: "accumulatorWithDecimal";
    value: AccumulatorStateData
}, input: CalculatorInput, calculatorService: CalculatorServices) {
  let newState: CalculatorState = calculatorState;

    switch (input.type) {
        case 'zero':
            newState = {
                state: "accumulatorWithDecimal",
                value: {digit: calculatorState.value.digit + "0", pendingOp: O.none()}
            };
            break;
        case "digit":
            newState = {
                state: "accumulatorWithDecimal",
                value: {digit: calculatorState.value.digit + input.value.toString(), pendingOp: O.none()}
            };
            break;
        case "decimalSeparator":
            break;
        case "clear":
            newState = {state: "zero", value: O.none()};
            break;
        case "equal":
            const number1 = calculatorService.getNumberFromAccumulator(calculatorState.value);
            const pendingOp = calculatorState.value.pendingOp;
            if (O.isSome(pendingOp)) {
                const [op, number2] = pendingOp.value;
                const result = calculatorService.doMathOperation(op, number2, number1);
                if (E.isLeft(result)) {
                    newState = {
                        state: "computed",
                        value: {displayNumber: result.left, pendingOp: O.none()}
                    };
                }
            }
            break;
        case "op":
            break;
    }

    return newState;
}

export function createCalculate(calculatorService: CalculatorServices): Calculate {
    return (input: CalculatorInput, calculatorState: CalculatorState): CalculatorState => {
        switch (calculatorState.state) {
            case "accumulatorWithDecimal":
                return calculateFromAccumulatorWithDecimalState(calculatorState, input, calculatorService);
                break;
            case "computed":
                break;
            case "error":
                break;
            case 'zero':
                return calculateFromZeroState(calculatorState, input);
            case 'accumulator':
                return calculateFromAccumulatorState(calculatorState, input, calculatorService);
        }
        return calculatorState;
    }
}
