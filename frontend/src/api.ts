import type { AgentsResponse, CouncilResponse } from "./types";

export async function fetchAgents(signal?: AbortSignal): Promise<AgentsResponse> {
  const response = await fetch("/api/agents", { signal });
  if (!response.ok) {
    throw new Error("Failed to load agents.");
  }
  return response.json();
}

export async function runCouncil(
  topic: string,
  rounds: number,
  signal?: AbortSignal,
): Promise<CouncilResponse> {
  const response = await fetch("/api/council", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic, rounds }),
    signal,
  });

  const payload = (await response.json()) as CouncilResponse & { detail?: string };
  if (!response.ok) {
    throw new Error(payload.detail || "Council request failed.");
  }
  return payload;
}
