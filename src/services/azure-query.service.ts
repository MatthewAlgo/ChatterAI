export const azureQueryService = {
    async executeQuery(query: string, params?: Record<string, any>) {
        try {
            console.log('Sending query to API:', query);
            console.log('With params:', params);

            const response = await fetch('/api/db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Database Error:', errorData);
                throw new Error(`Query execution failed: ${errorData.error}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Database Service Error:', error);
            throw new Error(error instanceof Error ? error.message : 'Query execution failed');
        }
    }
};
