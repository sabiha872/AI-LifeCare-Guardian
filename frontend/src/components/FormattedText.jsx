import React from "react";

// Helper to format inline bold text (**text**)
function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="formatted-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function FormattedText({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let currentList = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      return;
    }

    // Headings (### Title, ## Title, # Title)
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const headingText = trimmed.replace(/^#+\s*/, "");
      blocks.push({ type: "heading", text: headingText, id: index });
      return;
    }

    // Bullet points (- item, * item, • item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const itemText = trimmed.replace(/^[-*•]\s*/, "");
      if (!currentList || currentList.type !== "unordered-list") {
        if (currentList) blocks.push(currentList);
        currentList = { type: "unordered-list", items: [], id: index };
      }
      currentList.items.push(itemText);
      return;
    }

    // Numbered points (1. item, 2. item)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const itemText = numberedMatch[2];
      if (!currentList || currentList.type !== "ordered-list") {
        if (currentList) blocks.push(currentList);
        currentList = { type: "ordered-list", items: [], id: index };
      }
      currentList.items.push(itemText);
      return;
    }

    // Callout / Disclaimer headers (e.g. IMPORTANT:, NOTE:, SAFETY RULES:)
    const upper = trimmed.toUpperCase();
    if (
      upper.startsWith("IMPORTANT:") ||
      upper.startsWith("NOTE:") ||
      upper.startsWith("SAFETY RULES:") ||
      upper.startsWith("DISCLAIMER:")
    ) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: "callout", text: trimmed, id: index });
      return;
    }

    // Regular paragraph
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({ type: "paragraph", text: trimmed, id: index });
  });

  if (currentList) {
    blocks.push(currentList);
  }

  return (
    <div className="formatted-content">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h4 key={idx} className="formatted-heading">
              {renderInline(block.text)}
            </h4>
          );
        }
        if (block.type === "unordered-list") {
          return (
            <ul key={idx} className="formatted-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered-list") {
          return (
            <ol key={idx} className="formatted-ordered-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === "callout") {
          return (
            <div key={idx} className="formatted-callout">
              <span className="callout-icon">💡</span>
              <div>{renderInline(block.text)}</div>
            </div>
          );
        }
        return (
          <p key={idx} className="formatted-paragraph">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
