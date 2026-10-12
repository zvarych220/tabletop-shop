import { expect, test } from 'vitest'
import { selectOrders } from './selectOrders.js'
import { savedOrder, testGame } from '../test/fixtures.js'

test('поєднує пошук, консультацію та сортування без мутації', () => {
  const records = Object.freeze([
    Object.freeze({ ...savedOrder, id: 'ord-1', durationHours: 4 }),
    Object.freeze({ ...savedOrder, id: 'ord-2', durationHours: 1 }),
    Object.freeze({ ...savedOrder, id: 'ord-3', needsConsultation: false }),
  ])

  const result = selectOrders(records, [testGame], {
    query: ' ТУРНІРОМ ',
    consultation: 'yes',
    sort: 'duration-asc',
  })

  expect(result.map((r) => r.id)).toEqual(['ord-2', 'ord-1'])
  expect(records.map((r) => r.id)).toEqual(['ord-1', 'ord-2', 'ord-3'])
})
