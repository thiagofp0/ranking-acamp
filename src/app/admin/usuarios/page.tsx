import { getAdmins, createAdminAction, updateAdminAction, deleteAdminAction } from "@/lib/data-actions";
import { getSession } from "@/lib/auth";
import { ShieldAlert, UserPlus, Trash2, Edit2, Check, X } from "lucide-react";
import DeleteAdminButton from "@/components/DeleteAdminButton";

export default async function UsuariosAdminPage() {
  const admins = await getAdmins();
  const session = await getSession();
  const currentUserId = session?.userId;

  const handleCreate = async (formData: FormData) => {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    if (username && password) await createAdminAction(username, password);
  };

  const handleDelete = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    if (id !== currentUserId) {
      await deleteAdminAction(id);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    await updateAdminAction(id, username || undefined, password || undefined);
  };

  return (
    <div className="p-8 space-y-8 bg-white/50 backdrop-blur-sm rounded-xl border border-[#d4af37]">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-[#8b4513]" />
        <h1 className="text-3xl font-bold font-serif text-[#5c4033]">Gerenciar Escribas (Admins)</h1>
      </div>

      {/* Cadastro de Novo Admin */}
      <div className="bg-[#fdf6e3] p-6 rounded-lg border border-[#d4af37]/30 shadow-inner">
        <h2 className="text-xl font-bold font-serif text-[#8b4513] mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Novo Administrador
        </h2>
        <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="username"
            placeholder="Nome de Usuário"
            className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Senha"
            className="px-4 py-2 rounded-md border border-[#d4af37] bg-white focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
            required
          />
          <button
            type="submit"
            className="bg-[#8b4513] text-white font-bold py-2 px-6 rounded-md hover:bg-[#5c4033] transition-all"
          >
            Cadastrar Escriba
          </button>
        </form>
      </div>

      {/* Listagem de Admins */}
      <div className="overflow-hidden rounded-lg border border-[#d4af37]">
        <table className="w-full text-left">
          <thead className="bg-[#8b4513] text-white">
            <tr>
              <th className="px-6 py-3 font-serif italic">Usuário</th>
              <th className="px-6 py-3 font-serif italic">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/30 bg-white/80">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-[#fdf6e3] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[#5c4033] font-medium font-sans">{admin.username}</span>
                  {admin.id === currentUserId && (
                    <span className="ml-2 text-xs bg-[#d4af37] text-[#5c4033] px-2 py-0.5 rounded-full font-bold">VOCÊ</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {/* Botão de Edição (Toggle para simplificar nesta view) */}
                    <div className="group relative">
                      <form action={handleUpdate} className="flex gap-2">
                        <input type="hidden" name="id" value={admin.id} />
                        <input
                          name="username"
                          placeholder="Novo usuário"
                          className="w-32 px-2 py-1 text-sm border border-[#d4af37] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <input
                          name="password"
                          type="password"
                          placeholder="Nova senha"
                          className="w-32 px-2 py-1 text-sm border border-[#d4af37] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <button type="submit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors group-hover:bg-blue-50">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    {/* Botão de Exclusão */}
                    <DeleteAdminButton 
                      id={admin.id} 
                      isCurrentUser={admin.id === currentUserId} 
                      onDelete={handleDelete} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
        <p className="font-bold">Aviso do Templo:</p>
        <p>Para alterar seu próprio usuário ou senha, use os campos de texto ao lado do ícone de edição na sua linha da tabela.</p>
      </div>
    </div>
  );
}
