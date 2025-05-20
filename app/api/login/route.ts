import { NextResponse } from "next/server";
import pb from "@/lib/pocketbase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const authData = await pb.collection("users").authWithPassword(email, password);

    // Store token in cookie for 7 days
    (await
      // Store token in cookie for 7 days
      cookies()).set("pb_auth", authData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
      });

    return NextResponse.json(authData); // Return user data
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 401 }
    );
  }
}
