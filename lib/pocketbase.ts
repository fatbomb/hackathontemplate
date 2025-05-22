import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090');
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



// Auth functions (unchanged)
export async function loginUser(email: string, password: string) {
  return await pb.collection('users').authWithPassword(email, password);
}

export async function registerUser(email: string, password: string, passwordConfirm: string, name: string) {
  return await pb.collection('users').create({
    email,
    password,
    passwordConfirm,
    name,
  });
}

export function logoutUser() {
  pb.authStore.clear();
}

export function isAuthenticated() {
  return pb.authStore.isValid;
}



// Chat functions (updated to match your schema)
export async function createChat(title: string) {
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
  return await pb.collection('chats').create({
    title,
    user: pb.authStore.model?.id,
    messages: [], // Default is already [] but explicit is good
  });
}



export async function getUserChats() {
  if (!isAuthenticated()) throw new Error('User not authenticated');
  return await pb.collection('chats').getFullList({
    filter: `user = "${pb.authStore.model?.id}"`,
    sort: '-updatedAt', // Using your custom updatedAt field
  });
}

export async function getChat(chatId: string) {
  if (!isAuthenticated()) throw new Error('User not authenticated');
  return await pb.collection('chats').getOne(chatId);
}

export async function saveMessage(chatId: string, content: string, role: 'user' | 'bot') {
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
  const chat = await pb.collection('chats').getOne(chatId);
  const messages = chat.messages || [];
  
  const newMessage = {
    content,
    role,
    timestamp: new Date().toISOString(),
  };
  
  return await pb.collection('chats').update(chatId, {
    messages: [...messages, newMessage],
  });
}

export async function deleteChat(chatId: string) {
  if (!isAuthenticated()) throw new Error('User not authenticated');
  return await pb.collection('chats').delete(chatId);
}

// In your pocketbase lib file
export const updateChatTitle = async (chatId: string, newTitle: string) => {
  try {
    await pb.collection('chats').update(chatId, { title: newTitle });
  } catch (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }
};

// async function createSchema() {
//   try {
   
//     if (!isAuthenticated()) throw new Error('User not authenticated');
    
//     // Create environmental_data collection
//     await pb.collections.create({
//       name: 'environmental_data',
//       type: 'base',
//       schema: [
//         {
//           name: 'dataType',
//           type: 'text',
//           required: true,
//           options: {
//             min: 1,
//             max: 50,
//           }
//         },
//         {
//           name: 'value',
//           type: 'text',
//           required: true,
//           options: {
//             min: 1,
//             max: 500,
//           }
//         },
//         {
//           name: 'notes',
//           type: 'text',
//           required: false,
//         },
//         {
//           name: 'latitude',
//           type: 'number',
//           required: true,
//         },
//         {
//           name: 'longitude',
//           type: 'number',
//           required: true,
//         },
//         {
//           name: 'created',
//           type: 'date',
//           required: true,
//         },
//         {
//           name: 'processed',
//           type: 'bool',
//           required: false,
//           options: {
//             default: false,
//           }
//         },
//         {
//           name: 'locationName',
//           type: 'text',
//           required: false,
//         },
//         {
//           name: 'severity',
//           type: 'text',
//           required: false,
//           options: {
//             min: 0,
//             max: 20,
//           }
//         }
//       ]
//     });
    
//     console.log('Schema created successfully!');
//   } catch (error) {
//     console.error('Error creating schema:', error);
//   }
// }



export default pb;