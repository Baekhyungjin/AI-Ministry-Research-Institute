import 'server-only';

import { Resend } from 'resend';

type NotificationField = {
  label: string;
  value: string | number | undefined;
};

type NotificationInput = {
  subject: string;
  replyTo?: string;
  fields: NotificationField[];
  idempotencyKey?: string;
};

const escapeHtml = (value: string | number) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export async function sendAdminNotification({ subject, replyTo, fields, idempotencyKey }: NotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'not-configured' as const };

  const recipient = process.env.NOTIFICATION_EMAIL?.trim() || 'backhung65@gmail.com';
  const sender = process.env.NOTIFICATION_FROM_EMAIL?.trim() || '목회AI연구소 <onboarding@resend.dev>';
  const rows = fields
    .filter((field) => field.value !== undefined && String(field.value).trim())
    .map((field) => `<tr><th style="padding:10px 14px;text-align:left;border-bottom:1px solid #e4e8ee;color:#526075;white-space:nowrap">${escapeHtml(field.label)}</th><td style="padding:10px 14px;border-bottom:1px solid #e4e8ee;white-space:pre-wrap">${escapeHtml(field.value!)}</td></tr>`)
    .join('');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: sender,
    to: recipient,
    replyTo: replyTo && /^\S+@\S+\.\S+$/.test(replyTo) ? replyTo : undefined,
    subject,
    html: `<div style="font-family:Arial,'Noto Sans KR',sans-serif;color:#122039;line-height:1.65"><h1 style="font-size:22px">${escapeHtml(subject)}</h1><p>목회AI연구소 홈페이지에 새로운 접수가 도착했습니다.</p><table style="border-collapse:collapse;width:100%;max-width:680px">${rows}</table><p style="margin-top:24px;color:#6c7889;font-size:12px">관리자 페이지에서도 접수 상태를 확인할 수 있습니다.</p></div>`,
  }, idempotencyKey ? { idempotencyKey } : undefined);

  if (error) {
    console.error('Admin notification email failed', error);
    return { sent: false, reason: 'send-failed' as const };
  }
  return { sent: true as const };
}
