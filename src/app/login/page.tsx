"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-client"; // Vamos criar um helper client-side
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3] font-serif">
      <div className="max-w-md w-full p-8 bg-white border-2 border-[#d4af37] rounded-lg shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="w-16 h-16 text-[#8b4513] mb-4" />
          <h1 className="text-3xl font-bold text-[#5c4033] text-center italic">
            Acesso do Escriba
          </h1>
          <p className="text-sm text-[#8b4513] mt-2 italic">
            "Buscar-me-eis e me achareis, quando me buscardes de todo o vosso coração."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#5c4033]">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-[#d4af37] rounded-md text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5c4033]">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-[#d4af37] rounded-md text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#8b4513] hover:bg-[#5c4033] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
