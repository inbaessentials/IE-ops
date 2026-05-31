import { InbaConfig } from "./inba";
import { FashionConfig } from "./fashion";
import { OnlineCourseConfig } from "./online-course";
import { WholesaleConfig } from "./wholesale";
import { GymServicesConfig } from "./gym-services";
import { OtherConfig } from "./other";

export interface SidebarItem {
  name: string;
  label: string;
}

export interface DashboardCard {
  key: string;
  title: string;
}

export interface ChartLabel {
  key: string;
  label: string;
}

export interface ModuleConfig {
  key: string;
  displayName: string;
  singularDisplayName: string;
  description: string;
  emptyStateText: string;
}

export interface HelperText {
  key: string;
  text: string;
}

export interface PlatformConfig {
  sidebar: SidebarItem[];
  dashboardCards: DashboardCard[];
  chartLabels: ChartLabel[];
  modules: ModuleConfig[];
  sampleData: {
    products: any[];
    orders: any[];
    expenses: any[];
  };
  helperText: HelperText[];
}

export type BusinessPlatform = "inba" | "fashion" | "online-course" | "wholesale" | "gym-services" | "other";

export const platformConfigs: Record<BusinessPlatform, PlatformConfig> = {
  inba: InbaConfig,
  fashion: FashionConfig,
  "online-course": OnlineCourseConfig,
  wholesale: WholesaleConfig,
  "gym-services": GymServicesConfig,
  other: OtherConfig,
};

export const getPlatformConfig = (platform: string): PlatformConfig => {
  const normalized = (platform || "inba").toLowerCase() as BusinessPlatform;
  return platformConfigs[normalized] || InbaConfig;
};

// UI Selector options
export const platformOptions = [
  { value: "inba", label: "Inba Essentials" },
  { value: "fashion", label: "Fashion" },
  { value: "online-course", label: "Online Course" },
  { value: "wholesale", label: "Wholesale" },
  { value: "gym-services", label: "Gym Services" },
  { value: "other", label: "Other" }
];
