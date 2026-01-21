import type { Metadata } from 'next';
import {
  Shield,
  Zap,
  FileStack,
  MousePointerClick,
  Lock,
  Download,
} from 'lucide-react';
import {
  HeroSection,
  FeatureSection,
  BenefitSection,
  FAQSection,
  CTASection,
} from '@/components/seo';
import type { FAQItem, FeatureItem } from '@/components/seo';

// SEO 메타데이터
export const metadata: Metadata = {
  title: 'PDF 합치기 무료 - 온라인 PDF 병합 도구 | PDF Merger Pro',
  description:
    '무료 온라인 PDF 합치기 서비스입니다. 여러 PDF 파일을 하나로 병합하세요. 설치 없이 브라우저에서 바로 사용 가능하며, 파일이 서버에 업로드되지 않아 100% 안전합니다.',
  keywords: [
    'PDF 합치기',
    'PDF 병합',
    'PDF 합치기 무료',
    '온라인 PDF 병합',
    'PDF 파일 합치기',
    'PDF merger',
    'PDF combiner',
    '무료 PDF 도구',
  ],
  alternates: {
    canonical: 'https://pdf-merger-pro.vercel.app',
  },
  openGraph: {
    title: 'PDF 합치기 무료 - 온라인 PDF 병합 도구',
    description:
      '무료로 PDF 파일을 병합하세요. 브라우저에서 직접 처리되어 100% 안전합니다.',
    url: 'https://pdf-merger-pro.vercel.app',
  },
};

// 기능 목록
const features: FeatureItem[] = [
  {
    icon: Shield,
    title: '100% 개인정보 보호',
    description:
      '모든 PDF 처리는 브라우저에서 이루어집니다. 파일이 서버로 전송되지 않아 완벽한 프라이버시가 보장됩니다.',
  },
  {
    icon: Zap,
    title: '빠른 처리 속도',
    description:
      '최신 웹 기술을 활용하여 대용량 PDF 파일도 빠르게 병합할 수 있습니다. 최대 50개 파일까지 한 번에 처리 가능합니다.',
  },
  {
    icon: FileStack,
    title: '다양한 옵션 지원',
    description:
      '북마크 자동 생성, 파일 크기 최적화 등 다양한 병합 옵션을 제공합니다. 원하는 페이지만 선택하여 병합할 수도 있습니다.',
  },
  {
    icon: MousePointerClick,
    title: '드래그 앤 드롭',
    description:
      '파일을 끌어다 놓기만 하면 됩니다. 직관적인 인터페이스로 순서 변경도 간편하게 할 수 있습니다.',
  },
  {
    icon: Lock,
    title: '설치 불필요',
    description:
      '별도의 소프트웨어 설치 없이 웹 브라우저만으로 PDF 합치기가 가능합니다. Windows, Mac, Linux 모두 지원합니다.',
  },
  {
    icon: Download,
    title: '무료 이용',
    description:
      '회원가입 없이 무료로 PDF 병합 서비스를 이용할 수 있습니다. 일일 사용 제한 없이 무제한으로 사용하세요.',
  },
];

// 혜택 목록
const benefits = [
  '여러 PDF 문서를 단 몇 초 만에 하나로 합칠 수 있습니다',
  '파일 순서를 자유롭게 변경하여 원하는 순서로 병합 가능합니다',
  '특정 페이지만 선택하여 필요한 부분만 추출하고 병합할 수 있습니다',
  '병합된 PDF에 자동으로 북마크를 추가하여 탐색을 용이하게 합니다',
  '파일 크기를 최적화하여 용량을 줄일 수 있습니다',
];

// FAQ 데이터
const faqItems: FAQItem[] = [
  {
    question: 'PDF 합치기는 무료인가요?',
    answer:
      '네, PDF Merger Pro는 완전 무료입니다. 회원가입 없이 바로 사용할 수 있으며, 일일 사용 제한도 없습니다. 프리미엄 기능을 이용하면 더 큰 파일도 처리할 수 있습니다.',
  },
  {
    question: '업로드한 PDF 파일은 안전한가요?',
    answer:
      '100% 안전합니다. 모든 PDF 처리는 사용자의 브라우저에서 직접 이루어지며, 파일이 서버로 전송되지 않습니다. 브라우저를 닫으면 모든 데이터가 즉시 삭제됩니다.',
  },
  {
    question: '한 번에 몇 개의 PDF를 병합할 수 있나요?',
    answer:
      '최대 50개의 PDF 파일을 한 번에 병합할 수 있습니다. 무료 버전에서는 총 50MB까지, 프리미엄 크레딧을 사용하면 200MB까지 처리 가능합니다.',
  },
  {
    question: '모바일에서도 PDF 합치기가 가능한가요?',
    answer:
      '네, 모바일 브라우저에서도 완벽하게 작동합니다. 스마트폰이나 태블릿에서 PDF 파일을 선택하여 병합할 수 있습니다. 모바일 최적화 페이지도 제공됩니다.',
  },
  {
    question: 'PDF 병합 순서를 변경할 수 있나요?',
    answer:
      '물론입니다. 파일 목록에서 드래그 앤 드롭으로 간편하게 순서를 변경할 수 있습니다. 원하는 순서대로 배치한 후 병합 버튼을 클릭하세요.',
  },
  {
    question: '특정 페이지만 선택하여 병합할 수 있나요?',
    answer:
      '네, 각 PDF 파일에서 원하는 페이지만 선택하여 병합할 수 있습니다. 파일 목록에서 페이지 선택 옵션을 사용하여 필요한 페이지를 지정하세요.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* 히어로 섹션 - H1 포함 */}
      <HeroSection
        badge="무료 온라인 도구"
        title="PDF 합치기 - 여러 파일을 하나로 병합"
        subtitle="설치 없이 브라우저에서 바로 PDF 파일을 합치세요. 모든 처리는 로컬에서 이루어져 파일이 외부로 전송되지 않습니다."
        ctaText="PDF 병합 시작하기"
        ctaHref="/tool"
        secondaryCtaText="기능 살펴보기"
        secondaryCtaHref="#features"
      />

      {/* 기능 섹션 - H2 포함 */}
      <div id="features">
        <FeatureSection
          title="왜 PDF Merger Pro를 선택해야 할까요?"
          subtitle="빠르고 안전한 PDF 병합 서비스를 무료로 경험하세요"
          features={features}
        />
      </div>

      {/* 혜택 섹션 - H2 포함 */}
      <BenefitSection
        title="PDF 합치기로 업무 효율성을 높이세요"
        benefits={benefits}
      />

      {/* 사용 방법 섹션 - H2 포함 */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            PDF 합치기 3단계 사용법
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'PDF 파일 선택',
                desc: '합칠 PDF 파일을 드래그하거나 클릭하여 선택하세요.',
              },
              {
                step: '2',
                title: '순서 조정',
                desc: '드래그 앤 드롭으로 원하는 순서대로 파일을 배치하세요.',
              },
              {
                step: '3',
                title: '병합 & 다운로드',
                desc: '병합 버튼을 클릭하고 완성된 PDF를 다운로드하세요.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ 섹션 - H2 포함 */}
      <FAQSection
        title="PDF 합치기 자주 묻는 질문"
        items={faqItems}
      />

      {/* CTA 섹션 */}
      <CTASection
        title="지금 바로 PDF 파일을 병합하세요"
        description="회원가입 없이 무료로 시작할 수 있습니다. 안전하고 빠른 PDF 병합을 경험해보세요."
        ctaText="PDF 합치기 시작"
        ctaHref="/tool"
      />
    </>
  );
}
