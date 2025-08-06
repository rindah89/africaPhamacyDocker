"use client";
import React from "react";

export default function QuillEditor({
  label,
  className = "sm:col-span-2",
  value,
  onChange,
}: {
  label: string;
  className: string;
  value: any;
  onChange: any;
}) {
  // Temporary solution: Use a textarea until react-quill is compatible with React 19
  // react-quill v2.0.0 uses deprecated findDOMNode which is not available in React 19
  
  return (
    <div className={className}>
      <label
        htmlFor="content"
        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-50 mb-2"
      >
        {label}
      </label>
      <textarea
        id="content"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 min-h-[300px] resize-y"
        placeholder="Enter product content here..."
        rows={10}
      />
      <p className="mt-2 text-sm text-gray-500">
        Note: Rich text editor temporarily disabled due to React 19 compatibility. Using plain text for now.
      </p>
    </div>
  );
}