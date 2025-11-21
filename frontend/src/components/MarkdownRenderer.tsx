import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  // Pre-process content to convert @mentions to markdown links
  const processedContent = content.replace(
    /(@\w+)/g, 
    (match) => `[${match}](/profile/${match.substring(1)})`
  );

  return (
    <div className={`prose prose-invert max-w-none 
      prose-a:text-neon-blue prose-a:no-underline hover:prose-a:underline 
      prose-headings:text-white 
      prose-strong:text-white 
      prose-code:text-neon-pink prose-code:bg-space-900 prose-code:px-1 prose-code:rounded
      prose-pre:bg-space-900 prose-pre:border prose-pre:border-white/10
      prose-blockquote:border-l-neon-blue prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-4
      prose-img:rounded-lg prose-img:border prose-img:border-white/10
      ${className}`}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const href = props.href || '';
            const isInternal = href.startsWith('/');
            
            if (isInternal) {
              return (
                <Link href={href} className="text-neon-blue hover:underline">
                  {props.children}
                </Link>
              );
            }
            return (
              <a 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-neon-blue hover:underline"
                {...props} 
              />
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
