import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import OrderPage from './OrderPage.jsx'
import { testGame, validInput, savedOrder } from '../test/fixtures.js'
import { deferred } from '../test/deferred.js'

function renderEditor(onSave) {
  return render(
    <OrderPage
      title="Створення замовлення"
      game={testGame}
      onSave={onSave}
      onCancel={() => {}}
    />,
  )
}

test('не зберігає порожній коментар та встановлює фокус у поле з помилкою', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  renderEditor(onSave)

  await user.click(screen.getByRole('button', { name: 'Створити заявку' }))

  const commentInput = screen.getByRole('textbox', { name: /Коментар/ })
  expect(commentInput).toHaveAttribute('aria-invalid', 'true')
  expect(commentInput).toHaveFocus()
  expect(onSave).not.toHaveBeenCalled()
})

test('блокує повторне подання до отримання відповіді сервісу', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  const onSave = vi.fn().mockReturnValue(pending.promise)

  renderEditor(onSave)

  await user.type(screen.getByRole('textbox', { name: /Коментар/ }), validInput.comment)
  await user.click(screen.getByRole('button', { name: 'Створити заявку' }))

  const submitBtn = screen.getByRole('button', { name: 'Збереження…' })
  expect(submitBtn).toBeDisabled()
  expect(onSave).toHaveBeenCalledTimes(1)

  await act(async () => {
    pending.resolve({ ok: true, record: savedOrder })
    await pending.promise
  })
})
