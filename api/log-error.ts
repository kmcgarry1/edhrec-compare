type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
};

type ClientErrorPayload = {
  message?: string;
  userMessage?: string;
  code?: string;
  stack?: string;
  context?: string;
  timestamp?: string;
};

const redact = (value: unknown) => {
  if (typeof value === "string") {
    return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  }
  return value;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const payload = (req.body ?? {}) as ClientErrorPayload;
  const logEntry = {
    ...payload,
    message: redact(payload.message),
    userMessage: redact(payload.userMessage),
    context: payload.context ?? "client",
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  console.error("[client-error]", JSON.stringify(logEntry));

  res.status(204).end();
}
