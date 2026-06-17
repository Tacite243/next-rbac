import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    console.error(err);

    res.status(err.status || 500).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'Une erreur interne est survenue.'
    });
}