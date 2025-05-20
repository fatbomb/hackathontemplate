import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

let pbInstance: PocketBase | null = null;

export async function getPocketBase(cookieHeader?: string): Promise<PocketBase> {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
    
    // Server-side handling
    if (typeof window === 'undefined') {
        // Try to get auth from cookies if no cookieHeader provided
        const cookieStore = await cookies();
        const pbAuthCookie = cookieStore.get('pb_auth')?.value || cookieHeader;
        
        if (pbAuthCookie) {
            try {
                pb.authStore.loadFromCookie(pbAuthCookie);
            } catch (e) {
                console.error('Failed to load auth from cookie', e);
            }
        }
        return pb;
    }

    // Client-side handling (singleton pattern)
    if (!pbInstance) {
        pbInstance = pb;
        
        // Load from localStorage if available
        const authData = localStorage.getItem('pocketbase_auth');
        if (authData) {
            try {
                const { token, model } = JSON.parse(authData);
                pb.authStore.save(token, model);
            } catch (e) {
                console.error('Failed to parse auth from localStorage', e);
                localStorage.removeItem('pocketbase_auth');
            }
        }

        // Set up auth store change listener
        pb.authStore.onChange((token, model) => {
            if (token && model) {
                localStorage.setItem(
                    'pocketbase_auth',
                    JSON.stringify({ token, model })
                );
            } else {
                localStorage.removeItem('pocketbase_auth');
            }
        }, true);
    }

    return pbInstance;
}

export function getAuthTokenFromCookie(cookieHeader: string): string | null {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
            acc[key] = decodeURIComponent(value);
        }
        return acc;
    }, {} as Record<string, string>);

    return cookies['pb_auth'] || null;
}

export async function getCurrentUser() {
    const pb = getPocketBase();
    try {
        if ((await pb).authStore.isValid) {
            // Refresh auth if needed
            const pocketBaseInstance = await pb;
            await pocketBaseInstance.collection('users').authRefresh();
            return pocketBaseInstance.authStore.model;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing auth:', error);
        (await pb).authStore.clear();
        return null;
    }
}