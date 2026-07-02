import { useRef } from 'react'

export default function OtpInput({ length = 6, value, onChange }) {
  const inputsRef = useRef([])
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const setDigit = (index, digit) => {
    const nextDigits = [...digits]
    nextDigits[index] = digit
    onChange(nextDigits.join(''))
  }

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      setDigit(index, '')
      return
    }
    const digit = raw[raw.length - 1]
    setDigit(index, digit)
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    onChange(pasted.padEnd(length, ''))
    const focusIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1} of ${length}`}
          className="h-12 w-10 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:border-brand focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      ))}
    </div>
  )
}
