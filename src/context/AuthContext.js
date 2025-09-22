

// import React, { createContext, useState, useEffect, useContext } from "react";

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userData = localStorage.getItem("userData");

//     if (token && userData) {
//       const parsedUser = JSON.parse(userData);
//       setUser({
//         token,
//         name: parsedUser.name,
//         role: parsedUser.role,
//         machineId: parsedUser.machineId,
//       });
//     }

//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     // Save token and full user data including machineId
//     localStorage.setItem("token", userData.token);
//     localStorage.setItem(
//       "userData",
//       JSON.stringify({
//         name: userData.name,
//         role: userData.role,
//         machineId: userData.machineId, // Save machineId
//       })
//     );

//     setUser({
//       token: userData.token,
//       name: userData.name,
//       role: userData.role,
//       machineId: userData.machineId,
//     });
//   };

//   const logout = () => {
//   setUser(null);
//   localStorage.removeItem("user"); // if you persist user
//   localStorage.removeItem("token");
// };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect, useContext, useMemo } from "react";

const STORAGE_TOKEN = "token";
const STORAGE_USER = "userData";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from storage on first mount
  useEffect(() => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN);
      const raw = localStorage.getItem(STORAGE_USER);
      if (token && raw) {
        const parsed = JSON.parse(raw);
        setUser({
          token,
          name: parsed.name ?? "",
          role: parsed.role ?? "",
          machineId: parsed.machineId ?? parsed.machine_id ?? null,
        });
      }
    } catch {
      // corrupted storage; clear it
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  // Normalize backend payload and persist
  const login = (u) => {
    // Accept either machineId or machine_id from backend
    const normalized = {
      token: u.token,
      name: u.name,
      role: u.role,
      machineId: u.machineId ?? u.machine_id ?? null,
    };

    localStorage.setItem(STORAGE_TOKEN, normalized.token);
    localStorage.setItem(
      STORAGE_USER,
      JSON.stringify({
        name: normalized.name,
        role: normalized.role,
        machineId: normalized.machineId,
      })
    );

    setUser(normalized);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER); // <-- was "user" before; fixed
  };

  const isAdmin = user?.role?.toLowerCase?.() === "admin";

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
