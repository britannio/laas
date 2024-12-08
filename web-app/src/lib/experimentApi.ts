const API_BASE_URL = "http://127.0.0.1:5001";
// const API_BASE_URL = "https://8dad-82-163-218-33.ngrok-free.app";

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

export async function startExperiment(experimentId: string): Promise<Response> {
  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/start_experiment`,
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

export async function getExperimentActionLog(experimentId: string): Promise<ActionLogEntry[]> {
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
  return data.log || [];
}
