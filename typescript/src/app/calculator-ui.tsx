'use client'

import {useState} from 'react'
import {Button} from "@/components/ui/button"
import * as Domain from "../Calculator"
import {Calculate, CalculatorDigit, CalculatorOperation, CalculatorState, createCalculate} from "../Calculator"
import {Either as E, Option as O} from 'effect'

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [currentOperation, setCurrentOperation] = useState(null)
  const [previousValue, setPreviousValue] = useState(null)
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)

  const services: Domain.CalculatorServices = {
    updateDisplayFromDigit: function (digit: Domain.CalculatorDigit, display: Domain.CalculatorDisplay): Domain.CalculatorDisplay {
      let newDigit = "";
      switch (digit) {
        case CalculatorDigit.Zero:
          newDigit = "0";
          // todo deal with special cases
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
          // todo deal with special cases
          break;
      }

      //todo deal with display length special cases
      return display + newDigit;
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
      return {display: "", pendingOperation: O.none()};
    }
  }
  const calculate: Calculate = createCalculate(services);
  const handleNumberClick = (number: number) => {
    const calculatorInputConvertor = (number: number) => {
      switch (number) {
        case 0:
          return CalculatorDigit.Zero;
        case 1:
          return CalculatorDigit.One;
        case 2:
          return CalculatorDigit.Two;
        case 3:
          return CalculatorDigit.Three;
        case 4:
          return CalculatorDigit.Four;
        case 5:
          return CalculatorDigit.Five;
        case 6:
          return CalculatorDigit.Six;
        case 7:
          return CalculatorDigit.Seven;
        case 8:
          return CalculatorDigit.Eight;
        case 9:
          return CalculatorDigit.Nine;
        default:
          //todo consider using _check
          return CalculatorDigit.Zero;
      }
    };

    let state: CalculatorState = services.initState();
    state = calculate({
      tag: "CalculatorDigit",
      value: calculatorInputConvertor(number)
    }, state);
    if (display === '0' || shouldResetDisplay) {
      setDisplay(number.toString())
      setShouldResetDisplay(false)
    } else {
      setDisplay(display + number)
    }
  }

  const handleOperationClick = (operation: any) => {
    setCurrentOperation(operation)
    //setPreviousValue(parseFloat(display))
    setShouldResetDisplay(true)
  }

  const handleEquals = () => {
    if (currentOperation && previousValue !== null) {
      const currentValue = parseFloat(display)
      let result
      switch (currentOperation) {
        case '+':
          result = previousValue + currentValue
          break
        case '-':
          result = previousValue - currentValue
          break
        case '*':
          result = previousValue * currentValue
          break
        default:
          return
      }
      setDisplay(result.toString())
      setCurrentOperation(null)
      setPreviousValue(null)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setCurrentOperation(null)
    setPreviousValue(null)
    setShouldResetDisplay(false)
  }

  return (
      <div className="w-64 mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="mb-4 p-2 bg-white rounded text-right text-2xl font-bold h-12 overflow-hidden">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((num) => (
              <Button key={num} onClick={() => handleNumberClick(num)} variant="outline">
                {num}
              </Button>
          ))}
          <Button onClick={() => handleOperationClick('+')} variant="secondary">+</Button>
          <Button onClick={() => handleOperationClick('-')} variant="secondary">-</Button>
          <Button onClick={() => handleOperationClick('*')} variant="secondary">*</Button>
          <Button onClick={handleEquals} variant="default">=</Button>
          <Button onClick={handleClear} variant="destructive" className="col-span-4">C</Button>
        </div>
      </div>
  )
}
