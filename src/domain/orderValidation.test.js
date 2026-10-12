import { describe, expect, test } from 'vitest'
import { validateOrder } from './orderValidation.js'
import { testGame, validInput } from '../test/fixtures.js'

describe('validateOrder', () => {
  test('нормалізує коректні поля, не змінюючи вхід', () => {
    const input = Object.freeze({
      ...validInput,
      comment: `  ${validInput.comment}  `,
      durationHours: '2',
      id: 'injected-id',
    })
    const result = validateOrder(input, [testGame])
    expect(result).toEqual({ ok: true, errors: {}, value: validInput })
    expect(result.value).not.toHaveProperty('id')
    expect(input.durationHours).toBe('2')
  })

  test.each(['', '0', '1.5', '9'])('відхиляє тривалість %j', (durationHours) => {
    const result = validateOrder({ ...validInput, durationHours }, [testGame])
    expect(result.ok).toBe(false)
    expect(result.errors.durationHours).toBeTruthy()
  })

  test.each([1, 8])('приймає граничну тривалість %i год.', (durationHours) => {
    const result = validateOrder({ ...validInput, durationHours }, [testGame])
    expect(result.ok).toBe(true)
  })

  test('для понад 4 годин вимагає консультацію', () => {
    const result = validateOrder(
      { ...validInput, durationHours: 5, needsConsultation: false },
      [testGame],
    )
    expect(result.ok).toBe(false)
    expect(result.errors.needsConsultation).toBeTruthy()
  })

  test('відхиляє невідому гру', () => {
    const result = validateOrder({ ...validInput, gameId: 'game-missing' }, [testGame])
    expect(result.errors.gameId).toBeTruthy()
  })
})
