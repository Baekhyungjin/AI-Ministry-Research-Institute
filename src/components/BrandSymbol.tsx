import Image from 'next/image';

export default function BrandSymbol({ className = '' }: { className?: string }) {
  return (
    <Image
      className={className}
      src="/images/brand/ministry-ai-mark-transparent.png"
      alt="목회AI연구소 AI 십자가 로고"
      width={160}
      height={110}
      sizes="(max-width: 600px) 58px, 68px"
    />
  );
}
