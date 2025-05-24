import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { cookies } from "next/headers";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  try {
    // 1. Create user in PocketBase
    await pb.collection("users").create({
      name,
      email,
      password,
      passwordConfirm: password,
    });

    // 2. Authenticate user right after signup
    const authData = await pb.collection("users").authWithPassword(email, password);

    // 3. Set token cookie for 7 days
    (await
          // 3. Set token cookie for 7 days
          cookies()).set("pb_auth", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // 4. Send verification email
    await pb.collection("users").requestVerification(email);

    return NextResponse.json(
      {
        token: authData.token,
        record: authData.record,
        message: "Account created. Verification email sent.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 400 }
    );
  }
}
