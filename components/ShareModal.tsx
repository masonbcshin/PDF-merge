'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Share2, Copy, Check, Gift, Twitter } from 'lucide-react';
import {
  addPremiumCredit,
  getPremiumCredits,
  getMaxCredits,
} from '@/lib/shareTracking';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 카카오 SDK 타입 (간략화)
declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: object) => void;
      };
    };
  }
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [credits, setCredits] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCredits(getPremiumCredits());
      setShareSuccess(false);
      setCopied(false);
    }
  }, [isOpen]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = 'PDF Merger Pro - 무료로 PDF 파일을 병합하세요! 파일이 서버에 업로드되지 않아 안전합니다.';

  // 공유 성공 처리
  const handleShareSuccess = useCallback(() => {
    addPremiumCredit();
    setCredits(getPremiumCredits());
    setShareSuccess(true);
  }, []);

  // 링크 복사
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleShareSuccess();
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 폴백: 구형 방식
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleShareSuccess();
    }
  }, [shareUrl, handleShareSuccess]);

  // 카카오톡 공유
  const handleKakaoShare = useCallback(() => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        if (kakaoKey) {
          window.Kakao.init(kakaoKey);
        } else {
          // 카카오 SDK 키가 없으면 링크 복사로 대체
          handleCopyLink();
          return;
        }
      }

      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: 'PDF Merger Pro',
          description: shareText,
          imageUrl: `${shareUrl}og-image.png`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: 'PDF 병합하기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
      handleShareSuccess();
    } else {
      // 카카오 SDK가 없으면 링크 복사로 대체
      handleCopyLink();
    }
  }, [shareUrl, shareText, handleCopyLink, handleShareSuccess]);

  // 트위터 공유
  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    handleShareSuccess();
  }, [shareUrl, shareText, handleShareSuccess]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Gift className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-xl font-bold">
                공유하고 보상 받기
              </h2>
              <p className="text-white/80 text-sm">
                친구에게 공유하면 프리미엄 기능을 사용할 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* 성공 메시지 */}
        {shareSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">공유 감사합니다! 크레딧이 적립되었습니다.</span>
            </div>
          </div>
        )}

        {/* 크레딧 현황 */}
        <div className="px-6 pt-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">보유 크레딧</span>
              <span className="font-bold text-lg text-blue-600">
                {credits} / {getMaxCredits()}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${(credits / getMaxCredits()) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              크레딧 1개로 대용량 파일(100MB 이상) 병합 가능
            </p>
          </div>
        </div>

        {/* 공유 버튼들 */}
        <div className="p-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">
            공유 방법 선택
          </p>

          {/* 카카오톡 공유 */}
          <button
            onClick={handleKakaoShare}
            className="w-full flex items-center gap-3 p-4 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] rounded-xl font-medium transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.17 4.59 6.53-.15.54-.58 1.95-.66 2.25-.11.38.14.37.29.27.12-.08 1.87-1.23 2.63-1.73.7.1 1.42.15 2.15.15 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
              </svg>
            </div>
            <span>카카오톡으로 공유</span>
          </button>

          {/* 트위터 공유 */}
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center gap-3 p-4 bg-[#1DA1F2] hover:bg-[#0C8BD9] text-white rounded-xl font-medium transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Twitter className="w-6 h-6" aria-hidden="true" />
            </div>
            <span>트위터로 공유</span>
          </button>

          {/* 링크 복사 */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {copied ? (
                <Check className="w-6 h-6 text-green-500" aria-hidden="true" />
              ) : (
                <Copy className="w-6 h-6" aria-hidden="true" />
              )}
            </div>
            <span>{copied ? '복사되었습니다!' : '링크 복사하기'}</span>
          </button>
        </div>

        {/* 안내 */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400 text-center">
            공유 시 1 크레딧이 적립됩니다 (최대 {getMaxCredits()}개)
          </p>
        </div>
      </div>
    </div>
  );
}
