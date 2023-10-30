import { useChat } from 'ai/react';
import { type FormEvent } from 'react';
import { useAuth } from 'util/auth';

export default function StreamPage() {
  const auth = useAuth();
  const { messages, handleSubmit, input, handleInputChange } = useChat({
    api: '/api/openai/stream',
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(e, {
      options: {
        body: {
          messages: [{ content: input, role: 'user' }],
          userId: auth.user?.id ?? 'hello',
        },
      },
    });
  };

  return (
    <div className='w-full max-w-xl'>
      <form onSubmit={onSubmit}>
        <label htmlFor='input'>Prompt</label>
        <input
          name='prompt'
          value={input}
          onChange={handleInputChange}
          id='input'
        />
        <button type='submit'>Submit</button>
        {messages.map((message, i) => (
          <div key={i}>{message.content}</div>
        ))}
      </form>
    </div>
  );
}
