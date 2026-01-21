import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  badge?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  ctaText = 'PDF 병합 시작하기',
  ctaHref = '#pdf-merger',
  secondaryCtaText,
  secondaryCtaHref,
}: HeroSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {badge && (
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
            {badge}
          </span>
        )}
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          {secondaryCtaText && secondaryCtaHref && (
            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
