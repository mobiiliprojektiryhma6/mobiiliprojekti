declare module 'firebase/auth/react-native' {
    import type { Persistence } from 'firebase/auth';
    export function getReactNativePersistence(storage: {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
    }): Persistence;
}

// Adapts React native storage into firebase
// Saves auth status on app restart.