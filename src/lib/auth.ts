interface DecodedToken {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getUserFromToken = () => {
  const token = getToken();

  if (!token) return null;

  const decoded = decodeJWT(token);

  if (!decoded) return null;

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return null;
  }

  return decoded;
};

export const getRole = (): string => {
  const userFromToken = getUserFromToken();

  if (userFromToken?.role) {
    return userFromToken.role.toUpperCase();
  }

  return (localStorage.getItem("role") || "").toUpperCase();
};

export const isAuthenticated = (): boolean => {
  return !!getUserFromToken();
};
