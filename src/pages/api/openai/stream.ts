import { OpenAIStream, StreamingTextResponse } from 'ai';
import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
} from 'openai-edge';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export type OpenAIStreamRequestBody = {
  messages: ChatCompletionRequestMessage[];
  userId: string;
};

export default async function handler(req: Request, res: Response) {
  console.log('requesting /api/openai/stream');

  const { messages, userId }: OpenAIStreamRequestBody = await req.json();
  console.log({ messages, userId });

  // TODO: uncomment when supabase work again
  if (!messages || !userId) {
    return new Response('Missing messages, userId.', { status: 400 });
  }
  if (!messages) {
    return new Response('Missing messages, userId.', { status: 400 });
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
