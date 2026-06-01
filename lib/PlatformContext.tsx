"use client";

import React, { createContext, useContext } from "react";
import { InbaConfig } from "@/config/inba";
import { PlatformConfig, BusinessPlatform } from "@/config";

interface PlatformContextProps {
  platform: BusinessPlatform;
  config: PlatformConfig;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PlatformContext.Provider value={{ platform: "inba", config: InbaConfig }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
};
