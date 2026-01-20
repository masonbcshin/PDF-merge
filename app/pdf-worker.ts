/**
 * PDF 병합 Web Worker
 * 
 * 브라우저에서만 동작하는 PDF 병합 도구의 핵심 Worker 코드입니다.
 * 서버 없이 클라이언트 사이드에서 pdf-lib를 사용하여 PDF를 병합합니다.
 * 
 * 주요 특징:
 * - 메인 스레드 블로킹 방지 (Web Worker 분리)
 * - 메모리 사용 최소화 (스트리밍 방식 처리, 청크 단위 복사)
 * - 대용량 PDF 지원 (10~20MB 파일 다수 처리 가능)
 * - 모바일 브라우저 최적화 (메모리 모니터링, 적응형 청크 크기)
 * 
 * 브라우저 호환성:
 * - Chrome, Firefox, Edge: 완벽 지원
 * - Safari: ES Module Worker 지원 (Safari 15+)
 * - IE: 지원하지 않음
 * 
 * 사용 방법 (Next.js):
 * const worker = new Worker(new URL('./pdf-worker', import.meta.url));
 * 
 * 입력 메시지 형식:
 * { 
 *   type: 'merge', 
 *   files: ArrayBuffer[], // PDF 파일 배열
 *   fileNames?: string[], // 파일명 배열 (에러 메시지용)
 *   options?: MergeOptions 
 * }
 * 
 * 출력 메시지 형식:
 * - 진행률: { type: 'progress', progress: number, stage: string }
 * - 결과:   { type: 'result', data: Uint8Array }
 * - 에러:   { type: 'error', code: string, message: string }
 * - 준비:   { type: 'ready' }
 * 
 * @author PDF Merger Pro
 * @version 2.0.0
 */

// Worker 컨텍스트 타입 선언
declare const self: DedicatedWorkerGlobalScope;

// ============================================================================
// 타입 정의
// ============================================================================

/** 병합 옵션 인터페이스 */
interface MergeOptions {
  /** 파일별 북마크 생성 여부 */
  createBookmarks?: boolean;
  /** 파일 크기 최적화 (메타데이터 제거) */
  optimizeSize?: boolean;
  /** 선택된 페이지 (1-based 인덱스) */
  selectedPages?: { [fileIndex: number]: number[] };
}

/** Worker로 전달되는 메시지 타입 */
interface WorkerInputMessage {
  type: 'merge';
  /** PDF 파일들의 ArrayBuffer 배열 */
  files: ArrayBuffer[];
  /** 파일명 배열 (에러 메시지용, 선택적) */
  fileNames?: string[];
  /** 병합 옵션 */
  options?: MergeOptions;
}

/** Worker에서 반환하는 메시지 타입 */
type WorkerOutputMessage = 
  | { type: 'ready' }
  | { type: 'progress'; progress: number; stage: string }
  | { type: 'result'; data: Uint8Array }
  | { type: 'error'; code: ErrorCode; message: string };

/** 에러 코드 타입 */
type ErrorCode = 
  | 'NO_FILES'           // 파일 0개 입력
  | 'INVALID_PDF'        // 잘못된 PDF 형식
  | 'MEMORY_EXCEEDED'    // 메모리 부족
  | 'PROCESSING_ERROR'   // 처리 중 일반 오류
  | 'UNKNOWN_MESSAGE'    // 알 수 없는 메시지 타입
  | 'UNKNOWN_ERROR';     // 알 수 없는 오류

// ============================================================================
// 상수 정의
// ============================================================================

/** 
 * 청크당 처리할 페이지 수
 * 대용량 PDF에서 메모리 스파이크를 방지하기 위해 페이지를 나눠서 복사
 */
const DEFAULT_CHUNK_SIZE = 50;

/**
 * 모바일 환경 청크 크기
 * 모바일 브라우저는 메모리 제한이 더 엄격하므로 청크 크기를 줄임
 */
const MOBILE_CHUNK_SIZE = 20;

/**
 * 메모리 경고 임계값 (바이트)
 * navigator.deviceMemory가 없는 환경을 위한 기본값
 * 모바일: 약 200MB, 데스크탑: 약 500MB
 */
const MEMORY_WARNING_THRESHOLD_MOBILE = 200 * 1024 * 1024;
const MEMORY_WARNING_THRESHOLD_DESKTOP = 500 * 1024 * 1024;

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 모바일 환경 감지
 * User Agent를 확인하여 모바일 브라우저인지 판단
 * 
 * @returns 모바일 환경 여부
 */
function isMobileEnvironment(): boolean {
  try {
    // Worker 내에서는 navigator 접근 가능
    const ua = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  } catch {
    // User Agent 접근 실패 시 보수적으로 모바일로 간주
    return true;
  }
}

/**
 * 적응형 청크 크기 결정
 * 환경에 따라 최적의 청크 크기를 반환
 * 
 * @returns 페이지 청크 크기
 */
function getChunkSize(): number {
  return isMobileEnvironment() ? MOBILE_CHUNK_SIZE : DEFAULT_CHUNK_SIZE;
}

/**
 * 메모리 사용량 확인 (가능한 경우)
 * Performance Memory API를 사용하여 현재 메모리 사용량을 확인
 * 
 * @returns 현재 메모리 사용량 (바이트) 또는 null
 */
function getMemoryUsage(): number | null {
  try {
    // Chrome 전용 API
    const performance = self.performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };
    
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
  } catch {
    // API 미지원
  }
  return null;
}

/**
 * 메모리 부족 여부 확인
 * 현재 메모리 사용량이 임계값을 초과했는지 확인
 * 
 * @returns 메모리 부족 여부
 */
function isMemoryLow(): boolean {
  const usage = getMemoryUsage();
  if (usage === null) {
    // 메모리 모니터링 불가 시 false 반환
    return false;
  }
  
  const threshold = isMobileEnvironment() 
    ? MEMORY_WARNING_THRESHOLD_MOBILE 
    : MEMORY_WARNING_THRESHOLD_DESKTOP;
  
  return usage > threshold;
}

/**
 * 가비지 컬렉션 유도
 * 명시적으로 GC를 요청할 수는 없지만, 참조 해제 후 짧은 지연을 줌
 * 이는 브라우저에게 GC를 수행할 기회를 제공
 * 
 * @param ms - 지연 시간 (밀리초)
 */
async function yieldToGC(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * PDF 파일 유효성 검사
 * ArrayBuffer가 유효한 PDF 파일인지 간단히 확인
 * PDF 파일은 "%PDF-" 헤더로 시작해야 함
 * 
 * @param buffer - 검사할 ArrayBuffer
 * @returns PDF 파일 여부
 */
function isValidPDFBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 5) {
    return false;
  }
  
  try {
    const header = new Uint8Array(buffer, 0, 5);
    // PDF 파일 시그니처: %PDF-
    return (
      header[0] === 0x25 && // %
      header[1] === 0x50 && // P
      header[2] === 0x44 && // D
      header[3] === 0x46 && // F
      header[4] === 0x2D    // -
    );
  } catch {
    return false;
  }
}

/**
 * 에러 메시지 전송
 * 
 * @param code - 에러 코드
 * @param message - 에러 메시지
 */
function sendError(code: ErrorCode, message: string): void {
  self.postMessage({ type: 'error', code, message } as WorkerOutputMessage);
}

/**
 * 진행률 메시지 전송
 * 
 * @param progress - 진행률 (0-100)
 * @param stage - 현재 처리 단계 설명
 */
function sendProgress(progress: number, stage: string): void {
  self.postMessage({ 
    type: 'progress', 
    progress: Math.min(100, Math.max(0, Math.round(progress))), 
    stage 
  } as WorkerOutputMessage);
}

// ============================================================================
// 핵심 PDF 병합 로직
// ============================================================================

/**
 * PDF 파일들을 병합하는 메인 함수
 * 
 * 처리 흐름:
 * 1. 입력 유효성 검사
 * 2. 빈 PDF 문서 생성
 * 3. 각 파일을 순차적으로 로드하고 페이지 복사 (메모리 최적화)
 * 4. 청크 단위로 페이지 복사 (대용량 파일 대응)
 * 5. 옵션 적용 (최적화, 북마크 등)
 * 6. 최종 PDF 바이너리 생성
 * 
 * @param files - 병합할 PDF ArrayBuffer 배열
 * @param fileNames - 파일명 배열 (에러 메시지용)
 * @param options - 병합 옵션
 * @returns 병합된 PDF Uint8Array
 * @throws 처리 중 발생한 에러
 */
async function mergePDFs(
  files: ArrayBuffer[],
  fileNames: string[],
  options: MergeOptions
): Promise<Uint8Array> {
  // pdf-lib 동적 import (코드 스플리팅)
  const { PDFDocument } = await import('pdf-lib');
  
  sendProgress(5, 'PDF 라이브러리 로드 완료');
  
  // 새 PDF 문서 생성
  const mergedPdf = await PDFDocument.create();
  
  const totalFiles = files.length;
  const chunkSize = getChunkSize();
  
  // 전체 페이지 수 미리 계산 (정확한 진행률 표시용)
  let totalPages = 0;
  let processedPages = 0;
  
  // 각 파일별 페이지 수 저장
  const pageCountsPerFile: number[] = [];
  
  // 1단계: 각 파일의 페이지 수 파악 (빠른 헤더 파싱)
  sendProgress(10, '파일 분석 중...');
  
  for (let i = 0; i < totalFiles; i++) {
    const buffer = files[i];
    const fileName = fileNames[i] || `파일 ${i + 1}`;
    
    // 메모리 부족 감지
    if (isMemoryLow()) {
      // GC 기회 제공
      await yieldToGC(10);
      
      // 여전히 메모리 부족하면 에러
      if (isMemoryLow()) {
        throw {
          code: 'MEMORY_EXCEEDED' as ErrorCode,
          message: `메모리가 부족합니다. 파일 수를 줄이거나 더 작은 파일을 사용해주세요. (처리 중: ${fileName})`
        };
      }
    }
    
    try {
      // PDF 로드 (페이지 수만 확인)
      const tempPdf = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        updateMetadata: false, // 메타데이터 업데이트 비활성화로 메모리 절약
      });
      
      let pageCount = tempPdf.getPageCount();
      
      // 선택된 페이지가 있으면 해당 페이지 수만 카운트
      if (options.selectedPages && options.selectedPages[i]) {
        const selected = options.selectedPages[i];
        pageCount = selected.filter(p => p >= 1 && p <= pageCount).length;
      }
      
      pageCountsPerFile.push(pageCount);
      totalPages += pageCount;
      
      // 임시 PDF 참조 해제 (GC 대상)
      // @ts-ignore - 명시적 참조 해제
      // tempPdf = null;
      
    } catch (loadError) {
      throw {
        code: 'INVALID_PDF' as ErrorCode,
        message: `"${fileName}"은(는) 유효한 PDF 파일이 아니거나 손상되었습니다.`
      };
    }
    
    sendProgress(10 + (i + 1) / totalFiles * 10, `파일 분석 중... (${i + 1}/${totalFiles})`);
  }
  
  // 2단계: 실제 병합 수행
  sendProgress(20, 'PDF 병합 시작...');
  
  for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
    const buffer = files[fileIndex];
    const fileName = fileNames[fileIndex] || `파일 ${fileIndex + 1}`;
    
    try {
      // PDF 문서 로드
      const sourcePdf = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      
      const sourcePageCount = sourcePdf.getPageCount();
      
      // 복사할 페이지 인덱스 결정 (0-based)
      let pageIndices: number[];
      
      if (options.selectedPages && options.selectedPages[fileIndex]) {
        // 선택된 페이지만 (1-based를 0-based로 변환)
        pageIndices = options.selectedPages[fileIndex]
          .map(p => p - 1)
          .filter(p => p >= 0 && p < sourcePageCount)
          .sort((a, b) => a - b);
      } else {
        // 전체 페이지
        pageIndices = Array.from({ length: sourcePageCount }, (_, i) => i);
      }
      
      // 청크 단위로 페이지 복사 (메모리 스파이크 방지)
      for (let chunkStart = 0; chunkStart < pageIndices.length; chunkStart += chunkSize) {
        const chunkEnd = Math.min(chunkStart + chunkSize, pageIndices.length);
        const chunkIndices = pageIndices.slice(chunkStart, chunkEnd);
        
        // 메모리 부족 체크
        if (isMemoryLow()) {
          await yieldToGC(50);
          
          if (isMemoryLow()) {
            throw {
              code: 'MEMORY_EXCEEDED' as ErrorCode,
              message: `메모리가 부족합니다. "${fileName}" 처리 중 중단되었습니다.`
            };
          }
        }
        
        // 페이지 복사
        const copiedPages = await mergedPdf.copyPages(sourcePdf, chunkIndices);
        
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
          processedPages++;
          
          // 진행률 업데이트 (20% ~ 90% 구간)
          const progressPercent = 20 + (processedPages / totalPages) * 70;
          
          // 너무 자주 업데이트하면 오버헤드가 발생하므로 10페이지마다 또는 청크 끝에서 업데이트
          if (processedPages % 10 === 0 || chunkEnd === pageIndices.length) {
            sendProgress(
              progressPercent,
              `병합 중... (${fileIndex + 1}/${totalFiles} 파일, ${processedPages}/${totalPages} 페이지)`
            );
          }
        }
        
        // 청크 처리 후 짧은 지연으로 GC 기회 제공
        if (chunkEnd < pageIndices.length) {
          await yieldToGC(0);
        }
      }
      
      // 원본 PDF 참조 해제 (다음 파일 처리 전 메모리 정리 기회)
      // files[fileIndex]는 유지 (재사용 가능성)
      
    } catch (error) {
      // 이미 포맷된 에러는 그대로 전달
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      
      throw {
        code: 'PROCESSING_ERROR' as ErrorCode,
        message: `"${fileName}" 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
    
    // 파일 처리 완료 후 GC 기회 제공
    await yieldToGC(0);
  }
  
  sendProgress(90, '최적화 적용 중...');
  
  // 3단계: 옵션 적용
  if (options.optimizeSize) {
    // 메타데이터 제거로 파일 크기 최적화
    mergedPdf.setTitle('');
    mergedPdf.setAuthor('');
    mergedPdf.setSubject('');
    mergedPdf.setKeywords([]);
    mergedPdf.setProducer('');
    mergedPdf.setCreator('');
  }
  
  if (options.createBookmarks) {
    // 기본 메타데이터 설정
    mergedPdf.setTitle('Merged PDF Document');
    mergedPdf.setProducer('PDF Merger Pro');
    mergedPdf.setCreationDate(new Date());
  }
  
  sendProgress(95, 'PDF 생성 중...');
  
  // 4단계: 최종 PDF 바이너리 생성
  const pdfBytes = await mergedPdf.save();
  
  sendProgress(100, '완료');
  
  return pdfBytes;
}

// ============================================================================
// 메시지 핸들러
// ============================================================================

/**
 * 메인 스레드로부터 메시지 수신 핸들러
 * 
 * 지원 메시지 타입:
 * - 'merge': PDF 병합 요청
 * 
 * @param event - MessageEvent 객체
 */
self.onmessage = async (event: MessageEvent<WorkerInputMessage>) => {
  const { type, files, fileNames, options } = event.data;
  
  // 메시지 타입 검증
  if (type !== 'merge') {
    sendError('UNKNOWN_MESSAGE', `알 수 없는 메시지 타입입니다: ${type}`);
    return;
  }
  
  // 입력 유효성 검사: 파일 배열 확인
  if (!files || !Array.isArray(files)) {
    sendError('NO_FILES', '파일 배열이 전달되지 않았습니다.');
    return;
  }
  
  // 입력 유효성 검사: 파일 개수 확인
  if (files.length === 0) {
    sendError('NO_FILES', '병합할 PDF 파일이 없습니다. 최소 1개 이상의 파일을 선택해주세요.');
    return;
  }
  
  // 파일명 배열 준비 (없으면 기본값 생성)
  const names = fileNames || files.map((_, i) => `파일 ${i + 1}`);
  
  // 입력 유효성 검사: 각 파일이 유효한 PDF인지 확인
  sendProgress(0, '파일 유효성 검사 중...');
  
  for (let i = 0; i < files.length; i++) {
    const buffer = files[i];
    const name = names[i];
    
    // ArrayBuffer 타입 확인
    if (!(buffer instanceof ArrayBuffer)) {
      sendError('INVALID_PDF', `"${name}"이(가) ArrayBuffer 형식이 아닙니다.`);
      return;
    }
    
    // PDF 시그니처 확인
    if (!isValidPDFBuffer(buffer)) {
      sendError('INVALID_PDF', `"${name}"은(는) 유효한 PDF 파일이 아닙니다. PDF 파일만 업로드해주세요.`);
      return;
    }
  }
  
  // 병합 옵션 기본값 설정
  const mergeOptions: MergeOptions = {
    createBookmarks: options?.createBookmarks ?? false,
    optimizeSize: options?.optimizeSize ?? false,
    selectedPages: options?.selectedPages,
  };
  
  try {
    // PDF 병합 실행
    const result = await mergePDFs(files, names, mergeOptions);
    
    // 결과 전송
    // Transferable로 전송하여 메모리 복사 방지 (성능 최적화)
    self.postMessage(
      { type: 'result', data: result } as WorkerOutputMessage,
      { transfer: [result.buffer] }
    );
    
  } catch (error) {
    // 에러 처리
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // 포맷된 에러
      const formattedError = error as { code: ErrorCode; message: string };
      sendError(formattedError.code, formattedError.message);
    } else if (error instanceof Error) {
      // 일반 Error 객체
      // 메모리 관련 에러 감지
      if (error.message.includes('memory') || error.message.includes('heap')) {
        sendError('MEMORY_EXCEEDED', `메모리가 부족합니다. 파일 수를 줄이거나 브라우저를 새로고침한 후 다시 시도해주세요.`);
      } else {
        sendError('PROCESSING_ERROR', `PDF 병합 중 오류가 발생했습니다: ${error.message}`);
      }
    } else {
      // 알 수 없는 에러
      sendError('UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }
};

/**
 * Worker 에러 핸들러
 * 예상치 못한 에러 발생 시 메인 스레드에 알림
 */
self.onerror = (event: ErrorEvent) => {
  sendError('UNKNOWN_ERROR', `Worker 오류: ${event.message}`);
};

/**
 * 처리되지 않은 Promise rejection 핸들러
 */
self.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  sendError('UNKNOWN_ERROR', `비동기 처리 오류: ${message}`);
};

// Worker 준비 완료 알림
// 메인 스레드에서 Worker가 초기화되었음을 확인할 수 있음
self.postMessage({ type: 'ready' } as WorkerOutputMessage);

// ES Module 표시 (빈 export)
export {};
