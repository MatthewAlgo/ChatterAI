export const azureQueryService = {
  async executeQuery(query: string) {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Query execution failed');
    }

    return response.json();
  }
};
