import React, { createContext, useContext, useEffect, useState } from "react";
import { getApiBase } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 🔄 VERIFY TOKEN ON APP LOAD */
  useEffect(() => {
    const verifyAuth = async () => {
      const access = localStorage.getItem("access");

      if (!access) {
        setIsStaff(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${getApiBase()}/me/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setUser(data.username);
        setIsStaff(!!data.is_staff);
        setIsAuthenticated(true);
      } catch (error) {
        logout(); // 🔥 auto logout if token invalid
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /* 🔐 LOGIN */
  const login = async (username, password) => {
    try {
      const res = await fetch(`${getApiBase()}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setIsAuthenticated(true);
      setUser(username);

      try {
        const meRes = await fetch(`${getApiBase()}/me/`, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setIsStaff(!!me.is_staff);
        } else {
          setIsStaff(false);
        }
      } catch {
        setIsStaff(false);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  /* 🔄 REFRESH TOKEN (OPTIONAL – FUTURE USE) */
  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;

    try {
      const res = await fetch(`${getApiBase()}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      localStorage.setItem("access", data.access);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  /* 🚪 LOGOUT (✅ THIS IS WHAT YOU ASKED FOR) */
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setIsAuthenticated(false);
    setUser(null);
    setIsStaff(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isStaff,
        user,
        login,
        logout,          // ✅ exposed here
        refreshToken,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



// import React, { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();
// const API = "http://127.0.0.1:8000/api";

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* 🔄 VERIFY TOKEN ON APP LOAD */
//   useEffect(() => {
//     const verifyAuth = async () => {
//       const access = localStorage.getItem("access");
//       if (!access) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch(`${API}/me/`, {
//           headers: {
//             Authorization: `Bearer ${access}`,
//           },
//         });

//         if (!res.ok) throw new Error("Invalid token");

//         const data = await res.json();
//         setUser(data.username);
//         setIsAuthenticated(true);
//       } catch {
//         logout();
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyAuth();
//   }, []);

//   /* 🔐 LOGIN */
//   const login = async (username, password) => {
//     const res = await fetch(`${API}/token/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });

//     if (!res.ok) return false;

//     const data = await res.json();
//     localStorage.setItem("access", data.access);
//     localStorage.setItem("refresh", data.refresh);

//     setIsAuthenticated(true);
//     setUser(username);
//     return true;
//   };

//   /* 🔄 REFRESH TOKEN */
//   const refreshToken = async () => {
//     const refresh = localStorage.getItem("refresh");
//     if (!refresh) return false;

//     const res = await fetch(`${API}/token/refresh/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refresh }),
//     });

//     if (!res.ok) {
//       logout();
//       return false;
//     }

//     const data = await res.json();
//     localStorage.setItem("access", data.access);
//     return true;
//   };

//   /* 🚪 LOGOUT */
//   const logout = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         login,
//         logout,
//         refreshToken,
//         loading,
//       }}
//     >
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
