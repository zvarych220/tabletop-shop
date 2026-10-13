import { ServiceError } from './ServiceError.js'

const FAVORITES_STORAGE_KEY = 'dice_deck.favorites.v1'

function pause(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const delay = 300 + Math.random() * 200
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, delay)

    function abort() {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', abort, { once: true })
  })
}

function getStorageKey(userId) {
  return userId ? `${FAVORITES_STORAGE_KEY}.${userId}` : `${FAVORITES_STORAGE_KEY}.guest`
}

function readFavorites(userId) {
  try {
    const key = getStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    throw new ServiceError('Не вдалося прочитати список обраного зі сховища.', {
      code: 'STORAGE_READ',
    })
  }
}

function writeFavorites(userId, favorites) {
  try {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(favorites))
  } catch {
    throw new ServiceError('Не вдалося зберегти список обраного у сховище.', {
      code: 'STORAGE_WRITE',
    })
  }
}

export const mockFavoritesService = {
  async getFavorites(userId, { signal } = {}) {
    await pause(signal)
    return readFavorites(userId)
  },

  async toggleFavorite(userId, gameId, { signal } = {}) {
    await pause(signal)

    if (!gameId) {
      throw new ServiceError('ID гри обов\'язковий для зміни статусу обраного.', {
        code: 'VALIDATION_ERROR',
      })
    }

    const favorites = readFavorites(userId)
    const index = favorites.indexOf(gameId)

    if (index >= 0) {
      favorites.splice(index, 1)
      writeFavorites(userId, favorites)
      return { gameId, isFavorite: false }
    } else {
      favorites.push(gameId)
      writeFavorites(userId, favorites)
      return { gameId, isFavorite: true }
    }
  },

  isFavorite(userId, gameId) {
    const favorites = readFavorites(userId)
    return favorites.includes(gameId)
  },

  async clearFavorites(userId, { signal } = {}) {
    await pause(signal)
    writeFavorites(userId, [])
  },
}
