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
    console.log('Trying to scroll to paper:', paperId);
    console.log('Element found:', element);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-green-50');
      setTimeout(() => element.classList.remove('bg-green-50'), 2000);
    } else {
      console.warn('Paper element not found:', paperId);
    }
  }, [paperId]);

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <sup className="inline-flex items-center">
            <cite 
              className="text-[13px] text-[#087B7B] cursor-pointer hover:text-[#065e5e] font-medium px-1.5 py-0.5 rounded bg-[#F0F9F9] hover:bg-[#E5F2F2] transition-all" 
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
            className="bg-white px-5 py-3 rounded-xl shadow-lg border border-[#E5F2F2] text-sm max-w-md z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={5}
          >
            <div className="flex flex-col gap-1">
              <div className="font-medium text-gray-900">{paper ? paper.title : '点击查看引用详情'}</div>
              {paper && (
                <div className="text-[13px] text-gray-500 flex items-center gap-1">
                  <span>ID:</span>
                  <span className="font-mono text-[12px] bg-gray-50 px-1.5 py-0.5 rounded">{paperId}</span>
                </div>
              )}
            </div>
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