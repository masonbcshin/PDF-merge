export interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  selectedPages?: number[]; // 사용자 입력은 1-based, 내부는 0-based로 변환해서 사용
}

export type MergeStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AppError {
  message: string;
  code:
    | 'FILE_TOO_LARGE'
    | 'INVALID_PDF'
    | 'MERGE_FAILED'
    | 'LOAD_FAILED'
    | 'TOO_MANY_FILES'
    | 'MEMORY_LIMIT_EXCEEDED';
}

export interface MergeOptions {
  createBookmarks: boolean;
  optimizeSize: boolean;
}

export interface TemplateFile {
  placeholder: string;
  required: boolean;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'real-estate' | 'student' | 'business';
  files: TemplateFile[];
}

// ============================================================================
// PDF Worker 인터페이스 (v3.0 - 단순화된 구조)
// ============================================================================

/**
 * Worker 입력 메시지
 * 
 * 사용법:
 * worker.postMessage({ files: [arrayBuffer1, arrayBuffer2] });
 */
export interface PDFWorkerInput {
  /** PDF 파일들의 ArrayBuffer 배열 */
  files: ArrayBuffer[];
}

/**
 * Worker 출력 메시지
 * 
 * 성공: { success: true, data: Uint8Array }
 * 실패: { success: false, error: string }
 */
export type PDFWorkerOutput = 
  | { success: true; data: Uint8Array }
  | { success: false; error: string };
