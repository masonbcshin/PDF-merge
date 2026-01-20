'use client';

import { useCallback, memo } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileWarning, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/pdfUtils';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

// 파일당 최대 크기: 20MB
const MAX_FILE_SIZE_PER_FILE = 20 * 1024 * 1024;

// 허용되는 MIME 타입
const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
};

function FileUploader({ onFilesAdded, disabled = false }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    },
    [onFilesAdded]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE_PER_FILE,
    multiple: true,
    disabled,
  });

  // 파일 거부 사유 메시지 생성
  const getRejectionMessage = (rejection: FileRejection): string => {
    const errors = rejection.errors;
    const messages: string[] = [];

    for (const error of errors) {
      switch (error.code) {
        case 'file-too-large':
          messages.push(
            `파일이 너무 큽니다 (최대 ${formatFileSize(MAX_FILE_SIZE_PER_FILE)})`
          );
          break;
        case 'file-invalid-type':
          messages.push('PDF 파일만 업로드할 수 있습니다');
          break;
        default:
          messages.push(error.message);
      }
    }

    return messages.join(', ');
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 md:p-12
          transition-all duration-200 cursor-pointer
          ${
            disabled
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
              : isDragReject
              ? 'bg-red-50 border-red-400'
              : isDragActive
              ? 'bg-blue-50 border-blue-400 scale-[1.02]'
              : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center">
          {/* 아이콘 */}
          <div
            className={`
              p-4 rounded-full mb-4 transition-colors
              ${
                isDragReject
                  ? 'bg-red-100'
                  : isDragActive
                  ? 'bg-blue-100'
                  : 'bg-gray-200'
              }
            `}
          >
            {isDragReject ? (
              <FileWarning
                className="w-8 h-8 text-red-500"
                aria-hidden="true"
              />
            ) : (
              <Upload
                className={`w-8 h-8 ${
                  isDragActive ? 'text-blue-500' : 'text-gray-500'
                }`}
                aria-hidden="true"
              />
            )}
          </div>

          {/* 메시지 */}
          {isDragReject ? (
            <>
              <p className="text-lg font-semibold text-red-600">
                PDF 파일만 업로드할 수 있습니다
              </p>
              <p className="mt-1 text-sm text-red-500">
                다른 형식의 파일은 지원되지 않습니다
              </p>
            </>
          ) : isDragActive ? (
            <>
              <p className="text-lg font-semibold text-blue-600">
                여기에 놓으세요!
              </p>
              <p className="mt-1 text-sm text-blue-500">
                파일을 놓으면 자동으로 추가됩니다
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700">
                PDF 파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="mt-1 text-sm text-gray-500">
                여러 파일을 한 번에 선택할 수 있습니다
              </p>
              <p className="mt-2 text-xs text-gray-400">
                최대 파일 크기: {formatFileSize(MAX_FILE_SIZE_PER_FILE)} / 파일
              </p>
            </>
          )}
        </div>
      </div>

      {/* 파일 거부 알림 */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-red-800">
                일부 파일을 추가할 수 없습니다
              </p>
              <ul className="mt-2 space-y-1">
                {fileRejections.map((rejection, index) => (
                  <li key={index} className="text-sm text-red-700">
                    <span className="font-medium">{rejection.file.name}</span>
                    {' - '}
                    {getRejectionMessage(rejection)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          PDF 형식만 지원
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          여러 파일 동시 업로드 가능
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-400 rounded-full" />
          드래그 앤 드롭 지원
        </span>
      </div>
    </div>
  );
}

export default memo(FileUploader);
