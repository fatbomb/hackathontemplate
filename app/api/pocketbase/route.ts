import { getPocketBase } from "@/lib/pocketbase";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { action, data } = await request.json();
        const pb = await getPocketBase(request.headers.get('cookie') || '');

        switch (action) {
            case 'isAuthenticated':
                return NextResponse.json( pb.authStore.isValid );
            case 'getChat':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                const chatId = data.chatId;
                return NextResponse.json( await pb.collection('chats').getOne(chatId) );
            case 'getCurrentUser':
                if (pb.authStore.isValid) {
                    await pb.collection('users').authRefresh();
                    return NextResponse.json(pb.authStore.model);
                }
                return NextResponse.json(null);

            case 'login':
                const { email, password } = data;
                const authData = await pb.collection('users').authWithPassword(email, password);
                return NextResponse.json(authData.record, {
                    headers: {
                        'Set-Cookie': pb.authStore.exportToCookie({ httpOnly: true })
                    }
                });

            case 'register':
                const { email: regEmail, password: regPassword, passwordConfirm, name } = data;
                const record = await pb.collection('users').create({
                    email: regEmail,
                    password: regPassword,
                    passwordConfirm,
                    name,
                });
                return NextResponse.json(record);

            case 'logout':
                pb.authStore.clear();
                return NextResponse.json(null, {
                    headers: {
                        'Set-Cookie': pb.authStore.exportToCookie({ httpOnly: true })
                    }
                });

            case 'createChat':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                const chat = await pb.collection('chats').create({
                    title: data.title,
                    user: pb.authStore.model?.id,
                    messages: []
                });
                return NextResponse.json(chat);

            case 'getUserChats':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                const chats = await pb.collection('chats').getFullList({
                    filter: `user = "${pb.authStore.model?.id}"`,
                    sort: '-updated'
                });
                return NextResponse.json(chats);

            case 'saveMessage':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                const existingChat = await pb.collection('chats').getOne(data.chatId);
                const updatedChat = await pb.collection('chats').update(data.chatId, {
                    messages: [...(existingChat.messages || []), {
                        content: data.content,
                        role: data.role,
                        timestamp: new Date().toISOString()
                    }]
                });
                return NextResponse.json(updatedChat);

            case 'deleteChat':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                await pb.collection('chats').delete(data.chatId);
                return NextResponse.json({ success: true });

            case 'updateChatTitle':
                if (!pb.authStore.isValid) throw new Error('Not authenticated');
                const updated = await pb.collection('chats').update(data.chatId, {
                    title: data.newTitle
                });
                return NextResponse.json(updated);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'An error occurred' },
            { status: error.status || 500 }
        );
    }
}