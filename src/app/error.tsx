"use client"

export default function ErrorScreen({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error" role="alert">
      <p>{error.message || "Something went wrong."}</p>
      <button className="btn" type="button" onClick={reset}>Try again</button>
    </div>
  )
}
