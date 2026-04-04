import { User } from "@/types/auth";

interface JwtPayload {
  exp?: number;
  email?: string;
  name?: string;
  unique_name?: string;
  role?: string;
  [key: string]: unknown;
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return atob(padded);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = decodeBase64Url(parts[1]);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (typeof payload.exp !== "number") {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function getValidToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    if (token) localStorage.removeItem("token");
    return null;
  }
  return token;
}

export function buildUserFromToken(token: string): User | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = (payload.role || payload[ROLE_CLAIM] || "Customer") as string;
  const email = (payload.email || payload.unique_name || "") as string;
  const name = (payload.name || payload[NAME_CLAIM] || (typeof email === "string" ? email.split("@")[0] : "User")) as string;
  const idStr = (payload.nameid || payload[ID_CLAIM] || "0") as string;
  const profileImageUrl = payload.profileImageUrl as string | undefined;

  return {
    id: parseInt(idStr),
    name,
    email,
    role,
    profileImageUrl
  };
}

export function getStoredAuthState() {
  const token = getValidToken();
  if (!token) {
    return { token: null, user: null, isAuthenticated: false };
  }

  return {
    token,
    user: buildUserFromToken(token),
    isAuthenticated: true,
  };
}
