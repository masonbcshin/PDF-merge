import type { Metadata } from 'next';
import {
  Smartphone,
  Cloud,
  Zap,
  WifiOff,
  Battery,
  TouchpadIcon,
} from 'lucide-react';
import {
  HeroSection,
  FeatureSection,
  BenefitSection,
  FAQSection,
  CTASection,
} from '@/components/seo';
import type { FAQItem, FeatureItem } from '@/components/seo';

// SEO 메타데이터 - 모바일 특화
export const metadata: Metadata = {
  title: '모바일 PDF 합치기 - 스마트폰에서 PDF 병합 | PDF Merger Pro',
  description:
    '스마트폰에서 PDF 파일을 합치세요. 아이폰, 안드로이드 모바일 브라우저에서 앱 설치 없이 바로 PDF 병합이 가능합니다. 터치 최적화된 직관적인 인터페이스를 제공합니다.',
  keywords: [
    '모바일 PDF 합치기',
    '스마트폰 PDF 병합',
    '아이폰 PDF 합치기',
    '안드로이드 PDF 병합',
    '모바일 PDF 편집',
    '핸드폰 PDF 합치기',
    'PDF 앱',
    '무료 PDF 모바일',
  ],
  alternates: {
    canonical: 'https://pdf-merger-pro.vercel.app/merge-pdf-mobile',
  },
  openGraph: {
    title: '모바일 PDF 합치기 - 스마트폰에서 PDF 병합',
    description:
      '스마트폰에서 앱 설치 없이 PDF 파일을 합치세요. 터치 최적화된 인터페이스로 쉽게 사용할 수 있습니다.',
    url: 'https://pdf-merger-pro.vercel.app/merge-pdf-mobile',
  },
};

// 모바일 특화 기능 목록
const mobileFeatures: FeatureItem[] = [
  {
    icon: Smartphone,
    title: '모바일 최적화 UI',
    description:
      '터치 제스처에 최적화된 인터페이스로 스마트폰에서도 편리하게 PDF를 병합할 수 있습니다. 드래그로 순서 변경도 가능합니다.',
  },
  {
    icon: Cloud,
    title: '클라우드 연동',
    description:
      '아이클라우드, 구글 드라이브, 드롭박스 등 클라우드 저장소에서 직접 PDF 파일을 불러올 수 있습니다.',
  },
  {
    icon: Zap,
    title: '빠른 처리',
    description:
      '모바일 기기에서도 빠른 속도로 PDF를 병합합니다. 최적화된 알고리즘으로 배터리 소모도 최소화했습니다.',
  },
  {
    icon: WifiOff,
    title: '오프라인 지원',
    description:
      '인터넷 연결 없이도 PDF 병합이 가능합니다. 모든 처리는 기기 내에서 이루어지므로 데이터 요금 걱정이 없습니다.',
  },
  {
    icon: Battery,
    title: '배터리 효율적',
    description:
      '모바일 기기의 배터리를 효율적으로 사용합니다. 백그라운드 처리 최적화로 다른 앱 사용에 영향을 주지 않습니다.',
  },
  {
    icon: TouchpadIcon,
    title: '터치 제스처',
    description:
      '파일 순서 변경, 페이지 선택 등 모든 기능을 터치 제스처로 직관적으로 조작할 수 있습니다.',
  },
];

// 모바일 사용 시 혜택
const mobileBenefits = [
  '앱 설치 없이 모바일 브라우저에서 바로 PDF 합치기 가능',
  '아이폰, 안드로이드 모든 스마트폰에서 동일하게 작동',
  '터치 드래그로 직관적인 파일 순서 변경',
  '클라우드 저장소에서 바로 파일 선택 가능',
  '이동 중에도 빠르게 PDF 문서 정리',
  '모바일 데이터 사용 없이 로컬에서 처리',
];

// 모바일 FAQ
const mobileFaqItems: FAQItem[] = [
  {
    question: '아이폰에서 PDF 합치기가 가능한가요?',
    answer:
      '네, 아이폰의 Safari 또는 Chrome 브라우저에서 바로 PDF를 병합할 수 있습니다. iOS 14 이상에서 최적의 성능을 제공하며, 별도의 앱 설치가 필요 없습니다.',
  },
  {
    question: '안드로이드 폰에서도 사용할 수 있나요?',
    answer:
      '물론입니다. 안드로이드 Chrome, Samsung Internet 등 대부분의 브라우저에서 완벽하게 작동합니다. Android 8.0 이상을 권장합니다.',
  },
  {
    question: '모바일에서 파일 순서를 변경할 수 있나요?',
    answer:
      '네, 터치 드래그 앤 드롭으로 간편하게 파일 순서를 변경할 수 있습니다. 파일을 길게 누른 후 원하는 위치로 드래그하세요.',
  },
  {
    question: '클라우드에 있는 PDF도 병합할 수 있나요?',
    answer:
      '네, 아이클라우드, 구글 드라이브, 드롭박스, OneDrive 등에 저장된 PDF 파일을 직접 선택하여 병합할 수 있습니다. 파일 선택 시 클라우드 저장소를 선택하세요.',
  },
  {
    question: '모바일 데이터를 사용하나요?',
    answer:
      '처음 페이지를 로드할 때만 데이터를 사용합니다. PDF 병합 과정은 모두 기기 내에서 처리되므로 추가 데이터 사용이 없습니다. Wi-Fi 환경에서 접속 후 오프라인으로도 사용 가능합니다.',
  },
  {
    question: '태블릿에서도 사용할 수 있나요?',
    answer:
      '네, iPad, 안드로이드 태블릿, Galaxy Tab 등 모든 태블릿에서 사용 가능합니다. 큰 화면에서는 더욱 편리하게 파일을 관리하고 병합할 수 있습니다.',
  },
];

export default function MergePdfMobilePage() {
  return (
    <>
      {/* 히어로 섹션 - H1 포함 */}
      <HeroSection
        badge="모바일 최적화"
        title="모바일에서 PDF 합치기 - 스마트폰으로 간편하게"
        subtitle="아이폰, 안드로이드 어디서나 앱 설치 없이 PDF 파일을 병합하세요. 터치에 최적화된 직관적인 인터페이스로 이동 중에도 쉽게 사용할 수 있습니다."
        ctaText="모바일 PDF 병합 시작"
        ctaHref="/tool"
        secondaryCtaText="기능 살펴보기"
        secondaryCtaHref="#mobile-features"
      />

      {/* 모바일 기능 섹션 - H2 포함 */}
      <div id="mobile-features">
        <FeatureSection
          title="스마트폰에 최적화된 PDF 합치기"
          subtitle="모바일 환경에서 가장 편리하게 PDF를 병합할 수 있도록 설계되었습니다"
          features={mobileFeatures}
        />
      </div>

      {/* 모바일 혜택 섹션 - H2 포함 */}
      <BenefitSection
        title="언제 어디서나 PDF 병합을"
        benefits={mobileBenefits}
        imageSide="left"
      />

      {/* 사용법 안내 섹션 - H2 포함 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            모바일 PDF 합치기 사용 방법
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: '파일 선택',
                desc: '스마트폰에서 PDF 파일을 선택하거나 클라우드에서 불러오세요.',
              },
              {
                step: '2',
                title: '순서 조정',
                desc: '터치 드래그로 원하는 순서대로 파일을 배치하세요.',
              },
              {
                step: '3',
                title: '병합 & 저장',
                desc: '병합 버튼을 탭하고 완성된 PDF를 저장하세요.',
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

      {/* PDF 병합 도구 섹션 */}
      <section id="pdf-merger-mobile" className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            지금 모바일에서 PDF 병합하기
          </h2>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 mb-6">
              모바일 최적화된 PDF 병합 도구입니다. 화면을 터치하여 파일을 선택하세요.
            </p>
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">터치하여 PDF 파일 선택</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ 섹션 - H2 포함 */}
      <FAQSection
        title="모바일 PDF 합치기 자주 묻는 질문"
        items={mobileFaqItems}
      />

      {/* CTA 섹션 */}
      <CTASection
        title="스마트폰에서 바로 PDF를 병합하세요"
        description="앱 설치 없이 브라우저에서 바로 시작하세요. 아이폰, 안드로이드 모두 지원합니다."
        ctaText="모바일 PDF 합치기 시작"
        ctaHref="/tool"
      />
    </>
  );
}
