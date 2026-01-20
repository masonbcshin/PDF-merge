/**
 * PDF 병합 Web Worker
 * 
 * 브라우저에서만 동작하는 PDF 병합 도구입니다.
 * 서버 없이 클라이언트 사이드에서 pdf-lib를 사용하여 PDF를 병합합니다.
 * 
 * 입력: { files: ArrayBuffer[] }
 * 출력: { success: true, data: Uint8Array } 또는 { success: false, error: string }
 * 
 * @version 3.0.0
 */

import { PDFDocument } from 'pdf-lib';

// Worker 컨텍스트 타입 선언
declare const self: DedicatedWorkerGlobalScope;

// ============================================================================
// 설정 상수
// ============================================================================

/** 환경별 메모리 제한 */
const MEMORY_LIMITS = {
  MOBILE_MAX_TOTAL_SIZE: 150 * 1024 * 1024,   // 모바일 150MB
  DESKTOP_MAX_TOTAL_SIZE: 500 * 1024 * 1024,  // 데스크탑 500MB
  MAX_SINGLE_FILE_SIZE: 50 * 1024 * 1024,     // 단일 파일 50MB
  MOBILE_CHUNK_SIZE: 20,                       // 모바일 청크 크기
  DESKTOP_CHUNK_SIZE: 50,                      // 데스크탑 청크 크기
} as const;

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 모바일 환경 감지
 */
function isMobile(): boolean {
  try {
    const ua = navigator.userAgent;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);
  } catch {
    return true; // 보수적으로 모바일로 간주
  }
}

/**
 * PDF 파일 시그니처 검증 (%PDF-)
 */
function isValidPDF(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 5) return false;
  
  try {
    const header = new Uint8Array(buffer, 0, 5);
    return header[0] === 0x25 && header[1] === 0x50 && 
           header[2] === 0x44 && header[3] === 0x46 && header[4] === 0x2D;
  } catch {
    return false;
  }
}

/**
 * 메모리 사용량 사전 검증
 */
function validateMemory(files: ArrayBuffer[]): string | null {
  const mobile = isMobile();
  const maxTotal = mobile ? MEMORY_LIMITS.MOBILE_MAX_TOTAL_SIZE : MEMORY_LIMITS.DESKTOP_MAX_TOTAL_SIZE;
  const totalSize = files.reduce((sum, f) => sum + f.byteLength, 0);
  
  // 단일 파일 크기 검증
  for (let i = 0; i < files.length; i++) {
    if (files[i].byteLength > MEMORY_LIMITS.MAX_SINGLE_FILE_SIZE) {
      return `파일 ${i + 1}의 크기가 50MB를 초과합니다.`;
    }
  }
  
  // 총 크기 검증 (PDF 처리 시 약 4배 메모리 사용)
  if (totalSize * 4 > maxTotal) {
    const limitMB = Math.floor(maxTotal / 4 / 1024 / 1024);
    return `총 파일 크기가 ${limitMB}MB를 초과합니다.`;
  }
  
  return null;
}

/**
 * GC 기회 제공을 위한 yield
 */
function yieldToGC(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// ============================================================================
// 메인 메시지 핸들러
// ============================================================================

self.onmessage = async (e: MessageEvent<{ files: ArrayBuffer[] }>) => {
  try {
    const { files } = e.data;

    // 1. 파일 존재 검증
    if (!files || files.length === 0) {
      throw new Error('병합할 PDF 파일이 없습니다.');
    }

    // 2. 메모리 사전 검증 (대용량 파일 크래시 방지)
    const memoryError = validateMemory(files);
    if (memoryError) {
      throw new Error(memoryError);
    }

    // 3. PDF 유효성 검증
    for (let i = 0; i < files.length; i++) {
      if (!isValidPDF(files[i])) {
        throw new Error(`파일 ${i + 1}은(는) 유효한 PDF가 아닙니다.`);
      }
    }

    // 4. 병합 PDF 생성
    const mergedPdf = await PDFDocument.create();
    const chunkSize = isMobile() ? MEMORY_LIMITS.MOBILE_CHUNK_SIZE : MEMORY_LIMITS.DESKTOP_CHUNK_SIZE;

    // 5. 각 PDF 파일 처리
    for (let i = 0; i < files.length; i++) {
      const buffer = files[i];
      
      const pdf = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
      });

      const pageIndices = pdf.getPageIndices();
      
      // 청크 단위로 페이지 복사 (메모리 스파이크 방지)
      for (let start = 0; start < pageIndices.length; start += chunkSize) {
        const end = Math.min(start + chunkSize, pageIndices.length);
        const chunk = pageIndices.slice(start, end);
        
        const copiedPages = await mergedPdf.copyPages(pdf, chunk);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        // 청크 간 GC 기회 제공
        if (end < pageIndices.length) {
          await yieldToGC();
        }
      }
      
      // 파일 간 GC 기회 제공
      await yieldToGC();
    }

    // 6. 최종 PDF 저장
    const mergedBytes = await mergedPdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });

    // 7. 성공 응답 (Transferable로 전송)
    self.postMessage(
      { success: true, data: mergedBytes },
      [mergedBytes.buffer]
    );

  } catch (err) {
    // 8. 에러 응답
    const message = err instanceof Error ? err.message : 'PDF 병합 중 오류 발생';
    self.postMessage({
      success: false,
      error: message,
    });
  }
};

export {};
