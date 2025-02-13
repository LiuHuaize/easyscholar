import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateAPA } from '@/lib/citationUtils';

const client = new OpenAI({
  apiKey: process.env.VOLC_API_KEY || '0deb2718-7709-451c-8af3-53c737babead',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3'
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
      model: "ep-20250213235903-c2gxm",
      messages: [{
        role: "system",
        content: `You are a research assistant who needs to generate comprehensive insights based on the user's research questions and related paper information.
最后输出用中文吧
遵守这些规则

需要根据用户的研究问题和相关论文信息生成综合洞察，

然后分点big tilte， subtilte 列出关键发现（每个观点需注明来源论文的引用格式）

Citation Rules (This is crucial):
   - Each point must include citations
   - Citation format examples:
     Single citation: This research found...<cite data-paper-id="ACTUAL_PAPER_ID">[1]</cite>
     Multiple citations: Studies show<cite data-paper-id="ID1">[1]</cite><cite data-paper-id="ID2">[2]</cite>
   - cite tags must be complete with data-paper-id attribute
   - Numbers must match the paper list order

4. Summary:
   Summarize main findings in one paragraph.最后一段不用cite

Format example:
Overview....
## Main Findings
Finding One
Research shows<cite data-paper-id="abc123">[1]</cite> in this field...
Finding Two
Multiple studies<cite data-paper-id="def456">[2]</cite><cite data-paper-id="ghi789">[3]</cite> confirm...

Note: Ensure each cite tag is properly closed and data-paper-id uses the actual paper ID provided.`
      }, {
        role: "user",
        content: `中文回答我吧：Research Question: ${question}\n\nPaper Information:\n${paperInfos}`
      }],
      temperature: 0.7,
      max_tokens: 2600
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