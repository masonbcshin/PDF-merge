import type { AppError } from '@/types/pdf';

/**
 * 에러에서 사용자 친화적인 메시지를 추출합니다.
 * @param error - 발생한 에러
 * @returns 사용자 친화적인 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // PDF 관련 에러
    if (message.includes('invalid pdf') || message.includes('pdf parsing')) {
      return '유효하지 않은 PDF 파일입니다. 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.';
    }
    
    if (message.includes('encrypted') || message.includes('password')) {
      return '암호화된 PDF 파일은 처리할 수 없습니다. 암호를 해제한 후 다시 시도해주세요.';
    }
    
    // 파일 크기 관련 에러
    if (message.includes('too large') || message.includes('size limit')) {
      return '파일 크기가 너무 큽니다. 20MB 이하의 파일만 업로드할 수 있습니다.';
    }
    
    // 메모리 관련 에러
    if (
      message.includes('memory') ||
      message.includes('heap') ||
      message.includes('allocation')
    ) {
      return '메모리 한도를 초과했습니다. 더 적은 수의 파일로 시도하거나 파일 크기를 줄여주세요.';
    }
    
    // 로딩 관련 에러
    if (message.includes('load') || message.includes('read')) {
      return '파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었을 수 있습니다.';
    }
    
    // 병합 관련 에러
    if (message.includes('merge') || message.includes('combine')) {
      return 'PDF 병합 중 오류가 발생했습니다. 일부 파일이 호환되지 않을 수 있습니다.';
    }
    
    // 기본 에러 메시지 반환
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
}

/**
 * 에러에서 에러 코드를 추출합니다.
 * @param error - 발생한 에러
 * @returns 에러 코드
 */
export function getErrorCode(error: unknown): AppError['code'] {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid pdf') || message.includes('pdf parsing')) {
      return 'INVALID_PDF';
    }
    
    if (message.includes('too large') || message.includes('size limit')) {
      return 'FILE_TOO_LARGE';
    }
    
    if (
      message.includes('memory') ||
      message.includes('heap') ||
      message.includes('allocation')
    ) {
      return 'MEMORY_LIMIT_EXCEEDED';
    }
    
    if (message.includes('load') || message.includes('read')) {
      return 'LOAD_FAILED';
    }
    
    if (message.includes('too many') || message.includes('limit exceeded')) {
      return 'TOO_MANY_FILES';
    }
  }
  
  return 'MERGE_FAILED';
}

/**
 * AppError 객체를 생성합니다.
 * @param error - 발생한 에러
 * @returns AppError 객체
 */
export function createAppError(error: unknown): AppError {
  return {
    message: getErrorMessage(error),
    code: getErrorCode(error),
  };
}
