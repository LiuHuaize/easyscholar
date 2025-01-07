import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

export async function POST(request: Request) {
  try {
    const { papers } = await request.json();

    if (!papers || !Array.isArray(papers)) {
      return new Response(JSON.stringify({ error: 'Papers array is required' }), {
        status: 400,
      });
    }

    const summaryPromises = papers.map(async (paper) => {
      if (!paper.abstract) {
        return { id: paper.paperId, summary: null };
      }

      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Summarize academic paper abstracts in one concise, naturalfluent sentence (maximum 200 characters).
Focus on the key methodology and main finding only. Be direct, specific and friendly.`
          },
          {
            role: "user",
            content: `Please provide a summary (max 200 chars):\n\n${paper.abstract}`
          }
        ],
        temperature: 0.3,
        max_tokens: 280,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return {
        id: paper.paperId,
        summary: response.choices[0].message.content
      };
    });

    const summaries = await Promise.all(summaryPromises);

    return new Response(JSON.stringify({ 
      summaries,
      status: 'success'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Summarization failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate summaries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 