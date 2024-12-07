const API_BASE_URL = 'https://api.laas.local';

export async function addDyesToWell(
  x: number,
  y: number,
  drops: [number, number, number]
): Promise<void> {
  await fetch(`${API_BASE_URL}/well/${x}/${y}/add_dyes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drops }),
  });
}

export async function getWellColor(
  x: number,
  y: number
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/well/${x}/${y}/color`);
  const data = await response.json();
  return data.color;
}