import React from 'react';
import CodeBlock from './CodeBlock';

const MarkdownRenderer = ({ content }) => {
  // Simple markdown parser (in production, use a library like react-markdown)
  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">$1</h1>');
    
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br />');
    
    return text;
  };
  
  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;