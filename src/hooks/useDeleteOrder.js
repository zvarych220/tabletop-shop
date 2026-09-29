import useOrders from './useOrders.js'

export default function useDeleteOrder(items) {
  const { deleteOrder } = useOrders()

  return function deleteWithConfirmation(order) {
    const game = items.find((g) => g.id === order.gameId)
    const name = game?.title ?? order.gameId

    const confirmed = window.confirm(
      `Видалити заявку ${order.id} на гру «${name}»? Запис буде вилучено з поточної локальної колекції.`,
    )

    if (!confirmed) return { ok: false, cancelled: true }
    return deleteOrder(order.id)
  }
}
