const API_BASE_URL = "http://127.0.0.1:5001";
// const API_BASE_URL = "https://8dad-82-163-218-33.ngrok-free.app";

export const DEFAULT_MAX_STEPS = 20;

export async function cancelExperiment(): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}/cancel_experiment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel experiment: ${response.statusText}`);
  }

  return response.json();
}

export async function startExperiment(
  experimentId: string,
  targetColor: string,
  maxSteps: number = DEFAULT_MAX_STEPS
): Promise<Response> {
  // Convert hex color to RGB
  const hex = targetColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/optimize/${r}/${g}/${b}/${maxSteps}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to start experiment: ${response.statusText}`);
  }

  return response.json();
}

// We can add other experiment-related API calls here as needed

interface ActionLogEntry {
  data: {
    droplet_counts?: [number, number, number];
    color?: string;
    well_number: number;
    x: number;
    y: number;
  };
  experiment_id: string;
  timestamp: number;
  type: "place" | "read";
}

export async function getExperimentStatus(experimentId: string): Promise<{
  status: string;
  result?: {
    optimal_combo: [number, number, number];
  };
}> {
  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch experiment status: ${response.statusText}`);
  }

  return response.json();  // Return the parsed JSON directly
}

export async function startExperimentLLM(
  experimentId: string,
  targetColor: string,
  maxSteps: number = DEFAULT_MAX_STEPS
): Promise<Response> {
  // Convert hex color to RGB
  const hex = targetColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/optimize_llm/${r}/${g}/${b}/${maxSteps}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to start experiment: ${response.statusText}`);
  }

  return response.json();
}

export async function getExperimentActionLog(
  experimentId: string,
): Promise<ActionLogEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/action_log`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch action log: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("API Response:", data); // Debug log

  // Check if data.log exists, otherwise return empty array
  return data || [];
}
