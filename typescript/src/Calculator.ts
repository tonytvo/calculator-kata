import {Either as E, Option as O, pipe} from "effect";

// we are currently at https://fsharpforfunandprofit.com/posts/calculator-implementation/#implementation-handling-math-operations

type CalculatorInput = { tag: "CalculatorDigit", value: CalculatorDigit } |
    { tag: "CalculatorOperation", value: CalculatorOperation } |
    { tag: "CalculatorAction", value: CalculatorAction };
type CalculatorOutput = unknown

export type CalculatorState = {
    display: CalculatorDisplay,
    pendingOperation: O.Option<[CalculatorOperation, CalculatorNumber]>
}
export type CalculatorDisplay = string

export enum CalculatorDigit {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    DecimalSeparator
}

export enum CalculatorOperation {
    Add,
    Subtract,
    Multiply,
    Divide,
}

enum CalculatorAction {
    Equals,
    Clear
}

export type CalculatorNumber = number

type DoMathOperation = (operation: CalculatorOperation, a: CalculatorNumber, b: CalculatorNumber) => MathOperationResult;
type Calculate = (input: CalculatorInput, state: CalculatorState) => CalculatorOutput

export enum MathOperationError {
    DivideByZero
}

export type MathOperationResult = E.Either<CalculatorNumber, MathOperationError>;

type UpdateDisplayFromDigit = (digit: CalculatorDigit, display: CalculatorDisplay) => CalculatorDisplay

type GetDisplayNumber = (display: CalculatorDisplay) => O.Option<CalculatorNumber>
type SetDisplayNumber = (number: CalculatorNumber) => CalculatorDisplay
type SetDisplayError = (error: MathOperationError) => CalculatorDisplay
type InitState = () => CalculatorState

export type CalculatorServices = {
    updateDisplayFromDigit: UpdateDisplayFromDigit
    doMathOperation: DoMathOperation
    getDisplayNumber: GetDisplayNumber
    setDisplayNumber: SetDisplayNumber
    setDisplayError: SetDisplayError
    initState: InitState
}

function updateDisplayFromDigit(services: CalculatorServices, value: CalculatorDigit, state: CalculatorState) {
    const newDisplay = services.updateDisplayFromDigit(value, state.display);
    const newState = Object.assign({}, state, {display: newDisplay})
    return newState;
}

export function updateDisplayFromPendingOp(services: CalculatorServices, state: CalculatorState): CalculatorState {
    function displayToState(newDisplay: string) {
        return Object.assign({}, state, {display: newDisplay, pendingOp: O.none()});
    }

    function doOperation([op, pendingNumber, currentNumber]: [CalculatorOperation, CalculatorNumber, number]): MathOperationResult {
        return services.doMathOperation(op, pendingNumber, currentNumber);
    }

    function combineArgs([a, b]: [CalculatorOperation, number], c: CalculatorNumber): [CalculatorOperation, number, CalculatorNumber] {
        return [a, b, c];
    }

    let calculatorCombinedInputs =
        O.zipWith(state.pendingOperation,
            services.getDisplayNumber(state.display),
            combineArgs);

    return pipe(calculatorCombinedInputs,
        O.map(doOperation),
        O.map(E.match(
            {
                onLeft: services.setDisplayNumber,
                onRight: services.setDisplayError
            })
        ),
        O.map(displayToState),
        O.getOrElse(() => state));
}

function updateWithAction(services: CalculatorServices, value: CalculatorAction, state: CalculatorState) {
    switch (value) {
        case CalculatorAction.Clear:
            return services.initState();
        case CalculatorAction.Equals:
            return updateDisplayFromPendingOp(services, state);
        default:
            const _check: never = value;
            return _check;
    }
    return undefined;
}

function addPendingMathOp(services: CalculatorServices, op: CalculatorOperation, state: CalculatorState) {
    let currentNumberOpt = services.getDisplayNumber(state.display);
    if (O.isSome(currentNumberOpt)) {
        const currentNumber = currentNumberOpt.value
        const pendingOp: O.Option<[CalculatorOperation, CalculatorNumber]> = O.some([op, currentNumber])
        return Object.assign({}, state, {pendingOp}) //return
    } else {
        return state // original state is untouched
    }
}

function createCalculate(services: CalculatorServices): Calculate {
    return (input, state) => {
        switch (input.tag) {
            case "CalculatorDigit":
                return updateDisplayFromDigit(services, input.value, state);
            case "CalculatorAction":
                return updateWithAction(services, input.value, state);
                break;
            case "CalculatorOperation":
                const newState1 = updateDisplayFromPendingOp(services, state);
                const newState2 = addPendingMathOp(services, input.value, newState1);
                return newState2;
                break;
            default:
                const _check: never = input;
                return _check;
        }
    };
}

