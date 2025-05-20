import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    await pb.collection("users").requestPasswordReset(email);

    return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Password reset failed" },
      { status: 400 }
    );
  }
}
