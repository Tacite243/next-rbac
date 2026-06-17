import { Request, Response, NextFunction } from 'express';
import { mockUsers } from '../models/user.model.js';

export function mockAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const userId = req.headers['x-user-id'] as string;

    if (userId && mockUsers[userId]) {
        (req as any).user = mockUsers[userId];
    } else {
        (req as any).user = null;
    }

    next();
}