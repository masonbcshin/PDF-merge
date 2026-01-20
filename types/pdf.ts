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
