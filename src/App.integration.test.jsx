import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import { orderService } from './services/orderService.js'
import { savedOrder, validInput } from './test/fixtures.js'
import { deferred } from './test/deferred.js'

vi.mock('./services/orderService.js', () => ({
  orderService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  for (const method of Object.values(orderService)) method.mockReset()
  orderService.getAll.mockResolvedValue([{ ...savedOrder }])
  orderService.getById.mockResolvedValue({ ...savedOrder })
  orderService.create.mockImplementation(async (input) => ({ ...input, id: 'ord-created' }))
  orderService.update.mockImplementation(async (id, input) => ({ ...input, id }))
  orderService.delete.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="location">{location.pathname}</span>
}

function renderApp(path = '/orders') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
  return user
}

test('показує завантаження до отримання колекції', async () => {
  const pending = deferred()
  orderService.getAll.mockReturnValueOnce(pending.promise)
  renderApp()

  expect(screen.getByText(/Завантаження списку замовлень/)).toBeInTheDocument()

  await act(async () => {
    pending.resolve([savedOrder])
    await pending.promise
  })

  expect(await screen.findByText(savedOrder.comment)).toBeInTheDocument()
})

test('створює заявку та відкриває її підтверджені деталі', async () => {
  orderService.getAll.mockResolvedValueOnce([])
  const user = renderApp('/orders/new?gameId=game-001')

  const commentInput = await screen.findByRole('textbox', { name: /Коментар/ })
  await user.type(commentInput, validInput.comment)
  await user.click(screen.getByRole('button', { name: 'Створити заявку' }))

  expect(await screen.findByRole('heading', { name: 'Заявка #ord-created' })).toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/orders/ord-created')
  expect(orderService.create).toHaveBeenCalledWith(validInput)
})
