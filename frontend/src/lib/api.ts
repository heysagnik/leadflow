import type {
  AddDiscussionInput,
  CreateLeadInput,
  Discussion,
  LeadDetail,
  LeadFilters,
  LeadStatus,
  LeadSummary,
} from "./types";

const API_BASE = "/api/v1";
const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again.";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorEnvelope {
  error: { code: string; message: string };
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const { error } = value;
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    "code" in error &&
    typeof error.code === "string"
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, "network_error");
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    if (isErrorEnvelope(body))
      throw new ApiError(body.error.message, response.status, body.error.code);
    throw new ApiError("Something went wrong. Please try again.", response.status, "unknown");
  }

  // The API contract guarantees the response shape; types mirror backend schemas.
  return (await response.json()) as T;
}

function jsonBody(payload: unknown): RequestInit {
  return { body: JSON.stringify(payload) };
}

export function fetchLeads({ status, q }: LeadFilters): Promise<LeadSummary[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q.trim()) params.set("q", q.trim());
  const query = params.toString();
  return request<LeadSummary[]>(`/leads${query ? `?${query}` : ""}`);
}

export function fetchLead(id: number): Promise<LeadDetail> {
  return request<LeadDetail>(`/leads/${id}`);
}

export function createLead(input: CreateLeadInput): Promise<LeadSummary> {
  return request<LeadSummary>("/leads", { method: "POST", ...jsonBody(input) });
}

export function updateLeadStatus(id: number, status: LeadStatus): Promise<LeadSummary> {
  return request<LeadSummary>(`/leads/${id}/status`, { method: "PATCH", ...jsonBody({ status }) });
}

export function addDiscussion(id: number, input: AddDiscussionInput): Promise<Discussion> {
  return request<Discussion>(`/leads/${id}/discussions`, { method: "POST", ...jsonBody(input) });
}
