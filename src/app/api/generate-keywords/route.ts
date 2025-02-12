import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AIHUBMIX_API_KEY,
  baseURL: 'https://aihubmix.com/v1'
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const response = await client.chat.completions.create({
      model: "o3-mini",
      messages: [{
        role: "system",
        content: `你是一个学术搜索专家，根据用户提示生成5个英文论文关键词。只输出逗号分隔的关键词，不要其他内容。
        🔍 文章主题转换成搜索关键词

# 角色：
你是一个世界一流的论文搜索专家，擅长根据科普文章的主题搜索学术论文。

# 背景：
我是一个科普文章作家，每篇科普文章创作都会根据文章主题查询相关论文，再将论文中的内容整理给读者。

# 任务：
我将告诉你我的文章选题，请你根据我的选题帮助我想出适合去各大论文网站上搜索的论文关键词,其中有两到三个关键词必须是和用户提示非常相关，基本一样的。
假如包含特定人物，地点，我们需要在每个关键词后面加上这个人物或者地点。


# 示例：
"
输入：如何科学减肥？
输出：Obesity Management，Diet and Weight Loss，Exercise and Weight Loss，Caloric Intake and Expenditure

输入：如何有效美白？
输出：Skin Whitening，Skin Lightening，Skin Brightening，Hyperpigmentation Treatment，Melanin Inhibition

输入：如何养成好习惯？
输出：Habit Formation，Behavioral Change，Self-Improvement，Goal Setting，Willpower and Self-Control
"
输入：what is the economic future for hongkong
输出：Hong Kong Economy，Hong Kong Economic Development，Hong Kong Economic Policy，Hong Kong Economic Growth，Hong Kong Economic Challenges
# 要求：
除了搜索关键词，请你不要输出任何东西。`
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.7
    });

    const keywords = response.choices[0].message.content?.split(/, ?/).slice(0,5) || [];
    return NextResponse.json({ keywords });
    
  } catch (error) {
    console.error('Generate keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to generate keywords' },
      { status: 500 }
    );
  }
} 