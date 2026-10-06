import { orders as initialOrders } from '../data/orders.js'
import { ServiceError } from './ServiceError.js'
import { toOrderInput, toOrderList } from './orderContract.js'

const storageKey = 'dice_deck.orders.v1'
const failures = new Set()

export function failNextMockOrder(operation) {
  failures.add(operation)
}

function pause(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, 600)

    function abort() {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
  })
}

async function before(operation, signal) {
  await pause(signal)
  if (failures.delete(operation)) {
    throw new ServiceError('Навчальна відмова сервісу. Спробуйте повторити дію.', {
      code: 'MOCK_FAILURE',
    })
  }
}

function read() {
  try {
    const raw = localStorage.getItem(storageKey)
    return toOrderList(raw === null ? initialOrders : JSON.parse(raw))
  } catch (error) {
    if (error instanceof ServiceError) throw error
    throw new ServiceError('Не вдалося прочитати локальні дані сховища.', {
      code: 'STORAGE_READ',
    })
  }
}

function write(records) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records))
  } catch {
    throw new ServiceError('Не вдалося зберегти локальні дані у сховище.', {
      code: 'STORAGE_WRITE',
    })
  }
}

function findRecord(records, id) {
  const record = records.find((entry) => entry.id === id)
  if (!record) {
    throw new ServiceError('Заявку не знайдено.', { code: 'NOT_FOUND' })
  }
  return record
}

export const mockOrderService = {
  async getAll({ signal } = {}) {
    await before('getAll', signal)
    return read()
  },

  async getById(id, { signal } = {}) {
    await before('getById', signal)
    return findRecord(read(), id)
  },

  async create(input) {
    const value = toOrderInput(input)
    await before('create')
    const records = read()
    const record = { ...value, id: `ord-${crypto.randomUUID().slice(0, 8)}` }
    write([...records, record])
    return { ...record }
  },

  async update(id, input) {
    const value = toOrderInput(input)
    await before('update')
    const records = read()
    findRecord(records, id)
    const record = { ...value, id }
    write(records.map((entry) => (entry.id === id ? record : entry)))
    return { ...record }
  },

  async delete(id) {
    await before('delete')
    const records = read()
    findRecord(records, id)
    write(records.filter((entry) => entry.id !== id))
  },
}
