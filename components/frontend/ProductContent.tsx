"use client";
import React from "react";
import parse from "html-react-parser";
export default function ProductContent({
  codeString,
}: {
  codeString: string | null | undefined;
}) {
  return <div className="parsed-html">{parse(`${codeString}`)}</div>;
}
