import type { Template } from '@/types/pdf';
import {
  Scale,
  Home,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

/**
 * 카테고리별 PDF 병합 템플릿
 */
export const TEMPLATES: Template[] = [
  // 법률 문서 템플릿
  {
    id: 'legal-contract',
    name: '계약서 패키지',
    description: '계약서, 약관, 서명 페이지를 순서대로 병합합니다.',
    category: 'legal',
    files: [
      { placeholder: '표지', required: true, order: 1 },
      { placeholder: '계약 본문', required: true, order: 2 },
      { placeholder: '약관 및 조건', required: false, order: 3 },
      { placeholder: '서명 페이지', required: true, order: 4 },
      { placeholder: '부록', required: false, order: 5 },
    ],
  },
  {
    id: 'legal-lawsuit',
    name: '소송 서류 세트',
    description: '소장, 증거자료, 참고문헌을 하나의 문서로 병합합니다.',
    category: 'legal',
    files: [
      { placeholder: '소장', required: true, order: 1 },
      { placeholder: '증거자료 1', required: false, order: 2 },
      { placeholder: '증거자료 2', required: false, order: 3 },
      { placeholder: '참고문헌', required: false, order: 4 },
    ],
  },
  
  // 부동산 문서 템플릿
  {
    id: 'realestate-sale',
    name: '부동산 매매 서류',
    description: '매매계약서, 등기부등본, 신분증 사본 등을 병합합니다.',
    category: 'real-estate',
    files: [
      { placeholder: '매매계약서', required: true, order: 1 },
      { placeholder: '등기부등본', required: true, order: 2 },
      { placeholder: '토지대장', required: false, order: 3 },
      { placeholder: '신분증 사본', required: true, order: 4 },
      { placeholder: '인감증명서', required: false, order: 5 },
    ],
  },
  {
    id: 'realestate-lease',
    name: '임대차 계약 세트',
    description: '임대차계약서와 관련 서류를 하나로 묶습니다.',
    category: 'real-estate',
    files: [
      { placeholder: '임대차계약서', required: true, order: 1 },
      { placeholder: '등기부등본', required: true, order: 2 },
      { placeholder: '신분증 사본', required: true, order: 3 },
      { placeholder: '보증보험 가입증', required: false, order: 4 },
    ],
  },
  
  // 학생용 템플릿
  {
    id: 'student-thesis',
    name: '논문 제출용',
    description: '표지, 목차, 본문, 참고문헌, 부록을 하나의 PDF로 병합합니다.',
    category: 'student',
    files: [
      { placeholder: '표지', required: true, order: 1 },
      { placeholder: '초록/요약', required: false, order: 2 },
      { placeholder: '목차', required: true, order: 3 },
      { placeholder: '본문', required: true, order: 4 },
      { placeholder: '참고문헌', required: true, order: 5 },
      { placeholder: '부록', required: false, order: 6 },
    ],
  },
  {
    id: 'student-portfolio',
    name: '포트폴리오',
    description: '이력서, 자기소개서, 작업물을 하나의 포트폴리오로 만듭니다.',
    category: 'student',
    files: [
      { placeholder: '이력서', required: true, order: 1 },
      { placeholder: '자기소개서', required: false, order: 2 },
      { placeholder: '작업물 1', required: false, order: 3 },
      { placeholder: '작업물 2', required: false, order: 4 },
      { placeholder: '추천서', required: false, order: 5 },
    ],
  },
  
  // 비즈니스 템플릿
  {
    id: 'business-proposal',
    name: '사업 제안서',
    description: '제안서, 회사소개서, 견적서를 병합합니다.',
    category: 'business',
    files: [
      { placeholder: '표지', required: true, order: 1 },
      { placeholder: '회사소개서', required: false, order: 2 },
      { placeholder: '제안 본문', required: true, order: 3 },
      { placeholder: '견적서', required: true, order: 4 },
      { placeholder: '레퍼런스', required: false, order: 5 },
    ],
  },
  {
    id: 'business-report',
    name: '사업 보고서',
    description: '경영보고서, 재무제표, 분석자료를 하나로 묶습니다.',
    category: 'business',
    files: [
      { placeholder: '표지', required: true, order: 1 },
      { placeholder: '요약', required: false, order: 2 },
      { placeholder: '보고서 본문', required: true, order: 3 },
      { placeholder: '재무제표', required: false, order: 4 },
      { placeholder: '부록/첨부자료', required: false, order: 5 },
    ],
  },
];

/**
 * 카테고리에 해당하는 아이콘 컴포넌트를 반환합니다.
 * @param category - 템플릿 카테고리
 * @returns Lucide 아이콘 컴포넌트
 */
export function getTemplateIcon(
  category: Template['category']
): LucideIcon {
  switch (category) {
    case 'legal':
      return Scale;
    case 'real-estate':
      return Home;
    case 'student':
      return GraduationCap;
    case 'business':
      return Briefcase;
    default:
      return Briefcase;
  }
}

/**
 * 카테고리의 한글 이름을 반환합니다.
 * @param category - 템플릿 카테고리
 * @returns 카테고리 한글 이름
 */
export function getCategoryName(category: Template['category']): string {
  switch (category) {
    case 'legal':
      return '법률';
    case 'real-estate':
      return '부동산';
    case 'student':
      return '학생/학술';
    case 'business':
      return '비즈니스';
    default:
      return '기타';
  }
}

/**
 * 특정 카테고리의 템플릿만 필터링합니다.
 * @param category - 필터링할 카테고리
 * @returns 해당 카테고리의 템플릿 배열
 */
export function getTemplatesByCategory(
  category: Template['category']
): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}

/**
 * ID로 템플릿을 찾습니다.
 * @param id - 템플릿 ID
 * @returns 템플릿 또는 undefined
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
