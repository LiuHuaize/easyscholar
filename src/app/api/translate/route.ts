import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AIHUBMIX_API_KEY,
  baseURL: 'https://aihubmix.com/v1'
});

export async function POST(request: Request) {
  try {
    const { text, targetLang = 'zh' } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: '未提供需要翻译的文本' },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{
        role: "system",
        content: `你是一个专业的翻译助手。请将以下文本翻译成${targetLang === 'zh' ? '中文' : '英文'}，保持专业性和准确性。
                  翻译时要注意以下几点：
                  1. 保持学术用语的专业性
                  2. 保持原文的语气和风格
                  3. 确保翻译后的文本通顺易读
                  4. 对于专业术语，可以在括号中保留英文原文`
      }, {
        role: "user",
        content: text
      }],
      temperature: 0.3,
      max_tokens: 1000
    });

    return NextResponse.json({ 
      translation: response.choices[0].message.content,
      originalText: text
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: '翻译失败' },
      { status: 500 }
    );
  }
} 