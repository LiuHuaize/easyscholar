import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateAPA } from '@/lib/citationUtils';

const client = new OpenAI({
  apiKey: process.env.AIHUBMIX_API_KEY,
  baseURL: 'https://aihubmix.com/v1'
});

export async function POST(request: Request) {
  try {
    const { question, papers } = await request.json();
    
    // 验证papers数据
    if (!Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: '未提供有效的论文数据' },
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
ID: ${paper.paperId || '未知ID'}
引用: ${citation}
摘要: ${paper.abstract || '无摘要'}`;
    }).join('\n\n');
    
    const response = await client.chat.completions.create({
      model: "gemini-2.0-pro-exp-02-05",
      messages: [{
        role: "system",
        content: `You are a research assistant who needs to generate comprehensive insights based on the user's research questions and related paper information.

Please strictly follow this format:

1. Overview:
   Briefly answer the user's question and provide an overall perspective.

2. Key Findings:
   Use Markdown format with level 2 (##) and level 3 (###) headings to organize content.
   List key findings with main titles and subtitles.

3. Citation Rules (This is crucial):
   - Each point must include citations
   - Citation format examples:
     Single citation: This research found...<cite data-paper-id="ACTUAL_PAPER_ID">[1]</cite>
     Multiple citations: Studies show<cite data-paper-id="ID1">[1]</cite><cite data-paper-id="ID2">[2]</cite>
   - cite tags must be complete with data-paper-id attribute
   - Numbers must match the paper list order

4. Summary:
   Summarize main findings in one paragraph.

Format example:
## Main Findings
### Finding One
Research shows<cite data-paper-id="abc123">[1]</cite> in this field...
### Finding Two
Multiple studies<cite data-paper-id="def456">[2]</cite><cite data-paper-id="ghi789">[3]</cite> confirm...

Note: Ensure each cite tag is properly closed and data-paper-id uses the actual paper ID provided.`
      }, {
        role: "user",
        content: `Research Question: ${question}\n\nPaper Information:\n${paperInfos}`
      }],
      temperature: 0.65,
      max_tokens: 2000
    });

    return NextResponse.json({ insight: response.choices[0].message.content });
  } catch (error) {
    console.error('Insight generation error:', error);
    return NextResponse.json(
      { error: '生成研究洞察失败' },
      { status: 500 }
    );
  }
} 