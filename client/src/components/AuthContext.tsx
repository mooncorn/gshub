import axios, { AxiosError, AxiosResponse } from "axios";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, user: UserData) => void;
  logout: () => void;
}

export interface GetUserResponseData {
  User: {
    Id: string;
    Email: string;
    Picture: string;
    Name: string;
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("jwtToken");

    try {
      const res = await axios.get<any, AxiosResponse<GetUserResponseData>>(
        "http://localhost:8080/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      login(token!, {
        id: res.data.User.Id,
        name: res.data.User.Name,
        email: res.data.User.Email,
        picture: res.data.User.Picture,
      });
    } catch (e) {
      if (e instanceof AxiosError) {
        console.log("user not logged in or token invalid");
        logout();
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string, user: UserData) => {
    localStorage.setItem("jwtToken", token);
    setIsAuthenticated(true);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
