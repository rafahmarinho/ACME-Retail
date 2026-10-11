export class AppError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function friendlyDbError(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "The database request failed."
  if (message.includes("Could not find the function") || message.includes("schema cache") || message.includes("does not exist")) {
    return "Database setup is incomplete. Apply the Supabase migration, then run pnpm seed."
  }
  if (message.includes("JWT") || message.includes("Invalid API key")) {
    return "Supabase rejected the API key. Check the environment variables."
  }
  const cleaned = message.replace(/^.*ERROR:\s*/i, "").replace(/\n.*$/, "")
  return cleaned || "The request could not be completed."
}

export function toErrorMessage(error: unknown) {
  if (error instanceof AppError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Try again."
}
