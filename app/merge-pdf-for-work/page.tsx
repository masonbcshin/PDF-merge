import type { Metadata } from 'next';
import {
  Briefcase,
  FileCheck,
  Clock,
  Users,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react';
import {
  HeroSection,
  FeatureSection,
  BenefitSection,
  FAQSection,
  CTASection,
} from '@/components/seo';
import type { FAQItem, FeatureItem } from '@/components/seo';

// SEO 메타데이터 - 업무용 특화
export const metadata: Metadata = {
  title: '업무용 PDF 병합 - 비즈니스 문서 합치기 | PDF Merger Pro',
  description:
    '업무용 PDF 병합 도구입니다. 계약서, 보고서, 제안서 등 비즈니스 문서를 효율적으로 합치세요. 기업 보안 기준을 충족하며, 대용량 파일도 빠르게 처리합니다.',
  keywords: [
    '업무용 PDF 병합',
    '비즈니스 PDF 합치기',
    '회사 PDF 병합',
    '계약서 PDF 합치기',
    '보고서 PDF 병합',
    '문서 관리',
    '업무 효율화',
    'PDF 정리',
  ],
  alternates: {
    canonical: 'https://pdf-merger-pro.vercel.app/merge-pdf-for-work',
  },
  openGraph: {
    title: '업무용 PDF 병합 - 비즈니스 문서 합치기',
    description:
      '기업 보안 기준을 충족하는 안전한 PDF 병합 도구입니다. 계약서, 보고서를 효율적으로 합치세요.',
    url: 'https://pdf-merger-pro.vercel.app/merge-pdf-for-work',
  },
};

// 업무용 기능 목록
const workFeatures: FeatureItem[] = [
  {
    icon: Briefcase,
    title: '비즈니스 문서 최적화',
    description:
      '계약서, 견적서, 제안서, 보고서 등 업무 문서에 최적화되어 있습니다. 문서별 북마크 자동 생성으로 탐색이 편리합니다.',
  },
  {
    icon: ShieldCheck,
    title: '기업 보안 기준 충족',
    description:
      '모든 파일이 로컬에서만 처리되어 기업 보안 정책을 준수합니다. 기밀 문서도 안심하고 병합할 수 있습니다.',
  },
  {
    icon: Clock,
    title: '업무 시간 절약',
    description:
      '드래그 앤 드롭으로 빠르게 문서를 정리하세요. 반복적인 문서 작업 시간을 획기적으로 줄일 수 있습니다.',
  },
  {
    icon: FileCheck,
    title: '대용량 처리',
    description:
      '최대 50개 파일, 200MB까지 한 번에 처리 가능합니다. 대규모 프로젝트 문서도 효율적으로 관리하세요.',
  },
  {
    icon: Users,
    title: '팀 협업 지원',
    description:
      '여러 팀원이 작성한 문서를 하나로 합쳐 공유하기 편리합니다. 회의 자료, 프로젝트 보고서 정리에 최적화되어 있습니다.',
  },
  {
    icon: FolderOpen,
    title: '템플릿 기능',
    description:
      '자주 사용하는 문서 구성을 템플릿으로 저장하세요. 표지-본문-첨부 등 반복되는 문서 구조를 빠르게 적용할 수 있습니다.',
  },
];

// 업무 시 혜택
const workBenefits = [
  '계약서, 부록, 첨부서류를 하나의 PDF로 통합하여 관리',
  '여러 부서의 보고서를 종합 보고서로 쉽게 병합',
  '프로젝트 제안서와 포트폴리오를 깔끔하게 정리',
  '회의록과 관련 자료를 하나로 묶어 공유',
  '기밀 문서도 서버 전송 없이 안전하게 처리',
  '반복 작업을 템플릿으로 자동화하여 시간 절약',
];

// 업무용 FAQ
const workFaqItems: FAQItem[] = [
  {
    question: '기밀 문서를 병합해도 안전한가요?',
    answer:
      '네, 완벽히 안전합니다. 모든 PDF 처리는 사용자의 브라우저 내에서만 이루어지며, 파일이 외부 서버로 전송되지 않습니다. 기업의 보안 정책과 개인정보 보호 규정을 완벽히 준수합니다.',
  },
  {
    question: '회사에서 사용해도 되나요?',
    answer:
      '물론입니다. 상업적 용도로 무료 사용이 가능합니다. 파일이 서버로 전송되지 않아 기업 보안 정책에도 부합하며, IT 부서의 승인 없이도 안전하게 사용할 수 있습니다.',
  },
  {
    question: '대용량 문서도 처리할 수 있나요?',
    answer:
      '네, 프리미엄 크레딧을 사용하면 최대 200MB까지 처리 가능합니다. 대규모 프로젝트 보고서, 기술 문서, 매뉴얼 등 대용량 문서도 효율적으로 병합할 수 있습니다.',
  },
  {
    question: '문서에 북마크를 자동으로 추가할 수 있나요?',
    answer:
      '네, 병합 옵션에서 "북마크 자동 생성"을 선택하면 각 원본 파일이 북마크로 표시됩니다. 긴 문서에서도 원하는 섹션으로 빠르게 이동할 수 있어 업무 효율이 높아집니다.',
  },
  {
    question: '여러 명이 작업한 문서를 합칠 때 순서를 정할 수 있나요?',
    answer:
      '물론입니다. 드래그 앤 드롭으로 간편하게 문서 순서를 조정할 수 있습니다. 표지-목차-본문-부록 순으로 정렬하거나, 팀원별/부서별로 원하는 순서대로 배치하세요.',
  },
  {
    question: '정기적으로 같은 형식의 문서를 만들어야 하는데요?',
    answer:
      '템플릿 기능을 활용하세요. 자주 사용하는 문서 구성(예: 표지-요약-상세내용-첨부)을 템플릿으로 저장하면, 다음에 같은 형식의 문서를 빠르게 만들 수 있습니다.',
  },
];

export default function MergePdfForWorkPage() {
  return (
    <>
      {/* 히어로 섹션 - H1 포함 */}
      <HeroSection
        badge="업무 효율화 도구"
        title="업무용 PDF 병합 - 비즈니스 문서를 효율적으로"
        subtitle="계약서, 보고서, 제안서 등 업무 문서를 안전하고 빠르게 합치세요. 기업 보안 기준을 충족하며, 서버로 파일이 전송되지 않아 기밀 문서도 안심하고 처리할 수 있습니다."
        ctaText="업무용 PDF 병합 시작"
        ctaHref="/tool"
        secondaryCtaText="기능 살펴보기"
        secondaryCtaHref="#work-features"
      />

      {/* 업무용 기능 섹션 - H2 포함 */}
      <div id="work-features">
        <FeatureSection
          title="업무 환경에 최적화된 PDF 병합 도구"
          subtitle="비즈니스 문서 관리의 효율성을 높이는 전문 기능을 제공합니다"
          features={workFeatures}
        />
      </div>

      {/* 업무 혜택 섹션 - H2 포함 */}
      <BenefitSection
        title="문서 관리 업무 시간을 절약하세요"
        benefits={workBenefits}
        imageSide="left"
      />

      {/* 활용 사례 섹션 - H2 포함 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            업무용 PDF 병합 활용 사례
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: '계약서 관리',
                desc: '본 계약서, 별첨, 인감증명서 등을 하나의 PDF로 통합하여 체계적으로 관리하세요.',
                icon: '📄',
              },
              {
                title: '프로젝트 보고서',
                desc: '팀원들이 작성한 섹션별 보고서를 합쳐 종합 프로젝트 보고서를 완성하세요.',
                icon: '📊',
              },
              {
                title: '제안서 작성',
                desc: '회사 소개, 기술 제안, 견적서, 포트폴리오를 통합하여 전문적인 제안서를 만드세요.',
                icon: '💼',
              },
              {
                title: '회의 자료',
                desc: '프레젠테이션, 참고 자료, 회의록을 하나로 묶어 참석자들과 공유하세요.',
                icon: '📋',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF 병합 도구 섹션 */}
      <section id="pdf-merger-work" className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            업무 문서를 지금 바로 병합하세요
          </h2>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 mb-6">
              기업 보안 정책을 준수하는 안전한 PDF 병합 도구입니다. 파일이 서버로 전송되지 않습니다.
            </p>
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">업무 문서를 여기에 드롭하거나 클릭하여 선택</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 - H2 포함 */}
      <FAQSection
        title="업무용 PDF 병합 자주 묻는 질문"
        items={workFaqItems}
      />

      {/* CTA 섹션 */}
      <CTASection
        title="업무 문서 관리를 더 효율적으로"
        description="반복적인 문서 작업에서 벗어나세요. 안전하고 빠른 PDF 병합으로 업무 시간을 절약하세요."
        ctaText="업무용 PDF 병합 시작"
        ctaHref="/tool"
      />
    </>
  );
}
