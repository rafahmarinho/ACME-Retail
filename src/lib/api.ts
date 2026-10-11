import { NextResponse } from "next/server"
import { AppError, toErrorMessage } from "@/lib/errors"

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function fail(error: unknown) {
  const status = error instanceof AppError ? error.status : 400
  return NextResponse.json({ error: toErrorMessage(error) }, { status })
}

export async function readJson<T>(request: Request) {
  try {
    return (await request.json()) as T
  } catch {
    throw new AppError("The request body could not be read.")
  }
}
