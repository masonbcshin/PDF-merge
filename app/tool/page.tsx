'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Loader2,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import type { PDFFile, MergeStatus, MergeOptions, Template, WorkerResponse } from '@/types/pdf';
import { getPDFPageCount, downloadBlob, arrayMove, mergePDFs } from '@/lib/pdfUtils';
import { formatFileSize } from '@/lib/pdfUtils';
import { getErrorMessage } from '@/lib/errorHandler';
import { hasPremiumCredit, consumePremiumCredit, getPremiumCredits } from '@/lib/shareTracking';

import PrivacyBadge from '@/components/PrivacyBadge';
import FileUploader from '@/components/FileUploader';
import PDFList from '@/components/PDFList';
import ShareModal from '@/components/ShareModal';
import TemplateSelector from '@/components/TemplateSelector';

/**
 * Web Worker 동적 로딩 안내:
 * Next.js에서 Web Worker를 사용하려면 다음과 같이 동적으로 로드해야 합니다:
 * const worker = new Worker(new URL('../pdf-worker', import.meta.url));
 * 
 * Safari 호환성 참고:
 * - Safari 15+ 에서 ES Module Worker 지원
 * - 이전 버전에서는 fallback으로 메인 스레드에서 처리
 */

// 상수 정의
const MAX_FILES = 50;
const MAX_TOTAL_SIZE_FREE = 50 * 1024 * 1024; // 50MB (무료)
const MAX_TOTAL_SIZE_PREMIUM = 200 * 1024 * 1024; // 200MB (프리미엄)

export default function Home() {
  // 상태 관리
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    createBookmarks: false,
    optimizeSize: false,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Worker 참조
  const workerRef = useRef<Worker | null>(null);

  // Worker 초기화
  useEffect(() => {
    // Worker 지원 여부 확인
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../pdf-worker', import.meta.url)
        );

        workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const { type, progress: workerProgress, blobData, message } = event.data;

          switch (type) {
            case 'progress':
              if (workerProgress !== undefined) {
                setProgress(workerProgress);
              }
              break;
            case 'result':
              if (blobData) {
                const blob = new Blob([blobData], { type: 'application/pdf' });
                const filename = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
                downloadBlob(blob, filename);
                setMergeStatus('success');
                setShowShareModal(true);
              }
              break;
            case 'error':
              setError(message || '병합 중 오류가 발생했습니다.');
              setMergeStatus('error');
              break;
          }
        };

        workerRef.current.onerror = (e) => {
          console.error('Worker error:', e);
          setError('Worker 오류가 발생했습니다. 다시 시도해주세요.');
          setMergeStatus('error');
        };
      } catch (e) {
        console.warn('Worker 초기화 실패, fallback 모드 사용:', e);
      }
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 파일 추가 핸들러
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    setError(null);

    // 파일 개수 체크
    if (pdfFiles.length + newFiles.length > MAX_FILES) {
      setError(`최대 ${MAX_FILES}개의 파일만 추가할 수 있습니다.`);
      return;
    }

    // 파일 처리
    const processedFiles: PDFFile[] = [];

    for (const file of newFiles) {
      // PDF 타입 체크
      if (file.type !== 'application/pdf') {
        setError(`"${file.name}"은(는) PDF 파일이 아닙니다.`);
        continue;
      }

      // 페이지 수 확인
      const pageCount = await getPDFPageCount(file);
      if (pageCount === null) {
        setError(`"${file.name}" 파일을 읽을 수 없습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다.`);
        continue;
      }

      processedFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        pageCount,
        selectedPages: undefined,
      });
    }

    if (processedFiles.length > 0) {
      setPdfFiles((prev) => [...prev, ...processedFiles]);
    }
  }, [pdfFiles.length]);

  // 파일 삭제 핸들러
  const handleRemove = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // 파일 순서 변경 핸들러
  const handleReorder = useCallback((oldIndex: number, newIndex: number) => {
    setPdfFiles((prev) => arrayMove(prev, oldIndex, newIndex));
  }, []);

  // 선택 페이지 업데이트 핸들러
  const handleUpdateSelectedPages = useCallback((id: string, pages: number[]) => {
    setPdfFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, selectedPages: pages.length > 0 ? pages : undefined } : f
      )
    );
  }, []);

  // 병합 핸들러
  const handleMerge = useCallback(async () => {
    // 최소 파일 수 체크
    if (pdfFiles.length < 2) {
      setError('최소 2개 이상의 PDF 파일이 필요합니다.');
      return;
    }

    // 총 크기 계산
    const totalSize = pdfFiles.reduce((acc, f) => acc + f.size, 0);
    const isPremium = hasPremiumCredit();
    const maxSize = isPremium ? MAX_TOTAL_SIZE_PREMIUM : MAX_TOTAL_SIZE_FREE;

    // 크기 초과 체크
    if (totalSize > maxSize) {
      if (!isPremium) {
        const useCredits = window.confirm(
          `파일 총 크기가 무료 제한(${formatFileSize(MAX_TOTAL_SIZE_FREE)})을 초과합니다.\n` +
          `현재 프리미엄 크레딧: ${getPremiumCredits()}개\n\n` +
          `프리미엄 크레딧을 사용하시겠습니까?`
        );

        if (useCredits) {
          const success = consumePremiumCredit();
          if (!success) {
            setError('프리미엄 크레딧이 부족합니다. 공유하여 크레딧을 얻으세요!');
            setShowShareModal(true);
            return;
          }
        } else {
          setError(`파일 총 크기가 ${formatFileSize(MAX_TOTAL_SIZE_FREE)}을 초과합니다.`);
          return;
        }
      } else if (totalSize > MAX_TOTAL_SIZE_PREMIUM) {
        setError(`파일 총 크기가 최대 ${formatFileSize(MAX_TOTAL_SIZE_PREMIUM)}을 초과합니다.`);
        return;
      }
    }

    setError(null);
    setMergeStatus('processing');
    setProgress(0);

    // Worker 사용 가능 여부 확인
    if (workerRef.current) {
      try {
        // 파일을 ArrayBuffer로 변환하여 Worker에 전송
        const filesData = await Promise.all(
          pdfFiles.map(async (pdfFile) => ({
            id: pdfFile.id,
            name: pdfFile.name,
            size: pdfFile.size,
            pageCount: pdfFile.pageCount,
            selectedPages: pdfFile.selectedPages,
            arrayBuffer: await pdfFile.file.arrayBuffer(),
          }))
        );

        // Transferable로 ArrayBuffer 전송
        const buffers = filesData.map((f) => f.arrayBuffer);

        workerRef.current.postMessage(
          {
            type: 'merge',
            files: filesData,
            options: mergeOptions,
          },
          buffers
        );
      } catch (err) {
        setError(getErrorMessage(err));
        setMergeStatus('error');
      }
    } else {
      // Worker가 없으면 메인 스레드에서 직접 처리 (fallback)
      try {
        const blob = await mergePDFs(pdfFiles, mergeOptions, (pct) => {
          setProgress(pct);
        });
        
        const filename = `merged_${new Date().toISOString().slice(0, 10)}.pdf`;
        downloadBlob(blob, filename);
        setMergeStatus('success');
        setShowShareModal(true);
      } catch (err) {
        setError(getErrorMessage(err));
        setMergeStatus('error');
      }
    }
  }, [pdfFiles, mergeOptions]);

  // 템플릿 선택 핸들러
  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    // 템플릿 선택 시 안내 메시지 표시
    setError(null);
  }, []);

  // 상태 초기화
  const handleReset = useCallback(() => {
    setPdfFiles([]);
    setMergeStatus('idle');
    setError(null);
    setProgress(0);
    setSelectedTemplate(null);
  }, []);

  // 총 파일 크기 계산
  const totalSize = pdfFiles.reduce((acc, f) => acc + f.size, 0);
  const totalPages = pdfFiles.reduce((acc, f) => {
    if (f.selectedPages && f.selectedPages.length > 0) {
      return acc + f.selectedPages.length;
    }
    return acc + f.pageCount;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              PDF Merger Pro
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              여러 PDF 파일을 하나로 병합하세요
            </p>
            <div className="mt-4 flex justify-center">
              <PrivacyBadge />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="space-y-6">
          {/* 템플릿 선택 */}
          <TemplateSelector onSelectTemplate={handleSelectTemplate} />

          {/* 선택된 템플릿 안내 */}
          {selectedTemplate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">
                    {selectedTemplate.name} 템플릿 선택됨
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {selectedTemplate.files.map((f) => f.placeholder).join(' → ')}
                    순서로 파일을 추가해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 파일 업로더 */}
          <FileUploader
            onFilesAdded={handleFilesAdded}
            disabled={mergeStatus === 'processing'}
          />

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">오류 발생</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 성공 메시지 */}
          {mergeStatus === 'success' && !error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">병합 완료!</p>
                  <p className="text-sm text-green-700 mt-1">
                    PDF 파일이 성공적으로 병합되어 다운로드되었습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 파일 목록 */}
          <PDFList
            files={pdfFiles}
            onRemove={handleRemove}
            onReorder={handleReorder}
            onUpdateSelectedPages={handleUpdateSelectedPages}
          />

          {/* 파일이 있을 때만 옵션과 버튼 표시 */}
          {pdfFiles.length > 0 && (
            <>
              {/* 파일 요약 */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">파일 수:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {pdfFiles.length}개
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">총 페이지:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {totalPages}페이지
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">총 크기:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {formatFileSize(totalSize)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 병합 옵션 */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">병합 옵션</span>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mergeOptions.createBookmarks}
                      onChange={(e) =>
                        setMergeOptions((prev) => ({
                          ...prev,
                          createBookmarks: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-700">북마크 자동 생성</span>
                      <p className="text-xs text-gray-500">
                        각 원본 파일을 북마크로 표시합니다
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mergeOptions.optimizeSize}
                      onChange={(e) =>
                        setMergeOptions((prev) => ({
                          ...prev,
                          optimizeSize: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-700">파일 크기 최적화</span>
                      <p className="text-xs text-gray-500">
                        메타데이터를 제거하여 파일 크기를 줄입니다
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleMerge}
                  disabled={pdfFiles.length < 2 || mergeStatus === 'processing'}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  {mergeStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>병합 중... {progress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>PDF 병합 및 다운로드</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={mergeStatus === 'processing'}
                  className="py-4 px-6 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium rounded-xl transition-colors"
                >
                  초기화
                </button>
              </div>

              {/* 진행률 바 */}
              {mergeStatus === 'processing' && (
                <div className="overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-2 bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 공유 모달 */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
}
