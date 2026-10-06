import useOrders from './useOrders.js'

export default function useDeleteOrder() {
  const { deleteOrder } = useOrders()

  return async function deleteWithConfirmation(order) {
    const customer = order.fullName || 'покупця'
    const confirmed = window.confirm(
      `Видалити замовлення #${order.id} (${customer})? Запис буде вилучено з постійного сховища.`,
    )

    if (!confirmed) return { ok: false, cancelled: true }
    return await deleteOrder(order.id)
  }
}
