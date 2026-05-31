"use client";

import { LinkIcon } from "./icons";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const url = `https://romasbrief.com/article/${slug}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <div className="mb-10 flex flex-wrap items-center gap-3 py-4 border-t border-b border-neutral-100">
      <span className="text-xs text-neutral-500 font-medium">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        𝕏 Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        in LinkedIn
      </a>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        <LinkIcon size={14} /> Copy link
      </button>
    </div>
  );
}
