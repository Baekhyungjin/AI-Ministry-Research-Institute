export default function BrandSymbol({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="목회AI연구소 심볼">
      <rect x="1" y="1" width="62" height="62" rx="15" fill="#f5f6ff" stroke="#dfe4f2" strokeWidth="2" />
      <path d="M9 50 22 14h10l13 36H34l-2.5-8H20L17.5 50H9Zm13.5-17h6.3l-3.1-10.4L22.5 33Z" fill="#e346ca" />
      <path d="M38 14h17v36H44V26.5L38 31V14Z" fill="#2672e8" />
      <path d="M29 29h19v5H29z" fill="white" />
      <path d="M36 22h5v19h-5z" fill="white" />
    </svg>
  );
}
