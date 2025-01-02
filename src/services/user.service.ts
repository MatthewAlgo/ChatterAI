import { azureQueryService } from './azure-query.service';
import crypto from 'crypto';

export const userService = {
    generateUserId(name: string, email: string, password: string): string {
        const data = `${name}${email}${password}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    },

    async createUser(name: string, email: string, password: string): Promise<string> {
        const userId = this.generateUserId(name, email, password);
        
        await azureQueryService.executeQuery(`
            INSERT INTO Users (userId, name, email)
            VALUES (@userId, @name, @email)
        `, {
            userId,
            name,
            email
        });
        
        return userId;
    }
};
