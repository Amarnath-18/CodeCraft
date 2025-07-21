import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

const CodeBlock = ({ className, children }) => {
  const language = className?.replace("language-", "") || "javascript";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  const decodeEscapedString = (input) => {
    try {
      return JSON.parse(`"${input.replace(/"/g, '\\"')}"`);
    } catch {
      return input.replace(/\\n/g, "\n"); // Fallback
    }
  };

  return (
    <div className="relative group">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 bg-gray-700 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers
        wrapLongLines={true}
        customStyle={{
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          padding: "1rem",
          backgroundColor: "#282c34",
        }}
      >
        {decodeEscapedString(String(children))}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
