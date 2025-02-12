'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import * as Tooltip from '@radix-ui/react-tooltip';

interface MarkdownRendererProps {
  content: string;
  papers?: any[]; // 可选的论文数据，用于显示标题和滚动
}

const CitationPopup = ({ children, papers = [], ...props }: any) => {
  const paperId = props['data-paper-id'];
  if (!paperId) {
    console.warn('Citation missing paper ID:', children);
    return <span className="text-red-500">[引用错误]</span>;
  }

  const paper = papers?.find((p: any) => p.paperId === paperId);
  
  const handleClick = React.useCallback(() => {
    const element = document.getElementById(`paper-${paperId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('bg-green-50');
      setTimeout(() => element.classList.remove('bg-green-50'), 2000);
    }
  }, [paperId]);

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <sup className="inline-flex items-center">
            <cite 
              className="text-[10px] text-[#087B7B] cursor-pointer hover:text-[#065e5e]" 
              style={{ fontStyle: 'normal' }}
              data-paper-id={paperId}
              onClick={handleClick}
            >
              {children}
            </cite>
          </sup>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="bg-white px-4 py-2 rounded-lg shadow-lg border text-sm max-w-md z-50"
            sideOffset={5}
          >
            {paper ? paper.title : '点击查看引用详情'} (ID: {paperId})
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, papers = [] }) => {
  if (!content) {
    return null;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          cite: (props) => <CitationPopup {...props} papers={papers} />,
          p: ({ children }) => <p className="mb-4">{children}</p>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-6">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-5">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 