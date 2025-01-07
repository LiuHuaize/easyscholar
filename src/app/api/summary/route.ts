import { OpenAI } from 'openai';
import { headers } from 'next/headers';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

export async function POST(request: Request) {
  try {
    // 获取客户端信息用于区分请求来源
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? 'unknown';
    const clientIp = headersList.get('x-forwarded-for') ?? 'unknown';

    const { papers } = await request.json();

    if (!papers || !Array.isArray(papers)) {
      return new Response(JSON.stringify({ error: 'Papers array is required' }), {
        status: 400,
      });
    }

    // 限制单次请求的论文数量
    if (papers.length > 10) {
      return new Response(JSON.stringify({ 
        error: 'Too many papers in single request. Maximum is 10.' 
      }), { status: 400 });
    }

    const summaryPromises = papers.map(async (paper) => {
      if (!paper.abstract) {
        return { id: paper.paperId, summary: null };
      }

      try {
        const response = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Summarize academic paper abstracts in one concise, natural fluent sentence (maximum 200 characters).
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

        const summary = response.choices[0].message.content ?? '';

        return {
          id: paper.paperId,
          summary
        };
      } catch (error) {
        console.error(`Summary generation failed for paper ${paper.paperId}:`, error);
        return {
          id: paper.paperId,
          summary: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // 使用 Promise.allSettled 确保部分失败不影响整体
    const results = await Promise.allSettled(summaryPromises);
    const summaries = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        id: papers[index].paperId,
        summary: null,
        error: 'Failed to generate summary'
      };
    });

    // 记录请求信息
    console.log(`Summary request processed for ${papers.length} papers from ${clientIp} (${userAgent})`);

    return new Response(JSON.stringify({ 
      summaries,
      status: 'success'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'  // 禁用缓存
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