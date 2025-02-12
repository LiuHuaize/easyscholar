'use client';

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export default function TestCitation() {
  const testContent = `
## 测试引用功能

这是一个简单的引用测试<cite data-paper-id="test123">[1]</cite>。

这是多重引用的测试<cite data-paper-id="test456">[2]</cite><cite data-paper-id="test789">[3]</cite>。

### 带格式的引用
1. 第一个发现：研究表明<cite data-paper-id="paper001">[4]</cite>
2. 第二个发现：多项研究<cite data-paper-id="paper002">[5]</cite><cite data-paper-id="paper003">[6]</cite>证实...
`;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">引用功能测试</h2>
      <div className="border p-4 rounded-lg bg-white">
        <MarkdownRenderer content={testContent} />
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">原始Markdown:</h3>
        <pre className="whitespace-pre-wrap">{testContent}</pre>
      </div>
    </div>
  );
} 