import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secretKey = "jeremias-29-13-ranking-acampamento-secret-key-2024";
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload extends JWTPayload {
  userId: string;
  username: string;
  expires: Date;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return null;
  }
}
