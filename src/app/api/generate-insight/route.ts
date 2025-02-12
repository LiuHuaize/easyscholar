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
    
    // 为每篇论文准备完整信息
    const paperInfos = papers.map((paper: any, index: number) => {
      const citation = generateAPA(paper);
      return `${index + 1}. ${paper.title}\n引用: ${citation}\n摘要: ${paper.abstract || '无摘要'}`;
    }).join('\n\n');
    
    const response = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{
        role: "system",
        content: `你是一个研究助理，需要根据用户的研究问题和相关论文信息生成综合洞察。请按以下格式分析：

1. 开篇概述研究领域的整体情况
2. 分点列出关键发现（每个观点需注明来源论文的引用格式）
3. 最后总结研究趋势和潜在矛盾

引用格式：[作者姓氏 et al., 年份] 或 [作者姓氏, 年份]（当只有一位作者时）`
      }, {
        role: "user",
        content: `研究问题：${question}\n\n相关论文信息：\n${paperInfos}`
      }],
      temperature: 0.7,
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