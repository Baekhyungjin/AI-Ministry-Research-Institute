import type { Metadata } from 'next';
import { AppCatalog } from '@/components/ResourceCatalog';

export const metadata: Metadata = { title: '연구 앱', description: '목회AI연구소의 연구 결과를 실제 웹앱으로 연결합니다.' };
export default function AppsPage() { return <><section className="resource-hero app-hero"><div className="container"><span>RESEARCH INTO PRODUCTS</span><h1>연구 결과를<br />작동하는 앱으로.</h1><p>교회 행정, 성경 연구, 콘텐츠 제작을 위해 직접 만들고 현장에서 검증한 도구입니다.</p></div></section><section className="page-section"><div className="container"><div className="portal-section-head"><div><span className="eyebrow">APP DIRECTORY</span><h2>연구소 앱</h2></div></div><AppCatalog /></div></section></>; }
