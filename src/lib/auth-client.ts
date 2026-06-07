import { loginAction } from "./actions";

export async function login(username: string, pass: string) {
  return await loginAction(username, pass);
}
