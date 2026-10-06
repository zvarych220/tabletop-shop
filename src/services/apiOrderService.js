import { ServiceError } from './ServiceError.js'
import { toOrder, toOrderInput, toOrderList } from './orderContract.js'

export function createApiOrderService(baseUrl) {
  if (!baseUrl?.trim()) {
    throw new ServiceError('Не налаштовано базову адресу API у змінних середовища.', {
      code: 'CONFIG',
    })
  }
  const base = baseUrl.trim().replace(/\/+$/, '')

  async function request(path, { method = 'GET', body, signal } = {}) {
    let response
    try {
      response = await fetch(`${base}${path}`, {
        method,
        signal,
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ServiceError('Не вдалося зв’язатися із сервером.', {
        code: 'NETWORK',
      })
    }

    if (!response.ok) {
      const messages = {
        400: 'Сервіс відхилив дані заявки.',
        401: 'Потрібна авторизація для виконання дії.',
        403: 'Дію заборонено політикою доступу.',
        404: 'Заявку не знайдено на сервері.',
        409: 'Конфлікт даних. Оновіть сторінку.',
        422: 'Сервер відхилив валідацію полів.',
        429: 'Забагато запитів. Зачекайте хвилину.',
      }
      throw new ServiceError(
        messages[response.status] ?? 'Сервер тимчасово не відповідає.',
        {
          code: response.status === 404 ? 'NOT_FOUND' : 'HTTP',
          status: response.status,
        },
      )
    }

    if (response.status === 204) return undefined

    try {
      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ServiceError('Сервер повернув відповідь не у форматі JSON.', {
        code: 'BAD_DATA',
      })
    }
  }

  function recordPath(id) {
    return `/orders/${encodeURIComponent(id)}`
  }

  return {
    async getAll({ signal } = {}) {
      return toOrderList(await request('/orders', { signal }))
    },

    async getById(id, { signal } = {}) {
      const record = toOrder(await request(recordPath(id), { signal }))
      if (record.id !== id) {
        throw new ServiceError('Сервіс повернув іншу заявку.', { code: 'BAD_DATA' })
      }
      return record
    },

    async create(input) {
      return toOrder(
        await request('/orders', {
          method: 'POST',
          body: toOrderInput(input),
        }),
      )
    },

    async update(id, input) {
      const record = toOrder(
        await request(recordPath(id), {
          method: 'PUT',
          body: toOrderInput(input),
        }),
      )
      if (record.id !== id) {
        throw new ServiceError('Сервіс змінив ID заявки.', { code: 'BAD_DATA' })
      }
      return record
    },

    async delete(id) {
      await request(recordPath(id), { method: 'DELETE' })
    },
  }
}
