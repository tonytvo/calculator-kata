'use client'

import {useState} from 'react'
import {Button} from "@/components/ui/button"
import * as Domain from "../Calculator"
import {Calculate, CalculatorAction, CalculatorDigit, CalculatorOperation, createCalculate} from "@/Calculator"
import {Either as E, Option as O} from 'effect'

const MAX_DISPLAY_LENGTH = 10;

function calculatorDigitToString(digit: CalculatorDigit) {
  let newDigit = "";
  switch (digit) {
    case CalculatorDigit.Zero:
      newDigit = "0";
      break;
    case CalculatorDigit.One:
      newDigit = "1";
      break;
    case CalculatorDigit.Two:
      newDigit = "2";
      break;
    case CalculatorDigit.Three:
      newDigit = "3";
      break;
    case CalculatorDigit.Four:
      newDigit = "4";
      break;
    case CalculatorDigit.Five:
      newDigit = "5";
      break;
    case CalculatorDigit.Six:
      newDigit = "6";
      break;
    case CalculatorDigit.Seven:
      newDigit = "7";
      break;
    case CalculatorDigit.Eight:
      newDigit = "8";
      break;
    case CalculatorDigit.Nine:
      newDigit = "9";
      break;
    case CalculatorDigit.DecimalSeparator:
      newDigit = ".";
      break;
  }
  return newDigit;
}

export default function Calculator() {
  const services: Domain.CalculatorServices = {
    updateDisplayFromDigit: function (digit: Domain.CalculatorDigit, display: Domain.CalculatorDisplay): Domain.CalculatorDisplay {

      let newDigit = calculatorDigitToString(digit);
      if (display === '0' && newDigit === '0') {
        newDigit = '';
      }

      if (display === '' && newDigit === '.') {
        newDigit = '0.';
      }

      if (display.includes('.') && newDigit === '.') {
        newDigit = '';
      }

      if (display.length + newDigit.length > MAX_DISPLAY_LENGTH) {
        newDigit = '';
      }

      if(state.allowAppend) {
        return display + newDigit;
      }
      return newDigit;
    },
    doMathOperation: function (operation: Domain.CalculatorOperation, a: Domain.CalculatorNumber, b: Domain.CalculatorNumber): Domain.MathOperationResult {
      switch (operation) {
        case CalculatorOperation.Add:
          return E.left(a+b);
        case CalculatorOperation.Subtract:
          return E.left(a-b);
        case CalculatorOperation.Multiply:
          return E.left(a*b);
        case CalculatorOperation.Divide:
          if (b === 0) {
            return E.right(Domain.MathOperationError.DivideByZero);
          }
          return E.left(a/b);
      }
    },

    getDisplayNumber: function (display: Domain.CalculatorDisplay): O.Option<Domain.CalculatorNumber> {
      const displayNumber = parseFloat(display);
      if (isNaN(displayNumber)) {
        return O.none();
      }
      return O.some(displayNumber);
    },

    setDisplayNumber: function (number: Domain.CalculatorNumber): Domain.CalculatorDisplay {
      return number.toString();
    },

    setDisplayError: function (error: Domain.MathOperationError): Domain.CalculatorDisplay {
      return "E";
    },

    initState: function (): Domain.CalculatorState {
      return {display: "", pendingOperation: O.none(), allowAppend: true};
    }
  }
  const calculate: Calculate = createCalculate(services);
  const [state, setState] = useState(services.initState);

  const handleNumberClick = (number: CalculatorDigit) => {
    setState(calculate({
      tag: "CalculatorDigit",
      value: number
    }, state));
  }

  const handleOperationClick = (operation: CalculatorOperation) => {
    setState(calculate({
      tag: "CalculatorOperation",
      value: operation,
    }, state));
    //setPreviousValue(parseFloat(display))
  }

  const handleEquals = () => {
    setState(calculate({
      tag: "CalculatorAction",
      value: CalculatorAction.Equals,
    }, state))
  }

  const handleClear = () => {
    setState(calculate({
      tag: "CalculatorAction",
      value: CalculatorAction.Clear,
    }, state))
  }

  return (
      <div className="w-64 mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="mb-4 p-2 bg-white rounded text-right text-2xl font-bold h-12 overflow-hidden">
          {state.display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[CalculatorDigit.Seven, CalculatorDigit.Eight, CalculatorDigit.Nine,
            CalculatorDigit.Four, CalculatorDigit.Five, CalculatorDigit.Six,
            CalculatorDigit.One, CalculatorDigit.Two, CalculatorDigit.Three,
            CalculatorDigit.Zero, CalculatorDigit.DecimalSeparator].map((num) => (
              <Button key={num} onClick={() => handleNumberClick(num)} variant="outline">
                {calculatorDigitToString(num)}
              </Button>
          ))}
          <Button onClick={() => handleOperationClick(CalculatorOperation.Add)} variant="secondary">+</Button>
          <Button onClick={() => handleOperationClick(CalculatorOperation.Subtract)} variant="secondary">-</Button>
          <Button onClick={() => handleOperationClick(CalculatorOperation.Multiply)} variant="secondary">*</Button>
          <Button onClick={() => handleOperationClick(CalculatorOperation.Divide)} variant="secondary">/</Button>
          <Button onClick={handleEquals} variant="default">=</Button>
          <Button onClick={handleClear} variant="destructive" className="col-span-4">C</Button>
        </div>
      </div>
  )
}
