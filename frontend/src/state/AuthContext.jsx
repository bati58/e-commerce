import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../utils/apiClient.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mern_user");
    const token = localStorage.getItem("mern_token");
    if (stored && token) {
      setUser(JSON.parse(stored));
      apiClient.setToken(token);
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setUser({ _id: data._id, name: data.name, email: data.email });
    apiClient.setToken(data.token);
    localStorage.setItem(
      "mern_user",
      JSON.stringify({ _id: data._id, name: data.name, email: data.email })
    );
    localStorage.setItem("mern_token", data.token);
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem("mern_user");
    localStorage.removeItem("mern_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

