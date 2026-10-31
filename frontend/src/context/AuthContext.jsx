import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("leadflow_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check token and fetch user details on initial render
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("leadflow_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data.user);
        localStorage.setItem("leadflow_user", JSON.stringify(data.data.user));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("leadflow_token");
        localStorage.removeItem("leadflow_user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Email + Password Login
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("leadflow_token", data.data.token);
    localStorage.setItem("leadflow_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  // Google One-Click Login
  const loginWithGoogle = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    localStorage.setItem("leadflow_token", data.data.token);
    localStorage.setItem("leadflow_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  // Register
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("leadflow_token", data.data.token);
    localStorage.setItem("leadflow_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("leadflow_token");
    localStorage.removeItem("leadflow_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
