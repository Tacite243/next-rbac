import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RbacEngine } from '@next-rbac/core';

export interface MiddlewareProtectionRule {
    /** Chemin d'URL sous forme de chaîne de départ ou d'expression régulière */
    path: string | RegExp;
    action: string;
    resource: string;
}

/**
 * Crée un outil de protection de routes pour le Middleware Next.js.
 */
export function createMiddlewareProtector<
    TEngine extends RbacEngine<any, any, any>
>(engine: TEngine) {
    return function protectMiddleware(
        getUser: (req: NextRequest) => Promise<any> | any,
        rules: MiddlewareProtectionRule[],
        fallbackUrl = '/unauthorized'
    ) {
        return async function (req: NextRequest): Promise<NextResponse> {
            const { pathname } = req.nextUrl;

            for (const rule of rules) {
                const matches = typeof rule.path === 'string'
                    ? pathname.startsWith(rule.path)
                    : rule.path.test(pathname);

                if (matches) {
                    const user = await getUser(req);

                    if (!user || engine.cannot(user, rule.action, rule.resource)) {
                        const redirectUrl = req.nextUrl.clone();
                        redirectUrl.pathname = fallbackUrl;
                        return NextResponse.redirect(redirectUrl);
                    }
                }
            }

            return NextResponse.next();
        };
    };
}