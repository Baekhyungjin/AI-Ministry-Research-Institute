import type { Metadata } from 'next';
import { GptCatalog } from '@/components/ResourceCatalog';

export const metadata: Metadata = { title: '목회 GPTs', description: '목회AI연구소가 공개하는 무료·판매 GPT 도구를 확인하세요.' };
export default function GptsPage() { return <><section className="resource-hero"><div className="container"><span>MINISTRY AI TOOLS</span><h1>목회 현장을 위해 만든<br />GPTs를 공개합니다.</h1><p>무료 도구는 바로 사용하고, 전문 도구는 활용 목적과 제공 범위를 확인한 뒤 신청할 수 있습니다.</p></div></section><section className="page-section"><div className="container"><GptCatalog /></div></section></>; }
