import { NextResponse } from 'next/server';

const SEMANTIC_SCHOLAR = 'https://api.semanticscholar.org/graph/v1/paper/search';

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 用于控制请求频率的简单限流
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 每次请求之间至少间隔0.3秒

async function fetchWithThrottle(url: string) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    
    lastRequestTime = Date.now();
    
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (response.status === 429) {
        await delay(5000); // 如果遇到429，等待5秒后重试
        return fetchWithThrottle(url);
    }
    
    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }
    
    return response;
}

interface SemanticScholarItem {
    paperId: string;
    title: string;
    authors: { name: string }[];
    abstract?: string;
    year?: number;
    venue?: string;
    s2FieldsOfStudy?: { category: string }[];
    publicationTypes?: string[];
    openAccessPdf?: { url: string };
}

interface SearchParams {
    query: string;
    offset: number;
    limit: number;
}

interface SearchResult {
    articles: Array<{
        id: string;
        title: string;
        authors: string[];
        abstract: string;
        year: number | string;
        journal: string;
        keywords: string[];
        publicationType: string;
        openAccessPdf: string | null;
    }>;
    hasMore: boolean;
    nextOffset?: number;
}

export const dynamic = 'force-dynamic';  // 确保路由是动态的
export const runtime = 'edge';  // 可选：使用边缘运行时以获得更好的性能

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const offset = parseInt(searchParams.get('offset') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        const fields = 'paperId,title,authors,year,abstract,venue,publicationTypes,openAccessPdf,s2FieldsOfStudy';
        const response = await fetchWithThrottle(
            `${SEMANTIC_SCHOLAR}?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}&fields=${fields}`
        );

        const data = await response.json();
        
        // 添加调试日志
        console.log('First paper data:', JSON.stringify(data.data[0], null, 2));

        const articles = data.data.map((item: SemanticScholarItem) => ({
            id: item.paperId,
            title: item.title,
            authors: item.authors.map(author => author.name),
            abstract: item.abstract,
            year: item.year || 'N/A',
            journal: item.venue || 'Unknown',
            keywords: item.s2FieldsOfStudy?.map(field => field.category) || [],
            publicationType: item.publicationTypes?.[0] || 'Unknown',
            openAccessPdf: item.openAccessPdf?.url || null,
            semanticUrl: `https://www.semanticscholar.org/paper/${item.paperId}`
        }));

        return NextResponse.json({
            articles,
            hasMore: data.next !== null,
            nextOffset: offset + limit,
        });

    } catch (error) {
        console.error('Error in semantic search API:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

