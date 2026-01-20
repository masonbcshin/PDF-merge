'use client';

import { memo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { PDFFile } from '@/types/pdf';
import { formatFileSize } from '@/lib/pdfUtils';

interface PDFListProps {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onUpdateSelectedPages?: (id: string, pages: number[]) => void;
}

interface SortableItemProps {
  file: PDFFile;
  onRemove: (id: string) => void;
  onUpdateSelectedPages?: (id: string, pages: number[]) => void;
}

function SortableItem({
  file,
  onRemove,
  onUpdateSelectedPages,
}: SortableItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pageInput, setPageInput] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    
    if (!onUpdateSelectedPages) return;
    
    if (value.trim() === '') {
      onUpdateSelectedPages(file.id, []);
      return;
    }

    // 페이지 범위 파싱 (예: "1-3, 5, 7-9")
    const pages: number[] = [];
    const parts = value.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= file.pageCount && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= file.pageCount && !pages.includes(num)) {
          pages.push(num);
        }
      }
    }

    onUpdateSelectedPages(file.id, pages.sort((a, b) => a - b));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border rounded-xl shadow-sm overflow-hidden
        transition-shadow
        ${isDragging ? 'shadow-lg ring-2 ring-blue-400 z-10' : 'hover:shadow-md'}
      `}
    >
      <div className="flex items-center gap-3 p-4">
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing touch-none"
          aria-label="드래그하여 순서 변경"
        >
          <GripVertical className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </button>

        {/* 파일 아이콘 */}
        <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
          <FileText className="w-6 h-6 text-red-500" aria-hidden="true" />
        </div>

        {/* 파일 정보 */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)} &middot; {file.pageCount}페이지
            {file.selectedPages && file.selectedPages.length > 0 && (
              <span className="text-blue-600">
                {' '}
                (선택: {file.selectedPages.length}페이지)
              </span>
            )}
          </p>
        </div>

        {/* 확장 버튼 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isExpanded ? '접기' : '페이지 선택 펼치기'}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
          )}
        </button>

        {/* 삭제 버튼 */}
        <button
          onClick={() => onRemove(file.id)}
          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          aria-label={`${file.name} 삭제`}
        >
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* 확장된 페이지 선택 영역 */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            특정 페이지만 병합 (선택사항)
          </label>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => handlePageInputChange(e.target.value)}
            placeholder={`예: 1-3, 5, 7-9 (전체: 1-${file.pageCount})`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            비워두면 모든 페이지가 포함됩니다
          </p>
        </div>
      )}
    </div>
  );
}

function PDFList({
  files,
  onRemove,
  onReorder,
  onUpdateSelectedPages,
}: PDFListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          아직 추가된 PDF 파일이 없습니다
        </p>
        <p className="mt-1 text-sm text-gray-500">
          위 영역에 파일을 드래그하거나 클릭하여 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-gray-700">
          {files.length}개의 파일 (드래그하여 순서 변경)
        </p>
        <p className="text-xs text-gray-500">
          총 {files.reduce((acc, f) => acc + f.pageCount, 0)}페이지
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={files.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {files.map((file) => (
              <SortableItem
                key={file.id}
                file={file}
                onRemove={onRemove}
                onUpdateSelectedPages={onUpdateSelectedPages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default memo(PDFList);
