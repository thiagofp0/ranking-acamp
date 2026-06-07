"use server";

import { cookies } from "next/headers";
import { encrypt } from "./session";
import { getDatabase } from "./database/sqlite";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(username: string, pass: string) {
  const db = getDatabase();
  let admin = await db.getAdminByUsername(username);

  if (admin && admin.passwordHash && await bcrypt.compare(pass, admin.passwordHash)) {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({ 
      userId: admin.id, 
      username: admin.username, 
      expires 
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });
    return true;
  }
  return false;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
  redirect("/login");
}
