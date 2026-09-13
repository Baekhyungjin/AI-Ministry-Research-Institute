import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAdminNotification } from '@/lib/notification-email';

type SubmissionBody = {
  type?: 'application' | 'partner';
  payload?: Record<string, unknown>;
};

const clean = (value: unknown, maxLength = 240) => String(value ?? '').trim().slice(0, maxLength);
const emailPattern = /^\S+@\S+\.\S+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getKoreanToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export async function POST(request: Request) {
  let body: SubmissionBody;
  try {
    body = await request.json() as SubmissionBody;
  } catch {
    return NextResponse.json({ ok: false, message: '신청 형식을 확인해 주세요.' }, { status: 400 });
  }

  const payload = body.payload ?? {};
  if (clean(payload.website)) return NextResponse.json({ ok: false, message: '신청 내용을 다시 확인해 주세요.' }, { status: 400 });
  if (payload.consent !== true) return NextResponse.json({ ok: false, message: '개인정보 수집·이용 동의가 필요합니다.' }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ ok: false, message: '접수 시스템 연결을 확인하고 있습니다.' }, { status: 503 });

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const name = clean(payload.name, 80);
  const church = clean(payload.church, 120);
  const role = clean(payload.role, 100);
  const phone = clean(payload.phone, 40);
  const email = clean(payload.email, 160).toLowerCase();
  const message = clean(payload.message, 4000);

  if (!name || !phone || !email || !message || !emailPattern.test(email)) {
    return NextResponse.json({ ok: false, message: '성함, 연락처, 이메일과 신청 내용을 확인해 주세요.' }, { status: 400 });
  }

  if (body.type === 'partner') {
    const partnerType = payload.partnerType === 'individual' ? 'individual' : 'church';
    if (partnerType === 'church' && !church) return NextResponse.json({ ok: false, message: '교회·기관명을 입력해 주세요.' }, { status: 400 });
    const { error } = await supabase.from('partner_applications').insert({
      id: `partner-${randomUUID()}`, partner_type: partnerType, name, church, role, phone, email, message,
      status: 'new', consent: true, created_at: new Date().toISOString(),
    });
    if (error) return NextResponse.json({ ok: false, message: '파트너 신청을 저장하지 못했습니다.' }, { status: 500 });

    const notification = await sendAdminNotification({
      subject: `[목회AI연구소] ${partnerType === 'church' ? '파트너 교회' : '개인 파트너'} 신청 - ${name}`,
      replyTo: email,
      fields: [
        { label: '구분', value: partnerType === 'church' ? '파트너 교회' : '개인 파트너' },
        { label: '성함', value: name }, { label: '교회·기관', value: church }, { label: '직분·역할', value: role },
        { label: '연락처', value: phone }, { label: '이메일', value: email }, { label: '신청 내용', value: message },
      ],
    });
    return NextResponse.json({ ok: true, notificationSent: notification.sent }, { status: 201 });
  }

  if (body.type !== 'application') return NextResponse.json({ ok: false, message: '지원하지 않는 신청 유형입니다.' }, { status: 400 });
  const kind = payload.kind === 'lecture' || payload.kind === 'schedule' ? payload.kind : 'inquiry';
  const scheduleId = clean(payload.scheduleId, 160) || null;
  let scheduleTitle = clean(payload.scheduleTitle, 240) || null;
  const requestedDate = clean(payload.requestedDate, 10) || null;

  if (kind === 'lecture' && !requestedDate) {
    return NextResponse.json({ ok: false, message: '달력에서 일정이 없는 희망 날짜를 선택해 주세요.' }, { status: 400 });
  }
  if (kind === 'lecture' && requestedDate) {
    if (!datePattern.test(requestedDate) || requestedDate < getKoreanToday()) {
      return NextResponse.json({ ok: false, message: '오늘 이후의 희망 날짜를 선택해 주세요.' }, { status: 400 });
    }
    const { data: conflicts, error: conflictError } = await supabase.from('schedules').select('id').eq('date', requestedDate).limit(1);
    if (conflictError) return NextResponse.json({ ok: false, message: '일정 중복 여부를 확인하지 못했습니다.' }, { status: 500 });
    if (conflicts?.length) return NextResponse.json({ ok: false, message: '이미 일정이 있는 날짜입니다. 달력에서 다른 날짜를 선택해 주세요.' }, { status: 409 });
  }

  if (kind === 'schedule') {
    if (!scheduleId) return NextResponse.json({ ok: false, message: '신청할 공개 일정을 다시 선택해 주세요.' }, { status: 400 });
    const { data: schedule, error: scheduleError } = await supabase.from('schedules').select('id,title,date,status').eq('id', scheduleId).maybeSingle();
    if (scheduleError || !schedule || schedule.status !== 'open' || schedule.date < getKoreanToday()) {
      return NextResponse.json({ ok: false, message: '현재 신청할 수 없는 일정입니다.' }, { status: 409 });
    }
    scheduleTitle = schedule.title;
  }

  const insertRecord: Record<string, unknown> = {
    id: `application-${randomUUID()}`, kind, name, church, role, phone, email, message,
    schedule_id: scheduleId, schedule_title: scheduleTitle, requested_date: requestedDate,
    status: 'new', consent: true, created_at: new Date().toISOString(),
  };
  let { error } = await supabase.from('applications').insert(insertRecord);
  if (error && requestedDate && (error.code === 'PGRST204' || error.message.includes('requested_date'))) {
    delete insertRecord.requested_date;
    insertRecord.message = `[희망 날짜: ${requestedDate}]\n${message}`;
    ({ error } = await supabase.from('applications').insert(insertRecord));
  }
  if (error) return NextResponse.json({ ok: false, message: '문의 및 신청을 저장하지 못했습니다.' }, { status: 500 });

  const kindLabel = kind === 'lecture' ? '강의·컨설팅 요청' : kind === 'schedule' ? '등록 일정 신청' : '일반·협업 문의';
  const notification = await sendAdminNotification({
    subject: `[목회AI연구소] ${kindLabel} - ${name}`,
    replyTo: email,
    fields: [
      { label: '접수 구분', value: kindLabel }, { label: '성함', value: name }, { label: '교회·기관', value: church },
      { label: '직분·역할', value: role }, { label: '연락처', value: phone }, { label: '이메일', value: email },
      { label: '희망 날짜', value: requestedDate ?? undefined }, { label: '신청 일정', value: scheduleTitle ?? undefined },
      { label: '문의 내용', value: message },
    ],
  });
  return NextResponse.json({ ok: true, notificationSent: notification.sent }, { status: 201 });
}
