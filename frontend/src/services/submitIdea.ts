import axios from 'axios';

interface SubmitIdeaPayload {
  conversation_id: number;
  answer: string;
}

export const submitIdea = async ({ conversation_id, answer }: SubmitIdeaPayload) => {
  const response = await axios.post('/api/submit-answer/', {
    conversation_id,
    answer,
  });
  return response.data;
};
