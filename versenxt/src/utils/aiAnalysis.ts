// // const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
// import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
// const client = new OpenAIClient(
//   process.env.AZURE_OPENAI_ENDPOINT!,
//   new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!)
// );

// export async function analyzeComments(comments: string[] | undefined, prompt: string) {
//   if (!comments || !Array.isArray(comments) || comments.length === 0) {
//     return {
//       general: "No comments to analyze or invalid comments data.",
//       topComments: [],
//       contentIdeas: [],
//       metrics: {}
//     };
//   }

//   const fullPrompt = `${prompt}\n\nComments:\n${comments.slice(0, 100).join('\n')}

// Please provide a JSON response with the following structure not a single word before or after JSON, only strictly JSON:
// {
//   "general": "A general analysis of the comments",
//   "topComments": ["Comment 1", "Comment 2", ...],
//   "contentIdeas": ["Idea 1", "Idea 2", ...],
//   "metrics": {
//     "sentimentScore": 0-100,
//     "engagementLevel": "low/medium/high",
//     "mainTopics": ["Topic 1", "Topic 2", ...]
//   }
// }`;

//   try {
//     const response = await client.getChatCompletions(
//       process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
//       [{ role: "user", content: fullPrompt }],
//       { maxTokens: 800 }
//     );

//     if (!response.choices[0].message?.content) {
//       throw new Error('Unexpected API response structure');
//     }

//     const content = response.choices[0].message.content;
//     console.log("API response content:", content);

//     // Parse the JSON response
//     const analysisData = JSON.parse(content);

//     return analysisData;
//   } catch (error) {
//     console.error('Error analyzing comments:', error);
//     if (error instanceof Error) {
//       console.error('Error stack:', error.stack);
//     }
//     throw new Error('Failed to analyze comments: ' + (error as Error).message);
//   }
// }


import axios from 'axios';

export async function analyzeComments(comments: string[] | undefined, prompt: string) {
  if (!comments || !Array.isArray(comments) || comments.length === 0) {
    return {
      general: "No comments to analyze or invalid comments data.",
      topComments: [],
      contentIdeas: [],
      metrics: {}
    };
  }

  const fullPrompt = `${prompt}\n\nComments:\n${comments.slice(0, 100).join('\n')}

Please provide a JSON response with the following structure not a single word before or after JSON, only strictly JSON:
{
  "general": "A general analysis of the comments",
  "topComments": ["Comment 1", "Comment 2", ...],
  "contentIdeas": ["Idea 1", "Idea 2", ...],
  "metrics": {
    "sentimentScore": 0-100,
    "engagementLevel": "low/medium/high",
    "mainTopics": ["Topic 1", "Topic 2", ...]
  }
}`;

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

    // Parse the JSON response
    const analysisData = JSON.parse(content);

    return analysisData;
  } catch (error) {
    console.error('Error analyzing comments:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to analyze comments: ' + (error as Error).message);
  }
}