export type PlanTier = "starter" | "growth" | "business";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  public_key: string;
  industry: string | null;
  description: string | null;
  ai_tone: string;
  ai_instructions: string | null;
  working_hours: string | null;
  plan_tier: PlanTier;
  conversations_included: number;
  created_at: string;
  updated_at: string;
};

export type KnowledgeItemType = "product" | "faq" | "policy";

export type KnowledgeItem = {
  id: string;
  business_id: string;
  type: KnowledgeItemType;
  title: string;
  content: string;
  price: number | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ConversationStatus = "open" | "handed_off" | "resolved";

export type CustomerConversation = {
  id: string;
  business_id: string;
  customer_ref: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
};

export type MessageSender = "customer" | "ai" | "owner";

export type CustomerMessage = {
  id: string;
  conversation_id: string;
  business_id: string;
  sender: MessageSender;
  content: string;
  created_at: string;
};

export type UsageCounter = {
  business_id: string;
  period_month: string;
  conversations_count: number;
  messages_count: number;
};
