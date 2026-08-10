export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentSnapshot = {
  analytics: boolean;
  marketing: boolean;
};
