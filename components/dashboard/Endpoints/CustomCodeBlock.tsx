"use client";
import { CopyBlock, dracula, github, atomOneLight } from "react-code-blocks";

import React from "react";
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
  return (
    <div className="border-gray-500 max-w-4xl mx-auto dark:bg-gray-800 font-jet h-full max-h-[400px] overflow-y-scroll">
      {href ? (
        <Link href={href}>
          <CopyBlock
            text={codeString}
            language={language}
            showLineNumbers={showLineNumbers}
            theme={atomOneLight}
            codeBlock
          />
        </Link>
      ) : (
        <CopyBlock
          text={codeString}
          language={language}
          showLineNumbers={showLineNumbers}
          theme={atomOneLight}
          codeBlock
        />
      )}
    </div>
  );
}
