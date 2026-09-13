'use client';

import { deleteRecord, updateRecord } from '@/lib/repository';
import { seedPartnerApplications, seedReplayAccesses } from '@/lib/seed-data';
import { ApplicationStatus, PartnerApplicationItem, ReplayAccessItem, ReplayPaymentStatus } from '@/lib/types';
import { useRecords } from '@/lib/use-records';

const paymentLabels: Record<ReplayPaymentStatus, string> = {
  pending: '입금 대기',
  confirmed: '입금 확인',
  cancelled: '취소',
};

export default function LeadsAdmin() {
  const { records: partners } = useRecords<PartnerApplicationItem>('partner_applications', seedPartnerApplications);
  const { records: replay } = useRecords<ReplayAccessItem>('replay_accesses', seedReplayAccesses);

  return <div>
    <header className="admin-page-header"><div><span>PARTNERS & REPLAY</span><h1>파트너·다시보기 신청</h1><p>파트너 신청과 다시보기 후원·입금 상태를 확인합니다.</p></div></header>

    <section className="admin-panel leads-section">
      <div className="panel-heading"><div><span>PARTNER REQUESTS</span><h2>파트너 신청</h2></div><b>{partners.length}</b></div>
      {partners.map((item) => <article className="request-card" key={item.id}>
        <div className="request-card-head"><div><span className="badge badge-blue">{item.partnerType === 'church' ? '교회 파트너' : '개인 파트너'}</span><h2>{item.name} <small>{item.role}</small></h2><p>{item.church}</p></div>
          <select value={item.status} onChange={(event) => updateRecord<PartnerApplicationItem>('partner_applications', item.id, { status: event.target.value as ApplicationStatus })}><option value="new">새 접수</option><option value="contacted">연락 완료</option><option value="confirmed">확정</option><option value="closed">종료</option></select>
        </div>
        <p className="request-message">{item.message}</p>
        <div className="request-contact"><a href={`tel:${item.phone}`}>{item.phone}</a><a href={`mailto:${item.email}`}>{item.email}</a><button onClick={() => deleteRecord('partner_applications', item.id)}>삭제</button></div>
      </article>)}
      {!partners.length && <div className="empty-state small">파트너 신청이 없습니다.</div>}
    </section>

    <section className="admin-panel leads-section">
      <div className="panel-heading"><div><span>REPLAY SUPPORT</span><h2>다시보기 후원 신청</h2></div><b>{replay.length}</b></div>
      {replay.map((item) => <article className="request-card replay-support-admin" key={item.id}>
        <div className="request-card-head"><div><span className="badge badge-blue">{paymentLabels[item.paymentStatus ?? 'pending']}</span><h2>{item.name} · {item.church}</h2><p>{item.replayTitle}</p></div>
          <select value={item.paymentStatus ?? 'pending'} onChange={(event) => updateRecord<ReplayAccessItem>('replay_accesses', item.id, { paymentStatus: event.target.value as ReplayPaymentStatus })}><option value="pending">입금 대기</option><option value="confirmed">입금 확인</option><option value="cancelled">취소</option></select>
        </div>
        <dl className="replay-support-admin-detail"><div><dt>입금자명</dt><dd>{item.depositorName || item.name}</dd></div><div><dt>신청 금액</dt><dd>{(item.supportAmount || 10000).toLocaleString('ko-KR')}원</dd></div></dl>
        <div className="request-contact"><a href={`tel:${item.phone}`}>{item.phone}</a><a href={`mailto:${item.email}`}>{item.email}</a><button onClick={() => deleteRecord('replay_accesses', item.id)}>삭제</button></div>
      </article>)}
      {!replay.length && <div className="empty-state small">다시보기 후원 신청이 없습니다.</div>}
    </section>
  </div>;
}
