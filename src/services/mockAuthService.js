import { users as initialUsers } from '../data/users.js'
import { ServiceError } from './ServiceError.js'

const USERS_STORAGE_KEY = 'dice_deck.users.v1'
const SESSION_STORAGE_KEY = 'dice_deck.auth_session.v1'

function pause(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const delay = 400 + Math.random() * 200
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

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (raw === null) {
      writeUsers(initialUsers)
      return [...initialUsers]
    }
    return JSON.parse(raw)
  } catch (error) {
    throw new ServiceError('Не вдалося прочитати дані користувачів зі сховища.', {
      code: 'STORAGE_READ',
    })
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch {
    throw new ServiceError('Не вдалося зберегти дані користувачів у сховище.', {
      code: 'STORAGE_WRITE',
    })
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(user) {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  } catch {
    throw new ServiceError('Не вдалося зберегти сесію у сховище.', {
      code: 'STORAGE_WRITE',
    })
  }
}

export const mockAuthService = {
  async login(email, password, { signal } = {}) {
    await pause(signal)

    if (!email || !password) {
      throw new ServiceError('Email та пароль обов\'язкові для входу.', {
        code: 'VALIDATION_ERROR',
      })
    }

    const users = readUsers()
    const user = users.find((u) => u.email === email)

    if (!user) {
      throw new ServiceError('Користувача з таким email не знайдено.', {
        code: 'USER_NOT_FOUND',
      })
    }

    if (user.password !== password) {
      throw new ServiceError('Невірний пароль.', {
        code: 'INVALID_PASSWORD',
      })
    }

    const { password: _, ...userWithoutPassword } = user
    writeSession(userWithoutPassword)
    return userWithoutPassword
  },

  async register(userData, { signal } = {}) {
    await pause(signal)

    const { email, password, name, phone = '', address = '' } = userData

    if (!email || !password || !name) {
      throw new ServiceError('Email, пароль та ім\'я обов\'язкові для реєстрації.', {
        code: 'VALIDATION_ERROR',
      })
    }

    if (password.length < 6) {
      throw new ServiceError('Пароль повинен містити мінімум 6 символів.', {
        code: 'WEAK_PASSWORD',
      })
    }

    const users = readUsers()
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      throw new ServiceError('Користувач з таким email вже існує.', {
        code: 'USER_EXISTS',
      })
    }

    const newUser = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      email,
      password,
      name,
      phone,
      address,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      createdAt: new Date().toISOString(),
    }

    writeUsers([...users, newUser])

    const { password: _, ...userWithoutPassword } = newUser
    writeSession(userWithoutPassword)
    return userWithoutPassword
  },

  async logout({ signal } = {}) {
    await pause(signal)
    writeSession(null)
  },

  getCurrentUser() {
    return readSession()
  },

  async updateProfile(userId, updates, { signal } = {}) {
    await pause(signal)

    if (!userId) {
      throw new ServiceError('ID користувача обов\'язковий для оновлення профілю.', {
        code: 'VALIDATION_ERROR',
      })
    }

    const users = readUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new ServiceError('Користувача не знайдено.', {
        code: 'USER_NOT_FOUND',
      })
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
      id: userId,
      email: users[userIndex].email,
      createdAt: users[userIndex].createdAt,
    }

    users[userIndex] = updatedUser
    writeUsers(users)

    const session = readSession()
    if (session?.id === userId) {
      const { password: _, ...userWithoutPassword } = updatedUser
      writeSession(userWithoutPassword)
      return userWithoutPassword
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  },
}
