// src/services/authService.ts
export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

function getToken(): string {
  // clé harmonisée
  return localStorage.getItem("access_token") || "";
}

async function apiRequest(
  endpoint: string,
  method: string,
  body?: Record<string, any>
) {
  const token = getToken();
  if (!token) throw new Error("Vous devez être authentifié.");

  const resp = await fetch(`http://localhost:8000/auth/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors de l’opération");
  }
  return resp.json();
}

export async function updateProfile(payload: UpdateProfilePayload) {
  return apiRequest("update-profile", "PUT", payload);
}

export async function changePassword(payload: ChangePasswordPayload) {
  return apiRequest("change-password", "PUT", payload);
}
