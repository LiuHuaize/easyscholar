import { useState } from 'react';
import { Quote, Copy, Check, X } from 'lucide-react';

interface CitationButtonProps {
  paperId: string;
}

const CITATION_FORMATS = [
  { id: 'bibtex', name: 'BibTeX' },
  { id: 'apa', name: 'APA' },
  { id: 'mla', name: 'MLA' },
  { id: 'chicago', name: 'Chicago' }
];

export default function CitationButton({ paperId }: CitationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('bibtex');
  const [citation, setCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCitation = async (format: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/citation?paperId=${paperId}&format=${format}`);
      const data = await response.json();
      if (data.citation) {
        setCitation(data.citation);
      }
    } catch (error) {
      console.error('Failed to fetch citation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = async (format: string) => {
    setSelectedFormat(format);
    await fetchCitation(format);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(true);
          fetchCitation(selectedFormat);
        }}
        className="flex items-center gap-1.5 text-[#087B7B] hover:text-[#065e5e] transition-colors"
      >
        <Quote className="w-4 h-4" />
        <span className="text-sm">Cite</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4">
            {/* 弹出框标题 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Citation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 引用格式选择 */}
            <div className="px-6 py-4">
              <div className="flex gap-2 mb-4">
                {CITATION_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatChange(format.id)}
                    className={
                      selectedFormat === format.id
                        ? "px-3 py-1.5 text-sm rounded-md transition-colors bg-[#087B7B] text-white"
                        : "px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }
                  >
                    {format.name}
                  </button>
                ))}
              </div>

              {/* 引用内容 */}
              <div className="relative">
                <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg font-mono text-sm text-gray-600">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-[120px]">
                      <div className="w-5 h-5 border-2 border-[#087B7B] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    citation
                  )}
                </div>

                {/* 复制按钮 */}
                <button
                  onClick={handleCopy}
                  disabled={isLoading || !citation}
                  className={
                    copied
                      ? "absolute top-2 right-2 p-1.5 rounded-md transition-colors bg-green-50 text-green-600"
                      : "absolute top-2 right-2 p-1.5 rounded-md transition-colors bg-white/80 text-gray-500 hover:text-[#087B7B] hover:bg-white"
                  }
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 