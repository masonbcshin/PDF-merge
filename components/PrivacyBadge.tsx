'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Shield, Info, X, Check } from 'lucide-react';

/**
 * 프라이버시 안내 배지 컴포넌트
 * 클라이언트 전용 PDF 처리 방식을 설명하는 모달을 포함합니다.
 * 
 * 접근성 권고사항:
 * - 모달이 열릴 때 포커스를 모달 내부로 이동
 * - ESC 키로 모달 닫기
 * - 모달 외부 클릭으로 닫기
 * - focus trap 구현 (Tab 키가 모달 내부에서만 순환)
 */
export default function PrivacyBadge() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // 모달이 열릴 때 포커스 이동
  useEffect(() => {
    if (isModalOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isModalOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, closeModal]);

  // 모달 외부 클릭으로 닫기
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  return (
    <>
      {/* 프라이버시 배지 버튼 */}
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="프라이버시 정보 보기"
      >
        <Shield className="w-4 h-4" aria-hidden="true" />
        <span>100% 브라우저 처리</span>
        <Info className="w-4 h-4 opacity-60" aria-hidden="true" />
      </button>

      {/* 프라이버시 설명 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <h2
                  id="privacy-modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  프라이버시 보호
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="닫기"
              >
                <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
              </button>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-6">
              {/* 핵심 메시지 */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-green-800 font-medium">
                  귀하의 파일은 절대로 서버에 업로드되지 않습니다.
                </p>
                <p className="mt-1 text-green-700 text-sm">
                  모든 PDF 처리가 브라우저 내에서만 이루어집니다.
                </p>
              </div>

              {/* 기술 설명 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">어떻게 작동하나요?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">클라이언트 사이드 처리</p>
                      <p className="text-sm text-gray-600">
                        pdf-lib 라이브러리를 사용하여 브라우저에서 직접 PDF를 처리합니다.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Web Worker 활용</p>
                      <p className="text-sm text-gray-600">
                        별도의 스레드에서 병합 작업을 수행하여 UI가 멈추지 않습니다.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <Check className="w-3 h-3 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">네트워크 요청 없음</p>
                      <p className="text-sm text-gray-600">
                        파일 데이터가 네트워크를 통해 전송되지 않습니다.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 검증 방법 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">직접 확인하기</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li>
                    1. 브라우저 개발자 도구를 엽니다 (F12 또는 Cmd+Option+I)
                  </li>
                  <li>
                    2. &quot;Network&quot; (네트워크) 탭을 선택합니다
                  </li>
                  <li>
                    3. PDF 파일을 업로드하고 병합해 보세요
                  </li>
                  <li>
                    4. 파일 업로드 요청이 없는 것을 확인할 수 있습니다
                  </li>
                </ol>
              </div>
            </div>

            {/* 푸터 */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
