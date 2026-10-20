import { ServiceError } from './ServiceError.js'

export function createApiOrderService(baseUrl) {
  if (!baseUrl?.trim()) {
    throw new ServiceError("Не налаштовано базову адресу API у змінних середовища.", {
      code: 'CONFIG',
    })
  }
  const base = baseUrl.trim().replace(/\/+$/, '')

  async function request(path, { method = 'GET', body, signal } = {}) {
    let response
    try {
      const token = localStorage.getItem('authToken')

      response = await fetch(`${base}${path}`, {
        method,
        signal,
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ServiceError("Не вдалося зв'язатися із сервером.", {
        code: 'NETWORK',
      })
    }

    if (!response.ok) {
      const messages = {
        400: "Сервіс відхилив дані заявки.",
        401: "Потрібна авторизація для виконання дії.",
        403: "Дію заборонено політикою доступу.",
        404: "Заявку не знайдено на сервері.",
        409: "Конфлікт даних. Оновіть сторінку.",
        422: "Сервер відхилив валідацію полів.",
        429: "Забагато запитів. Зачекайте хвилину.",
      }
      let serverPayload = null
      try {
        serverPayload = await response.json()
      } catch {
        // ignore
      }
      const message =
        serverPayload?.message ||
        serverPayload?.error ||
        messages[response.status] ||
        "Сервер тимчасово не відповідає."

      throw new ServiceError(message, {
        code: response.status === 404 ? 'NOT_FOUND' : 'HTTP',
        status: response.status,
        errors: serverPayload?.errors,
      })
    }

    if (response.status === 204) return undefined

    try {
      const data = await response.json()
      // Unwrap backend envelope { success: true, data: ... }
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data
      }
      return data
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ServiceError("Сервер повернув відповідь не у форматі JSON.", {
        code: 'BAD_DATA',
      })
    }
  }

  function recordPath(id) {
    return `/orders/${encodeURIComponent(id)}`
  }

  return {
    async getAll({ signal } = {}) {
      const data = await request('/orders', { signal })
      return Array.isArray(data) ? data : []
    },

    async getById(id, { signal } = {}) {
      const record = await request(recordPath(id), { signal })
      if (!record || String(record.id) !== String(id)) {
        throw new ServiceError("Сервіс повернув іншу заявку.", { code: 'BAD_DATA' })
      }
      return record
    },

    async create(input) {
      return await request('/orders', {
        method: 'POST',
        body: input,
      })
    },

    async update(id, input) {
      const record = await request(recordPath(id), {
        method: 'PUT',
        body: input,
      })
      if (!record || String(record.id) !== String(id)) {
        throw new ServiceError("Сервіс змінив ID заявки.", { code: 'BAD_DATA' })
      }
      return record
    },

    async delete(id) {
      await request(recordPath(id), { method: 'DELETE' })
    },
  }
}

  