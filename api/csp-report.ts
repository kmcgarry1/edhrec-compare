type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  end: () => void;
};

type StructuredReportBody = {
  blockedURL?: string;
  "blocked-uri"?: string;
  columnNumber?: number;
  "column-number"?: number;
  documentURL?: string;
  "document-uri"?: string;
  effectiveDirective?: string;
  "effective-directive"?: string;
  lineNumber?: number;
  "line-number"?: number;
  originalPolicy?: string;
  "original-policy"?: string;
  referrer?: string;
  sourceFile?: string;
  "source-file"?: string;
  statusCode?: number;
  "status-code"?: number;
  violatedDirective?: string;
  "violated-directive"?: string;
  disposition?: string;
};

type StructuredReport = {
  body?: StructuredReportBody;
  type?: string;
  url?: string;
};

type LegacyReport = {
  "csp-report"?: StructuredReportBody;
};

type NormalizedReport = {
  blockedURL?: string;
  documentURL?: string;
  effectiveDirective?: string;
  violatedDirective?: string;
  disposition?: string;
  lineNumber?: number;
  columnNumber?: number;
  sourceFile?: string;
  referrer?: string;
  statusCode?: number;
  originalPolicy?: string;
  reportURL?: string;
};

const redact = (value: unknown): string | number | undefined => {
  if (typeof value === "string") {
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (typeof value === "number") {
    return value;
  }
  return undefined;
};

const normalizeBody = (
  body?: StructuredReportBody,
  reportURL?: string
): NormalizedReport | null => {
  if (!body) {
    return null;
  }

  return {
    blockedURL: redact(body["blocked-uri"] ?? body.blockedURL),
    documentURL: redact(body["document-uri"] ?? body.documentURL),
    effectiveDirective: redact(
      body["effective-directive"] ?? body.effectiveDirective
    ),
    violatedDirective: redact(
      body["violated-directive"] ?? body.violatedDirective
    ),
    disposition: redact(body.disposition),
    lineNumber: body["line-number"] ?? body.lineNumber,
    columnNumber: body["column-number"] ?? body.columnNumber,
    sourceFile: redact(body["source-file"] ?? body.sourceFile),
    referrer: redact(body.referrer),
    statusCode: body["status-code"] ?? body.statusCode,
    originalPolicy: redact(body["original-policy"] ?? body.originalPolicy),
    reportURL: redact(reportURL),
  };
};

const normalizePayload = (payload: unknown): NormalizedReport[] => {
  if (!payload) {
    return [];
  }

  const reports: NormalizedReport[] = [];

  const addReport = (body?: StructuredReportBody, url?: string) => {
    const normalized = normalizeBody(body, url);
    if (normalized) {
      reports.push(normalized);
    }
  };

  if (Array.isArray(payload)) {
    payload.forEach((entry) => {
      if (
        entry &&
        typeof entry === "object" &&
        "type" in entry &&
        (entry as StructuredReport).type === "csp-violation"
      ) {
        const structured = entry as StructuredReport;
        addReport(structured.body, structured.url);
        return;
      }
      if (
        entry &&
        typeof entry === "object" &&
        "csp-report" in entry &&
        (entry as LegacyReport)["csp-report"]
      ) {
        addReport((entry as LegacyReport)["csp-report"], undefined);
      }
    });
    return reports;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "csp-report" in payload &&
    (payload as LegacyReport)["csp-report"]
  ) {
    addReport((payload as LegacyReport)["csp-report"], undefined);
    return reports;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "type" in payload &&
    (payload as StructuredReport).type === "csp-violation"
  ) {
    const structured = payload as StructuredReport;
    addReport(structured.body, structured.url);
    return reports;
  }

  return reports;
};

const parseBody = (body: unknown): unknown => {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const parsedBody = parseBody(req.body);
  const reports = normalizePayload(parsedBody);

  if (reports.length > 0) {
    console.error("[csp-violation]", JSON.stringify(reports));
  }

  res.status(204).end();
}
