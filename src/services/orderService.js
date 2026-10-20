import { createApiOrderService } from './apiOrderService.js'

const source = import.meta.env.VITE_DATA_SOURCE ?? 'api'

function selectService() {
  if (source === 'api') {
    return createApiOrderService(import.meta.env.VITE_API_BASE_URL)
  }
  throw new Error(`Unsupported data source: ${source}. Only 'api' is supported.`)
}

export const orderService = selectService()
