import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export type UsuarioRoleUi =
  | "Administrador"
  | "Comprador/Responsável"
  | "Requisitante/Visualizador"
  | "Gestor de Contratos";

export type UsuarioStatusUi = "Ativo" | "Inativo";

export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  perfil: UsuarioRoleUi;
  status: UsuarioStatusUi;
  ultimoAcesso: string;
  departamento: string;
}

export interface CreatedUsuarioResult {
  usuario: UsuarioItem;
  temporaryPassword: string;
}

export interface GetUsuariosOptions {
  searchTerm?: string;
  orderBy?: "full_name" | "email" | "role" | "status" | "department" | "last_access";
  ascending?: boolean;
}

export interface UpdateUsuarioPayload {
  perfil?: UsuarioRoleUi;
  status?: UsuarioStatusUi;
  departamento?: string;
}

export interface CreateUsuarioPayload {
  id?: string;
  nome: string;
  email: string;
  perfil: UsuarioRoleUi;
  departamento: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserProfile | null;
  status: UsuarioStatusUi | null;
  department: string | null;
  last_access: string | null;
  perfil: UserProfile | null;
  nome: string | null;
  ativo: boolean | null;
  departamento: string | null;
  ultimo_acesso: string | null;
}

interface AdminCreateUserRpcRow {
  profile_id: string;
  profile_email: string | null;
  profile_full_name: string | null;
  profile_role: UserProfile | null;
  profile_status: UsuarioStatusUi | null;
  profile_department: string | null;
  profile_last_access: string | null;
  temporary_password: string;
}

function getErrorMessage(error: { message?: string | null; details?: string | null }) {
  return error.details || error.message || "Ocorreu um erro ao processar a solicitação";
}

function formatLastAccess(value?: string | null) {
  if (!value) return "Nunca acessou";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR");
}

export function mapRoleDbToUi(role?: UserProfile | null): UsuarioRoleUi {
  switch (role) {
    case "admin":
      return "Administrador";
    case "comprador":
      return "Comprador/Responsável";
    case "gestora":
      return "Gestor de Contratos";
    case "requisitante":
    default:
      return "Requisitante/Visualizador";
  }
}

export function mapRoleUiToDb(role: UsuarioRoleUi): UserProfile {
  switch (role) {
    case "Administrador":
      return "admin";
    case "Comprador/Responsável":
      return "comprador";
    case "Gestor de Contratos":
      return "gestora";
    case "Requisitante/Visualizador":
    default:
      return "requisitante";
  }
}

function mapProfileRow(row: ProfileRow): UsuarioItem {
  const role = row.role ?? row.perfil ?? "requisitante";
  const status = row.status ?? (row.ativo === false ? "Inativo" : "Ativo");

  return {
    id: row.id,
    nome: row.full_name ?? row.nome ?? "Sem nome",
    email: row.email ?? "Sem e-mail",
    perfil: mapRoleDbToUi(role),
    status,
    ultimoAcesso: formatLastAccess(row.last_access ?? row.ultimo_acesso),
    departamento: row.department ?? row.departamento ?? "Não informado",
  };
}

async function getCurrentActor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário autenticado não encontrado.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, perfil")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return {
    id: user.id,
    role: (data.role ?? data.perfil ?? "requisitante") as UserProfile,
  };
}

export async function getUsuarios(options: GetUsuariosOptions = {}): Promise<UsuarioItem[]> {
  const supabase = createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, role, status, department, last_access, perfil, nome, ativo, departamento, ultimo_acesso");

  if (options.searchTerm?.trim()) {
    const search = options.searchTerm.trim();
    query = query.or(
      `full_name.ilike.%${search}%,nome.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%,departamento.ilike.%${search}%`
    );
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true, nullsFirst: false });
  } else {
    query = query.order("full_name", { ascending: true, nullsFirst: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return ((data ?? []) as ProfileRow[]).map(mapProfileRow);
}

export async function updateUsuario(id: string, data: UpdateUsuarioPayload): Promise<UsuarioItem> {
  const supabase = createClient();
  const actor = await getCurrentActor();

  if (actor.role !== "admin") {
    throw new Error("Apenas administradores podem atualizar usuários.");
  }

  const nextRole = data.perfil ? mapRoleUiToDb(data.perfil) : undefined;
  if (actor.id === id && nextRole === "admin" && actor.role !== "admin") {
    throw new Error("Não é permitido promover o próprio usuário para administrador.");
  }

  const payload: Record<string, unknown> = {};

  if (data.perfil) {
    payload.role = nextRole;
    payload.perfil = nextRole;
  }

  if (data.status) {
    payload.status = data.status;
    payload.ativo = data.status === "Ativo";
  }

  if (typeof data.departamento === "string") {
    payload.department = data.departamento;
    payload.departamento = data.departamento;
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select("id, email, full_name, role, status, department, last_access, perfil, nome, ativo, departamento, ultimo_acesso")
    .single();

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  return mapProfileRow(updated as ProfileRow);
}

export async function criarUsuario(data: CreateUsuarioPayload): Promise<CreatedUsuarioResult> {
  const supabase = createClient();
  const actor = await getCurrentActor();

  if (actor.role !== "admin") {
    throw new Error("Apenas administradores podem criar usuários.");
  }

  const role = mapRoleUiToDb(data.perfil);

  const { data: created, error } = await supabase.rpc("admin_create_user_profile", {
    p_email: data.email,
    p_full_name: data.nome,
    p_role: role,
    p_department: data.departamento,
    p_status: "Ativo",
  });

  if (error) {
    throw new Error(getErrorMessage(error));
  }

  const row = (created as AdminCreateUserRpcRow[] | null)?.[0];

  if (!row) {
    throw new Error("A criação do usuário não retornou dados válidos.");
  }

  return {
    usuario: mapProfileRow({
      id: row.profile_id,
      email: row.profile_email,
      full_name: row.profile_full_name,
      role: row.profile_role,
      status: row.profile_status,
      department: row.profile_department,
      last_access: row.profile_last_access,
      perfil: row.profile_role,
      nome: row.profile_full_name,
      ativo: row.profile_status === "Ativo",
      departamento: row.profile_department,
      ultimo_acesso: row.profile_last_access,
    }),
    temporaryPassword: row.temporary_password,
  };
}

export async function deleteUsuario(id: string): Promise<void> {
  const supabase = createClient();
  const actor = await getCurrentActor();

  if (actor.role !== "admin") {
    throw new Error("Apenas administradores podem inativar usuários.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: "Inativo", ativo: false })
    .eq("id", id);

  if (error) {
    throw new Error(getErrorMessage(error));
  }
}
