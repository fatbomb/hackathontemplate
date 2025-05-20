// lib/getUser.ts
import { cookies } from "next/headers";
import { getPocketBase } from "./pocketbase";

export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ No need to await here, it's sync!
  const cookieHeader = cookieStore.toString(); // ✅ safe now
  const pb = getPocketBase(cookieHeader);

  if (!pb.authStore.isValid) return null;

  try {
    await pb.collection("users").authRefresh();
    return pb.authStore.model;
  } catch (e) {
    return null;
  }
}
