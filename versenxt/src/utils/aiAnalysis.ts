// import axios from 'axios';

// export async function analyzeComments(comments: string[] | undefined, prompt: string) {
//   if (!comments || !Array.isArray(comments) || comments.length === 0) {
//     return {
//       general: "No comments to analyze or invalid comments data.",
//       topComments: [],
//       contentIdeas: []
//     };
//   }

//   const fullPrompt = `${prompt}\n\nComments:\n${comments.slice(0, 50).join('\n')}

// Please provide:
// 1. A general analysis of the comments (max 200 words)
// 2. The top 5 most engaging or insightful comments (bullet points)
// 3. 3 content ideas based on the comments (numbered list)
// 4. Key metrics: sentiment score (0-100), engagement level (low/medium/high), main topics (comma-separated list)`;

//   try {
//     console.log("Sending request to Perplexity API");
//     const response = await axios.post('https://api.perplexity.ai/chat/completions', {
//       model: 'llama-3.1-8b-instruct',
//       messages: [{ role: 'user', content: fullPrompt }],
//     }, {
//       headers: {
//         'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log("Received response from Perplexity API:", JSON.stringify(response.data, null, 2));

//     if (!response.data?.choices?.[0]?.message?.content) {
//       throw new Error('Unexpected API response structure');
//     }

//     const content = response.data.choices[0].message.content;
//     console.log("API response content:", content);

//     // Parse the content
//     const sections = content.split(/\d+\.\s/).filter(Boolean);
    
//     return {
//       general: sections[0].trim(),
//       topComments: sections[1].split('\n').filter(Boolean).map(comment => comment.replace(/^-\s*/, '')),
//       contentIdeas: sections[2].split('\n').filter(Boolean),
//       metrics: parseMetrics(sections[3])
//     };
//   } catch (error) {
//     console.error('Error analyzing comments:', error);
//     if (error instanceof Error) {
//       console.error('Error stack:', error.stack);
//     }
//     throw new Error('Failed to analyze comments: ' + (error as Error).message);
//   }
// }

// function parseMetrics(metricsString: string) {
//   const sentimentMatch = metricsString.match(/sentiment score: (\d+)/i);
//   const engagementMatch = metricsString.match(/engagement level: (low|medium|high)/i);
//   const topicsMatch = metricsString.match(/main topics: (.+)/i);

//   return {
//     sentimentScore: sentimentMatch ? parseInt(sentimentMatch[1]) : null,
//     engagementLevel: engagementMatch ? engagementMatch[1].toLowerCase() : null,
//     mainTopics: topicsMatch ? topicsMatch[1].split(',').map(topic => topic.trim()) : []
//   };
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