import type { PDFFile, MergeOptions } from '@/types/pdf';

/**
 * PDF 파일의 페이지 수를 반환합니다.
 * @param file - PDF 파일
 * @returns 페이지 수 또는 에러 시 null
 */
export async function getPDFPageCount(file: File): Promise<number | null> {
  try {
    // pdf-lib 동적 import (코드 스플리팅)
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('PDF 페이지 수 확인 실패:', error);
    return null;
  }
}

/**
 * 여러 PDF 파일을 병합합니다.
 * Web Worker를 쓰지 않는 환경에서도 동작합니다.
 * @param files - 병합할 PDF 파일 배열
 * @param options - 병합 옵션
 * @param onProgress - 진행률 콜백 (0-100)
 * @returns 병합된 PDF Blob
 */
export async function mergePDFs(
  files: PDFFile[],
  options: MergeOptions,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    
    // 새 PDF 문서 생성
    const mergedPdf = await PDFDocument.create();
    
    let processedFiles = 0;
    const totalFiles = files.length;
    
    for (const pdfFile of files) {
      try {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        
        const totalPages = sourcePdf.getPageCount();
        
        // selectedPages가 있으면 해당 페이지만, 없으면 전체 페이지
        // selectedPages는 1-based이므로 0-based로 변환
        let pageIndices: number[];
        if (pdfFile.selectedPages && pdfFile.selectedPages.length > 0) {
          pageIndices = pdfFile.selectedPages
            .map((p) => p - 1) // 1-based to 0-based
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
        if (onProgress) {
          onProgress(Math.round((processedFiles / totalFiles) * 100));
        }
      } catch (fileError) {
        console.error(`파일 처리 실패: ${pdfFile.name}`, fileError);
        throw new Error(`파일 "${pdfFile.name}" 처리 중 오류가 발생했습니다.`);
      }
    }
    
    // 최적화 옵션 적용
    if (options.optimizeSize) {
      // 메타데이터 제거로 파일 크기 최적화
      mergedPdf.setTitle('');
      mergedPdf.setAuthor('');
      mergedPdf.setSubject('');
      mergedPdf.setKeywords([]);
      mergedPdf.setProducer('');
      mergedPdf.setCreator('');
    }
    
    // 북마크 생성 옵션 (현재는 기본 메타데이터만 설정)
    if (options.createBookmarks) {
      mergedPdf.setTitle('Merged PDF Document');
      mergedPdf.setProducer('PDF Merger Pro');
    }
    
    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF 병합 실패:', error);
    throw error;
  }
}

/**
 * ArrayBuffer에서 직접 PDF를 병합합니다. (Web Worker용)
 */
export async function mergePDFsFromArrayBuffers(
  files: {
    id: string;
    name: string;
    size: number;
    pageCount: number;
    selectedPages?: number[];
    arrayBuffer: ArrayBuffer;
  }[],
  options: MergeOptions,
  onProgress?: (pct: number) => void
): Promise<Uint8Array> {
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
      
      let pageIndices: number[];
      if (pdfFile.selectedPages && pdfFile.selectedPages.length > 0) {
        pageIndices = pdfFile.selectedPages
          .map((p) => p - 1)
          .filter((p) => p >= 0 && p < totalPages);
      } else {
        pageIndices = Array.from({ length: totalPages }, (_, i) => i);
      }
      
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
      
      processedFiles++;
      if (onProgress) {
        onProgress(Math.round((processedFiles / totalFiles) * 100));
      }
    } catch (fileError) {
      throw new Error(`파일 "${pdfFile.name}" 처리 중 오류가 발생했습니다.`);
    }
  }
  
  if (options.optimizeSize) {
    mergedPdf.setTitle('');
    mergedPdf.setAuthor('');
    mergedPdf.setSubject('');
    mergedPdf.setKeywords([]);
    mergedPdf.setProducer('');
    mergedPdf.setCreator('');
  }
  
  if (options.createBookmarks) {
    mergedPdf.setTitle('Merged PDF Document');
    mergedPdf.setProducer('PDF Merger Pro');
  }
  
  return await mergedPdf.save();
}

/**
 * 바이트를 읽기 쉬운 파일 크기 문자열로 변환합니다.
 * @param bytes - 바이트 수
 * @returns 포맷된 파일 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Blob을 다운로드합니다.
 * @param blob - 다운로드할 Blob
 * @param filename - 파일명
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // 메모리 누수 방지를 위해 URL 해제
    // 약간의 지연을 두어 다운로드가 시작된 후 해제
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * PDF 파일 배열을 정렬합니다 (drag and drop용)
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}
