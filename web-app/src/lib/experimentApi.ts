const API_BASE_URL = 'http://127.0.0.1:5000';

export async function startExperiment(experimentId: string): Promise<Response> {
  const response = await fetch(
    `${API_BASE_URL}/experiments/${experimentId}/start_experiment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to start experiment: ${response.statusText}`);
  }

  return response.json();
}

// We can add other experiment-related API calls here as needed
