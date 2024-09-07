'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [currentOperation, setCurrentOperation] = useState(null)
  const [previousValue, setPreviousValue] = useState(null)
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)

  const handleNumberClick = (number: number) => {
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