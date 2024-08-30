// utils/aiAnalysis.ts
import axios from 'axios';

export async function analyzeComments(comments: string[] | undefined, prompt: string) {
  if (!comments || !Array.isArray(comments) || comments.length === 0) {
    return {
      general: "No comments to analyze or invalid comments data.",
      topComments: [],
      contentIdeas: []
    };
  }

  const fullPrompt = `${prompt}\n\nComments:\n${comments.slice(0, 50).join('\n')}

Please provide:
1. A general analysis of the comments
2. The top 5 most engaging or insightful comments
3. 3 content ideas based on the comments`;

  try {
    console.log("Sending request to Perplexity API");
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: fullPrompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Received response from Perplexity API:", JSON.stringify(response.data, null, 2));

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Unexpected API response structure');
    }

    const content = response.data.choices[0].message.content;
    console.log("API response content:", content);

    // Parse the content without relying on specific formatting
    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
const general = lines.slice(0, lines.findIndex((line: string) => line.includes('Top 5')) || lines.length).join('\n');
const topComments = lines.slice(
  lines.findIndex((line: string) => line.includes('Top 5')) + 1,
  lines.findIndex((line: string) => line.includes('Content ideas')) || lines.length
);
const contentIdeas = lines.slice(lines.findIndex((line: string) => line.includes('Content ideas')) + 1);

// Ensure the return type matches the expected shape
return {
  general: general || "General analysis not provided",
  topComments: topComments.length > 0 ? topComments : ["No top comments provided"],
  contentIdeas: contentIdeas.length > 0 ? contentIdeas : ["No content ideas provided"]
};
  } catch (error) {
    console.error('Error analyzing comments:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to analyze comments: ' + (error as Error).message);
  }
}