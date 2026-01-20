/**
 * PDF 병합 Web Worker
 * 
 * 이 Worker는 메인 스레드와 분리되어 PDF 병합 작업을 수행합니다.
 * UI가 멈추지 않고 사용자 경험을 향상시킵니다.
 * 
 * 브라우저 호환성 참고:
 * - Chrome, Firefox, Edge: 완벽 지원
 * - Safari: ES Module Worker 지원이 제한적일 수 있음 (Safari 15+에서 지원)
 *   - Safari에서 문제가 발생하면 메인 스레드에서 직접 처리하는 fallback 사용
 * - IE: 지원하지 않음
 * 
 * 사용 방법 (Next.js):
 * const worker = new Worker(new URL('./pdf-worker', import.meta.url));
 * 
 * 메시지 형식:
 * - 입력: { type: 'merge', files: [...], options: {...} }
 * - 출력 (진행률): { type: 'progress', progress: number }
 * - 출력 (결과): { type: 'result', blobData: Uint8Array }
 * - 출력 (에러): { type: 'error', message: string }
 */

import type { MergeOptions } from '@/types/pdf';

// Worker 컨텍스트 타입
declare const self: DedicatedWorkerGlobalScope;

interface WorkerFileData {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  selectedPages?: number[];
  arrayBuffer: ArrayBuffer;
}

interface WorkerMergeMessage {
  type: 'merge';
  files: WorkerFileData[];
  options: MergeOptions;
}

/**
 * ArrayBuffer에서 직접 PDF를 병합합니다.
 */
async function mergePDFsInWorker(
  files: WorkerFileData[],
  options: MergeOptions,
  onProgress: (pct: number) => void
): Promise<Uint8Array> {
  // pdf-lib를 동적으로 import
  const { PDFDocument } = await import('pdf-lib');
  
  const mergedPdf = await PDFDocument.create();
  
  let processedFiles = 0;
  const totalFiles = files.length;
  
  for (const pdfFile of files) {
    try {
      const sourcePdf = await PDFDocument.load(pdfFile.arrayBuffer, {
        ignoreEncryption: true,
      });
      
      const totalPages = sourcePdf.getPageCount();
      
      // selectedPages 처리 (1-based to 0-based)
      let pageIndices: number[];
      if (pdfFile.selectedPages && pdfFile.selectedPages.length > 0) {
        pageIndices = pdfFile.selectedPages
          .map((p) => p - 1)
          .filter((p) => p >= 0 && p < totalPages);
      } else {
        pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      }
      
      // 페이지 복사
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
      
      processedFiles++;
      onProgress(Math.round((processedFiles / totalFiles) * 100));
    } catch (fileError) {
      throw new Error(`파일 "${pdfFile.name}" 처리 중 오류가 발생했습니다.`);
    }
  }
  
  // 최적화 옵션 적용
  if (options.optimizeSize) {
    mergedPdf.setTitle('');
    mergedPdf.setAuthor('');
    mergedPdf.setSubject('');
    mergedPdf.setKeywords([]);
    mergedPdf.setProducer('');
    mergedPdf.setCreator('');
  }
  
  // 북마크 옵션
  if (options.createBookmarks) {
    mergedPdf.setTitle('Merged PDF Document');
    mergedPdf.setProducer('PDF Merger Pro');
  }
  
  return await mergedPdf.save();
}

// 메시지 핸들러
self.onmessage = async (event: MessageEvent<WorkerMergeMessage>) => {
  const { type, files, options } = event.data;
  
  if (type !== 'merge') {
    self.postMessage({
      type: 'error',
      message: '알 수 없는 메시지 타입입니다.',
    });
    return;
  }
  
  try {
    // 진행률 콜백
    const onProgress = (progress: number) => {
      self.postMessage({ type: 'progress', progress });
    };
    
    // PDF 병합 실행
    const result = await mergePDFsInWorker(files, options, onProgress);
    
    // 결과 전송 (Transferable로 전송하여 성능 향상)
    self.postMessage(
      { type: 'result', blobData: result },
      { transfer: [result.buffer] }
    );
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : '알 수 없는 오류가 발생했습니다.';
    self.postMessage({ type: 'error', message });
  }
};

// Worker 준비 완료 알림
self.postMessage({ type: 'ready' });

export {};
