import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="markdown-body text-gray-100 text-base leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            // Generate a somewhat unique index for the copy button state based on content length + approximate position
            const codeIndex = codeString.length; 

            return !inline && match ? (
              <div className="relative group rounded-md overflow-hidden my-4 border border-gray-700 bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-mono lowercase">{match[1]}</span>
                  <button
                    onClick={() => handleCopy(codeString, codeIndex)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === codeIndex ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-gray-200" {...props}>
                {children}
              </code>
            );
          },
          h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>,
          h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>,
          h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4 text-white">{children}</h3>,
          a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
          ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-400 my-4">{children}</blockquote>,
          table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg">{children}</table></div>,
          thead: ({children}) => <thead className="bg-gray-800">{children}</thead>,
          tbody: ({children}) => <tbody className="divide-y divide-gray-700 bg-gray-900/50">{children}</tbody>,
          tr: ({children}) => <tr>{children}</tr>,
          th: ({children}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-700 last:border-r-0">{children}</th>,
          td: ({children}) => <td className="px-4 py-3 text-sm text-gray-300 border-r border-gray-700 last:border-r-0 whitespace-pre-wrap">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;