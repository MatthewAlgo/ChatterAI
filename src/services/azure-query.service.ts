import { QueryResponse } from './types/chat.types';

export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

export const azureQueryService = {
    async executeQuery<T>(
        operationType: string,
        query: string,
        params?: QueryParams
    ): Promise<QueryResponse<T>> {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationType, query, params }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.details || `HTTP error! status: ${response.status}`);
            }

            if (data.status === 'error') {
                throw new Error(data.message || 'Database operation failed');
            }

            return data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Database query failed';
            throw new Error(`Query execution failed: ${errorMessage}`);
        }
    }
};
