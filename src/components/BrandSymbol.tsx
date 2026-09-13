import Image from 'next/image';

export default function BrandSymbol({ className = '' }: { className?: string }) {
  return (
    <Image
      className={className}
      src="/images/brand/ministry-ai-official-mark-v2.png"
      alt="목회AI연구소 AI 십자가 로고"
      width={96}
      height={96}
      sizes="(max-width: 600px) 52px, 60px"
    />
  );
}
