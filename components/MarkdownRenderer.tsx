import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A simple regex-based markdown parser for the specific needs of this app
// Supports: Headers (h3), Bold, Lists, Blockquotes, Paragraphs
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
      {lines.map((line, index) => {
        const key = `line-${index}`;

        // H3
        if (line.startsWith('### ')) {
          return <h3 key={key} className="text-xl font-bold text-accent mt-6 mb-2">{line.replace('### ', '')}</h3>;
        }

        // List items
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const text = line.trim().substring(2);
            return (
                <div key={key} className="flex items-start ml-4">
                    <span className="text-accent mr-2">•</span>
                    <span dangerouslySetInnerHTML={{ __html: parseInline(text) }}></span>
                </div>
            );
        }
        
        // Numbered list (Simple detection)
        if (/^\d+\.\s/.test(line.trim())) {
             const text = line.trim().replace(/^\d+\.\s/, '');
             const num = line.trim().match(/^\d+/)?.[0];
             return (
                <div key={key} className="flex items-start ml-4">
                    <span className="text-accent mr-2 font-mono text-sm pt-1">{num}.</span>
                    <span dangerouslySetInnerHTML={{ __html: parseInline(text) }}></span>
                </div>
             );
        }

        // Blockquote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={key} className="border-l-4 border-accent pl-4 italic text-gray-400 my-4 bg-white/5 py-2 rounded-r">
              {line.replace('> ', '')}
            </blockquote>
          );
        }

        // Empty lines
        if (line.trim() === '') {
          return <div key={key} className="h-2" />;
        }

        // Paragraphs
        return <p key={key} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />;
      })}
    </div>
  );
};

// Helper to handle bold and italic inline
function parseInline(text: string): string {
  let parsed = text;
  // Bold
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-100 font-semibold">$1</strong>');
  // Italic
  parsed = parsed.replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>');
  return parsed;
}

export default MarkdownRenderer;