import { createContext, useContext, type ReactNode } from 'react';
import { RbacEngine } from '@next-rbac/core';


export interface AuthContextValue<
    TEngine extends RbacEngine<any, any, any> = RbacEngine<any, any, any>
> {
    engine: TEngine;
    user: any;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps<TEngine extends RbacEngine<any, any, any>> {
    engine: TEngine;
    user: any;
    children: ReactNode;
}

export function AuthProvider<TEngine extends RbacEngine<any, any, any>>({
    engine,
    user,
    children,
}: AuthProviderProps<TEngine>) {
    return (
        <AuthContext.Provider value={{ engine, user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}