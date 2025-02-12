import { NextResponse } from 'next/server';

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1';

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 用于控制请求频率的简单限流
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 每次请求之间至少间隔1秒

async function fetchWithThrottle(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'EasyScholar/1.0',
    }
  });
  
  if (response.status === 429) {
    await delay(2000); // 如果遇到429，等待2秒后重试
    return fetchWithThrottle(url);
  }
  
  return response;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paperId');
    const format = searchParams.get('format') || 'bibtex'; // 默认使用 BibTeX 格式

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    // 获取论文详细信息
    const response = await fetchWithThrottle(
      `${SEMANTIC_SCHOLAR_API}/paper/${paperId}?fields=title,authors,venue,year,publicationDate`
    );
    
    if (!response.ok) {
      console.error('API Response:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch paper details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // 根据请求的格式返回相应的引用格式
    let citation = '';
    switch (format.toLowerCase()) {
      case 'bibtex':
        citation = generateBibTeX(data);
        break;
      case 'apa':
        citation = generateAPA(data);
        break;
      case 'mla':
        citation = generateMLA(data);
        break;
      case 'chicago':
        citation = generateChicago(data);
        break;
      default:
        citation = generateBibTeX(data);
    }

    return NextResponse.json({ citation });
  } catch (error) {
    console.error('Citation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate citation' },
      { status: 500 }
    );
  }
}

// 生成 BibTeX 格式
function generateBibTeX(paper: any) {
  const authors = paper.authors?.map((author: any) => author.name).join(' and ') || '';
  const year = paper.year || paper.publicationDate?.substring(0, 4) || 'n.d.';
  const title = paper.title || '';
  const venue = paper.venue || '';
  const id = paper.paperId || Math.random().toString(36).substring(7);

  return `@article{${id},
  title={${title}},
  author={${authors}},
  journal={${venue}},
  year={${year}}
}`;
}

// 生成 APA 格式
function generateAPA(paper: any) {
  const authors = formatAuthorsAPA(paper.authors || []);
  const year = paper.year || paper.publicationDate?.substring(0, 4) || 'n.d.';
  const title = paper.title || '';
  const venue = paper.venue || '';

  return `${authors} (${year}). ${title}. ${venue}.`;
}

// 生成 MLA 格式
function generateMLA(paper: any) {
  const authors = formatAuthorsMLA(paper.authors || []);
  const title = paper.title || '';
  const venue = paper.venue || '';
  const year = paper.year || paper.publicationDate?.substring(0, 4) || 'n.d.';

  return `${authors}. "${title}." ${venue}, ${year}.`;
}

// 生成 Chicago 格式
function generateChicago(paper: any) {
  const authors = formatAuthorsChicago(paper.authors || []);
  const title = paper.title || '';
  const venue = paper.venue || '';
  const year = paper.year || paper.publicationDate?.substring(0, 4) || 'n.d.';

  return `${authors}. "${title}." ${venue} (${year}).`;
}

// 辅助函数：格式化作者名字 (APA)
function formatAuthorsAPA(authors: any[]) {
  if (!authors || authors.length === 0) return '';
  
  if (authors.length === 1) {
    return authors[0].name;
  } else if (authors.length === 2) {
    return `${authors[0].name} & ${authors[1].name}`;
  } else {
    return `${authors[0].name} et al.`;
  }
}

// 辅助函数：格式化作者名字 (MLA)
function formatAuthorsMLA(authors: any[]) {
  if (!authors || authors.length === 0) return '';
  
  if (authors.length === 1) {
    return authors[0].name;
  } else if (authors.length === 2) {
    return `${authors[0].name}, and ${authors[1].name}`;
  } else {
    return `${authors[0].name}, et al.`;
  }
}

// 辅助函数：格式化作者名字 (Chicago)
function formatAuthorsChicago(authors: any[]) {
  if (!authors || authors.length === 0) return '';
  
  if (authors.length === 1) {
    return authors[0].name;
  } else if (authors.length === 2) {
    return `${authors[0].name} and ${authors[1].name}`;
  } else {
    return `${authors[0].name} et al.`;
  }
} 