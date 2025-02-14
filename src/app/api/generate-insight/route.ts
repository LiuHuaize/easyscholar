import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateAPA } from '@/lib/citationUtils';

const client = new OpenAI({
  apiKey: process.env.VOLC_API_KEY || '0deb2718-7709-451c-8af3-53c737babead',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { question, papers, language = 'en' } = await request.json();
    
    // 验证papers数据
    if (!Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: language === 'zh' ? '未提供有效的论文数据' : 'No valid paper data provided' },
        { status: 400 }
      );
    }

    // 验证每篇论文的paperId
    const invalidPapers = papers.filter((paper: any) => !paper.paperId);
    if (invalidPapers.length > 0) {
      console.warn('Papers missing paperId:', invalidPapers.map((p: any) => p.title));
    }
    
    // 为每篇论文准备完整信息
    const paperInfos = papers.map((paper: any, index: number) => {
      const citation = generateAPA(paper);
      return `${index + 1}. ${paper.title}
ID: ${paper.paperId || (language === 'zh' ? '未知ID' : 'Unknown ID')}
Citation: ${citation}
Abstract: ${paper.abstract || (language === 'zh' ? '无摘要' : 'No abstract')}`;
    }).join('\n\n');

    const systemPrompt = language === 'zh' 
      ? `You are a research assistant who needs to generate comprehensive insights based on the user's research questions and related paper information.
需要根据用户的研究问题和相关论文信息生成综合洞察，用中文输出。

然后分点big tilte， subtilte 希望你可以根据用户的问题整理出逻辑，而不是简单的列出发现（每个观点需注明来源论文的引用格式）

Citation Rules (This is crucial):
   - Each point must include citations
   - Citation format examples:
     Single citation: 研究发现...<cite data-paper-id="ACTUAL_PAPER_ID">[1]</cite>
     Multiple citations: 多项研究表明<cite data-paper-id="ID1">[1]</cite><cite data-paper-id="ID2">[2]</cite>
   - cite tags must be complete with data-paper-id attribute
   - Numbers must match the paper list order

4. Summary:
   最后用一段话总结主要发现（最后一段不用cite）

Format example:
概述....
## 主要发现
发现一
研究表明<cite data-paper-id="abc123">[1]</cite> 在这个领域...
发现二
多项研究<cite data-paper-id="def456">[2]</cite><cite data-paper-id="ghi789">[3]</cite> 证实...`
      : `You are a research assistant who needs to generate comprehensive insights based on the user's research questions and related paper information.
Please generate insights in English based on the user's research question and related paper information.

List key findings with big titles and subtitles (each point must include paper citations)

Citation Rules (This is crucial):
   - Each point must include citations
   - Citation format examples:
     Single citation: This research found...<cite data-paper-id="ACTUAL_PAPER_ID">[1]</cite>
     Multiple citations: Studies show<cite data-paper-id="ID1">[1]</cite><cite data-paper-id="ID2">[2]</cite>
   - cite tags must be complete with data-paper-id attribute
   - Numbers must match the paper list order

4. Summary:
   Summarize main findings in one paragraph (no citations needed in the final paragraph)

Format example:
Overview....
## Main Findings
Finding One
Research shows<cite data-paper-id="abc123">[1]</cite> in this field...
Finding Two
Multiple studies<cite data-paper-id="def456">[2]</cite><cite data-paper-id="ghi789">[3]</cite> confirm...`;

    // 创建一个新的 ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.chat.completions.create({
            model: "ep-20250213235903-c2gxm",
            messages: [{
              role: "system",
              content: systemPrompt
            }, {
              role: "user",
              content: `Research Question: ${question}\n\nPaper Information:\n${paperInfos}`
            }],
            temperature: 0.7,
            max_tokens: 3000,
            stream: true,
          });

          let reasoning_content = "";
          let content = "";
          let isReasoningPhase = true;

          const encoder = new TextEncoder();

          for await (const chunk of response) {
            if (chunk.choices[0]?.delta?.reasoning_content) {
              reasoning_content += chunk.choices[0].delta.reasoning_content;
              // 发送思维链内容
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'reasoning',
                content: chunk.choices[0].delta.reasoning_content
              }) + '\n'));
            } else if (chunk.choices[0]?.delta?.content) {
              // 如果是第一次收到实际内容，发送一个phase change信号
              if (isReasoningPhase) {
                isReasoningPhase = false;
                controller.enqueue(encoder.encode(JSON.stringify({
                  type: 'phase_change',
                  from: 'reasoning',
                  to: 'content'
                }) + '\n'));
              }
              content += chunk.choices[0].delta.content;
              // 发送生成的内容
              controller.enqueue(encoder.encode(JSON.stringify({
                type: 'content',
                content: chunk.choices[0].delta.content
              }) + '\n'));
            }
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Insight generation error:', error);
    const { language = 'en' } = await request.json().catch(() => ({}));
    return NextResponse.json(
      { error: language === 'zh' ? '生成研究洞察失败' : 'Failed to generate research insights' },
      { status: 500 }
    );
  }
} 