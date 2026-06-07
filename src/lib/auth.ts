import { cookies } from "next/headers";
import { getDatabase } from "./database/sqlite";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "./session";

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const db = getDatabase();
  let admin = await db.getAdminByUsername(username);

  if (admin && await bcrypt.compare(password, admin.passwordHash)) {
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const session = await encrypt({ userId: admin.id, username: admin.username, expires });

    (await cookies()).set("session", session, { expires, httpOnly: true });
    return true;
  }

  return false;
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}
