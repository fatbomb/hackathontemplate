import PocketBase from 'pocketbase';

let pbInstance: PocketBase | null = null;

export function getPocketBase(cookieHeader?: string) {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
    const parsedCookieHeader = getTokenFromCookie(cookieHeader || '');
    console.log('Parsed cookie header:', parsedCookieHeader);

    // Server-side: load token from cookie
    if (typeof window === 'undefined' && parsedCookieHeader) {
        pb.authStore.loadFromCookie(parsedCookieHeader);
    }

    // Client-side: use singleton and localStorage
    if (typeof window !== 'undefined') {
        if (!pbInstance) {
            pbInstance = pb;

            const authData = localStorage.getItem('pocketbase_auth');
            if (authData) {
                const parsed = JSON.parse(authData);
                pb.authStore.save(parsed.token, parsed.model);
            }

            pb.authStore.onChange(() => {
                localStorage.setItem(
                    'pocketbase_auth',
                    JSON.stringify({
                        token: pb.authStore.token,
                        model: pb.authStore.model,
                    })
                );
            });
        }

        return pbInstance;
    }

    return pb;
}
function getTokenFromCookie(cookieHeader: string): string | null {
    const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {} as Record<string, string>);

    return cookies['pb_auth'] || null;
}


// Optional helper to extract auth token from cookies (can be used in server routes)
export function getAuthFromCookies(cookieHeader: string) {
    try {
        const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=');
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {} as Record<string, string>);

        return cookies['pb_auth'] || null;
    } catch (e) {
        console.error('Failed to parse auth from cookies', e);
        return null;
    }
}
