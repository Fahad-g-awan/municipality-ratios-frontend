"use client";

import React, { createContext, useContext } from "react";

const authContext = createContext();

const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

const useProvideAuth = () => {
  return {};
};

export default AuthProvider;
