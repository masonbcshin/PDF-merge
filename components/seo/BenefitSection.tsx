import { Check } from 'lucide-react';

interface BenefitSectionProps {
  title: string;
  benefits: string[];
  imageSide?: 'left' | 'right';
}

export default function BenefitSection({ title, benefits, imageSide = 'right' }: BenefitSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className={`flex flex-col ${imageSide === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}>
          {/* 텍스트 콘텐츠 */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </span>
                  <span className="text-gray-700 leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 이미지 플레이스홀더 */}
          <div className="flex-1 w-full">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-blue-700 font-medium">PDF 병합 도구</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
