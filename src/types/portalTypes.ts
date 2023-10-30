// Types used general in the portal sections of Deepform.

// Type that defines a message sent from the chatbot to the user.
export interface MessageType {
  message: string;
  sender: 'AI' | 'human';
}
// Type that defines data sent from FollowupQuestions to /api/openai/followup
export interface FollowupPayloadType {
  messages: MessageType[];
  feedbackId: number;
  feedbackTitle: string;
  feedbackDescription: string;
  userId: number;
}

export interface BasicCompletionType {
  messages: MessageType[];
  userId: number;
}
