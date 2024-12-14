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

export function createCalculate(calculatorService: CalculatorServices): Calculate {
    return (input: CalculatorInput, calculatorState: CalculatorState): CalculatorState => {
        switch (calculatorState.state) {
            case 'zero':
                if (input.type === 'digit') {
                    return {state: "accumulator", value: {digit: input.value.toString(), pendingOp: O.none()}};
                }
                if (input.type === 'decimalSeparator') {
                    return {state: "accumulatorWithDecimal", value: {digit: "0.", pendingOp: O.none()}};
                }
                if (input.type === 'clear') {
                    return calculatorState;
                }
                if (input.type === 'equal') {
                    return {state: "computed", value: {displayNumber: 0, pendingOp: O.none()}};
                }
                if (input.type === 'op') {
                    return {
                        state: "computed",
                        value: {displayNumber: 0, pendingOp: O.some([{op: input.value.op}, 0])}
                    };
                }
                break;
            case 'accumulator':
                if (input.type === 'digit') {
                    return {
                        state: "accumulator",
                        value: {digit: calculatorState.value.digit + input.value.toString(), pendingOp: O.none()}
                    };
                }
                break;
        }
        return calculatorState;
    }
}
