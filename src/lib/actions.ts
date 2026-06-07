"use server";

import { cookies } from "next/headers";
import { encrypt } from "./auth";

export async function loginAction(username: string, pass: string) {
  // Simplificado para o desafio
  if (username === "admin" && pass === "jeremias2913") {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({ username, expires });

    (await cookies()).set("session", session, { expires, httpOnly: true });
    return true;
  }
  return false;
}

export async function logoutAction() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}
