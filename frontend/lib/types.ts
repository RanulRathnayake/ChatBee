export type User = {
  id: string;
  email: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: User;            
  conversationId: string;
};

export type ConversationParticipant = {
  id: string;               
  userId: string;           
  conversationId: string;
  joinedAt: string;
  user: User;               
};

export type Conversation = {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage?: Message | null;
};