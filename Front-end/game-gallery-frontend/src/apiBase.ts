/**
 * Base URL da API.
 * - Com VITE_API_URL definido: usa esse valor (produção ou IP customizado).
 * - Em dev sem env: URL vazia → fetch em `/api/...` (mesma origem), repassado pelo proxy do Vite para o back-end.
 * - Build de produção sem env: fallback para localhost (ajuste com VITE_API_URL em deploy).
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim()
  if (import.meta.env.DEV) return ''
  return 'http://localhost:3001'
}
