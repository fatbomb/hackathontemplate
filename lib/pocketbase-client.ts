// Client-side wrapper functions that call our server API
export async function pbClientRequest(action: string, data?: object) {
  const response = await fetch('/api/pocketbase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ action, data })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
}

// Convenience functions for common operations
export const getCurrentUser = () => pbClientRequest('getCurrentUser');
export const login = (email: string, password: string) => 
  pbClientRequest('login', { email, password });
export const register = (email: string, password: string, passwordConfirm: string, name: string) =>
  pbClientRequest('register', { email, password, passwordConfirm, name });
export const logout = () => pbClientRequest('logout');
export const createChat = (title: string) => pbClientRequest('createChat', { title });
export const getUserChats = () => pbClientRequest('getUserChats');
export const getChat = (chatId: string) => pbClientRequest('getChat', { chatId });
export const saveMessage = (chatId: string, content: string, role: 'user' | 'bot') =>
  pbClientRequest('saveMessage', { chatId, content, role });
export const deleteChat = (chatId: string) => pbClientRequest('deleteChat', { chatId });
export const updateChatTitle = (chatId: string, newTitle: string) =>
  pbClientRequest('updateChatTitle', { chatId, newTitle });
export const isAuthenticated = () => pbClientRequest('isAuthenticated');