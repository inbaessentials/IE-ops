"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { getPlatformConfig, PlatformConfig, BusinessPlatform } from "@/config";

interface PlatformContextProps {
  platform: BusinessPlatform;
  config: PlatformConfig;
  setPlatform: (newPlatform: BusinessPlatform) => Promise<boolean>;
  loading: boolean;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatformState] = useState<BusinessPlatform>("inba");
  const [loading, setLoading] = useState(true);

  const config = getPlatformConfig(platform);

  useEffect(() => {
    const initPlatform = async () => {
      // 1. Instantly read from LocalStorage for immediate UI paint
      const localPlat = localStorage.getItem("business_platform") as BusinessPlatform;
      if (localPlat) {
        setPlatformState(localPlat);
      }

      // 2. Try fetching from Supabase settings
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("business_platform")
          .eq("id", "default")
          .single();

        if (data && data.business_platform && !error) {
          const cloudPlat = data.business_platform as BusinessPlatform;
          setPlatformState(cloudPlat);
          localStorage.setItem("business_platform", cloudPlat);
        }
      } catch (err) {
        console.warn("Supabase database platform check skipped or failed (fallback to localStorage active):", err);
      } finally {
        setLoading(false);
      }
    };

    initPlatform();
  }, []);

  const setPlatform = async (newPlatform: BusinessPlatform): Promise<boolean> => {
    setLoading(true);
    try {
      // Always save to LocalStorage immediately
      localStorage.setItem("business_platform", newPlatform);
      setPlatformState(newPlatform);

      // Attempt to save to Supabase settings table
      const { error } = await supabase
        .from("settings")
        .update({ business_platform: newPlatform })
        .eq("id", "default");

      if (error) {
        console.warn("Failed to update cloud database platform setting, saved locally instead:", error.message);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Failed to update platform:", err);
      setLoading(false);
      return false;
    }
  };

  return (
    <PlatformContext.Provider value={{ platform, config, setPlatform, loading }}>
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
