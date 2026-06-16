import React, { ReactNode } from 'react';
import { useAuth } from './hooks.js';

export interface AuthComponentProps {
    action: string;
    resource: any;
    context?: any;
    fallback?: ReactNode;
    children: ReactNode;
}

export function Can({ action, resource, context, fallback = null, children }: AuthComponentProps) {
    const { can } = useAuth();

    if (can(action, resource, context)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

export function Cannot({ action, resource, context, fallback = null, children }: AuthComponentProps) {
    const { cannot } = useAuth();

    if (cannot(action, resource, context)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}