'use client';

import { useState, memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Template } from '@/types/pdf';
import { TEMPLATES, getTemplateIcon, getCategoryName } from '@/lib/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
}

function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Template['category'] | 'all'
  >('all');

  const categories: Array<Template['category'] | 'all'> = [
    'all',
    'legal',
    'real-estate',
    'student',
    'business',
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📋</span>
          <div className="text-left">
            <p className="font-medium text-gray-900">템플릿으로 시작하기</p>
            <p className="text-sm text-gray-500">
              자주 사용하는 문서 조합을 빠르게 선택하세요
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        )}
      </button>

      {/* 확장된 내용 */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* 카테고리 필터 */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category === 'all' ? '전체' : getCategoryName(category)}
                </button>
              ))}
            </div>
          </div>

          {/* 템플릿 그리드 */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => {
                const Icon = getTemplateIcon(template.category);
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition-colors group"
                  >
                    <div className="p-2 bg-white rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Icon
                        className="w-5 h-5 text-gray-600 group-hover:text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-blue-900">
                        {template.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.files.slice(0, 3).map((file, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              file.required
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {file.placeholder}
                          </span>
                        ))}
                        {template.files.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            +{template.files.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TemplateSelector);
