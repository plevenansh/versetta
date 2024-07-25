import axios from 'axios';

export async function analyzeComments(comments: string[]) {
  const prompt = `Analyze the following YouTube comments and provide insights:`;
  const fullPrompt = `${prompt}\n\n${comments.join('\n')}`;

  const response = await axios.post('https://api.perplexity.ai/chat/completions', {
    model: 'mixtral-8x7b-instruct',
    messages: [{ role: 'user', content: fullPrompt }],
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}
