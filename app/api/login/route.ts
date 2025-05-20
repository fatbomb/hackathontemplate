// app/login/route.ts (POST handler)
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

  try {
    const authData = await pb.collection("users").authWithPassword(email, password);
    console.log("Auth data:", authData);

    (await cookies()).set("pb_auth", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json(authData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 401 });
  }
}
