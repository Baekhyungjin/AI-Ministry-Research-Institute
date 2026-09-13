'use client';

export default function BusinessCardActions() {
  return <div className="card-actions"><a className="btn btn-white" href="/downloads/baekhyungjin-ministry-ai.vcf" download>연락처 저장</a><a className="btn btn-secondary partner-outline" href="/downloads/baekhyungjin-business-card.svg" download>명함 이미지 다운로드</a><button className="btn btn-secondary partner-outline" onClick={() => window.print()}>인쇄하기</button></div>;
}
