import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RbacEngine } from '@next-rbac/core';

/**
 * Crée un outil de protection pour les API Route Handlers.
 */
export function createRouteHandlerProtector<
    TEngine extends RbacEngine<any, any, any>
>(engine: TEngine) {
    return function withRouteProtection(
        getUser: (req: NextRequest) => Promise<any> | any,
        requirement: { action: string; resource: string },
        handler: (req: NextRequest, ...args: any[]) => Promise<Response> | Response
    ) {
        return async function (req: NextRequest, ...args: any[]): Promise<Response> {
            const user = await getUser(req);

            if (!user || engine.cannot(user, requirement.action, requirement.resource)) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'You do not have access to this resource.' },
                    { status: 403 }
                );
            }

            return handler(req, ...args);
        };
    };
}