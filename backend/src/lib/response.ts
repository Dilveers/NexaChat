export function ok(body: Record<string, unknown> = {}) {
  return {
    statusCode: 200,
    body: JSON.stringify(body)
  };
}

export function badRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ message })
  };
}

export function serverError(error: unknown) {
  console.error(error);

  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Internal server error" })
  };
}

