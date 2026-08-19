export type PlanTier = "starter" | "growth" | "business";

export const PLANS: Record<PlanTier, {
  name: string;
  basePrice: number;
  includedConversations: number;
  overageRate: number;
  description: string;
  wallpaperEnabled: boolean;
  teamEnabled: boolean;
}> = {
  starter: {
    name: "Starter",
    basePrice: 15000,
    includedConversations: 300,
    overageRate: 20,
    description: "For a business just getting going with AI-handled conversations.",
    wallpaperEnabled: false,
    teamEnabled: false,
  },
  growth: {
    name: "Growth",
    basePrice: 45000,
    includedConversations: 1500,
    overageRate: 15,
    description: "For a business with steady, regular customer traffic.",
    wallpaperEnabled: true,
    teamEnabled: true,
  },
  business: {
    name: "Business",
    basePrice: 120000,
    includedConversations: 5000,
    overageRate: 10,
    description: "For high-volume businesses that need room to grow.",
    wallpaperEnabled: true,
    teamEnabled: true,
  },
};

export function currency(amount: number) {
  return `\u20a6${amount.toLocaleString("en-NG")}`;
}
