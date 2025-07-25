// import React, { createContext, useState, useEffect, useContext } from "react";

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // On component mount, check if a token exists in localStorage
//     const token = localStorage.getItem("token");
//     const userData = localStorage.getItem("userData");

//     if (token && userData) {
//       // Parse the userData string and set it in state
//       setUser(JSON.parse(userData));
//     }

//     // Mark the loading as complete once the state is updated
//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     // Save token and user details to localStorage
//     localStorage.setItem("token", userData.token);
//     localStorage.setItem("userData", JSON.stringify({
//       name: userData.name,
//       role: userData.role,
//     }));

//     // Set user state with all data
//     setUser({
//       token: userData.token,
//       name: userData.name,
//       role: userData.role,
//     });
//   };

//   const logout = () => {
//     // Clear local storage
//     localStorage.removeItem("token");
//     localStorage.removeItem("userData");

//     // Clear user state
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        token,
        name: parsedUser.name,
        role: parsedUser.role,
        machineId: parsedUser.machineId,
      });
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    // Save token and full user data including machineId
    localStorage.setItem("token", userData.token);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        name: userData.name,
        role: userData.role,
        machineId: userData.machineId, // Save machineId
      })
    );

    setUser({
      token: userData.token,
      name: userData.name,
      role: userData.role,
      machineId: userData.machineId,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

