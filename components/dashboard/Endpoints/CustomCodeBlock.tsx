"use client";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

type CustomCodeBlock = {
  codeString: string;
  language: string;
  showLineNumbers: boolean;
  href?: string;
};

export default function CustomCodeBlock({
  codeString,
  language,
  showLineNumbers,
  href = "",
}: CustomCodeBlock) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeContent = () => (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={atomOneLight}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );

  return (
    <div className="border-gray-500 max-w-4xl mx-auto dark:bg-gray-800 font-jet h-full max-h-[400px] overflow-y-scroll">
      {href ? (
        <Link href={href}>
          <CodeContent />
        </Link>
      ) : (
        <CodeContent />
      )}
    </div>
  );
}
