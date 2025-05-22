import { NextResponse } from "next/server";
import { getPocketBase } from "@/lib/pocketbase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    console.log('Login attempt:', { email, password });
    
    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    const pb = await getPocketBase();

    try {
        const authData = await pb.collection("users").authWithPassword(email, password);
        
        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("pb_auth", pb.authStore.exportToCookie(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
            path: "/*",
        });

        return NextResponse.json({
            user: authData.record,
            token: authData.token
        }, { status: 200 });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || "Invalid email or password" },
            { status: 401 }
        );
    }
}