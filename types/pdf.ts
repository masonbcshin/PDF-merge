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

// Worker 메시지 타입
export interface WorkerMessage {
  type: 'merge';
  files: {
    id: string;
    name: string;
    size: number;
    pageCount: number;
    selectedPages?: number[];
    arrayBuffer: ArrayBuffer;
  }[];
  options: MergeOptions;
}

export interface WorkerResponse {
  type: 'progress' | 'result' | 'error';
  progress?: number;
  blobData?: Uint8Array;
  message?: string;
}

// ============================================================================
// 새로운 Worker 인터페이스 (pdf-worker.ts v2.0용)
// ============================================================================

/** Worker 에러 코드 */
export type WorkerErrorCode = 
  | 'NO_FILES'           // 파일 0개 입력
  | 'INVALID_PDF'        // 잘못된 PDF 형식
  | 'MEMORY_EXCEEDED'    // 메모리 부족
  | 'PROCESSING_ERROR'   // 처리 중 일반 오류
  | 'UNKNOWN_MESSAGE'    // 알 수 없는 메시지 타입
  | 'UNKNOWN_ERROR';     // 알 수 없는 오류

/** Worker 입력 메시지 (ArrayBuffer 기반) */
export interface WorkerInputMessage {
  type: 'merge';
  /** PDF 파일들의 ArrayBuffer 배열 */
  files: ArrayBuffer[];
  /** 파일명 배열 (에러 메시지용, 선택적) */
  fileNames?: string[];
  /** 병합 옵션 */
  options?: {
    createBookmarks?: boolean;
    optimizeSize?: boolean;
    selectedPages?: { [fileIndex: number]: number[] };
  };
}

/** Worker 출력 메시지 타입 */
export type WorkerOutputMessage = 
  | { type: 'ready' }
  | { type: 'progress'; progress: number; stage: string }
  | { type: 'result'; data: Uint8Array }
  | { type: 'error'; code: WorkerErrorCode; message: string };
