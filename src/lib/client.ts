export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "content-type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  })
  const body = await response.json().catch(() => ({ error: "The server returned an unreadable response." }))
  if (!response.ok) throw new Error(body.error || "Something went wrong. Try again.")
  return body as T
}

export function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
