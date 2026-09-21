'use client';

import { useState } from 'react';
import { trackAnalyticsEvent, type ShareChannel } from '@/lib/analytics-client';

type Props = { id: string; title: string; excerpt: string };

export default function ContentShareActions({ id, title, excerpt }: Props) {
  const [message, setMessage] = useState('');

  function record(channel: ShareChannel) {
    void trackAnalyticsEvent({
      eventType: 'share',
      contentType: 'column',
      contentId: id,
      shareChannel: channel,
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage('링크를 복사했습니다.');
      record('copy');
    } catch {
      setMessage('주소창의 링크를 복사해 주세요.');
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, text: excerpt, url: window.location.href });
      setMessage('공유 화면을 열었습니다.');
      record('native');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage('공유하지 못했습니다. 링크 복사를 이용해 주세요.');
    }
  }

  function openShare(channel: Exclude<ShareChannel, 'native' | 'copy'>) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const destinations = {
      naver: `https://share.naver.com/web/shareView?url=${url}&title=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    };
    window.open(destinations[channel], '_blank', 'noopener,noreferrer,width=720,height=640');
    record(channel);
  }

  return <aside className="content-share" aria-label="칼럼 공유">
    <div><strong>이 칼럼이 도움이 되셨나요?</strong><p>필요한 분께 공유해 목회 현장의 대화를 이어가 주세요.</p></div>
    <div className="content-share-actions">
      <button type="button" className="share-primary" onClick={nativeShare}>카카오톡·메신저 공유</button>
      <button type="button" onClick={copyLink}>링크 복사</button>
      <button type="button" onClick={() => openShare('naver')}>네이버</button>
      <button type="button" onClick={() => openShare('facebook')}>페이스북</button>
      <button type="button" onClick={() => openShare('x')}>X</button>
    </div>
    <span className="share-message" aria-live="polite">{message}</span>
  </aside>;
}
