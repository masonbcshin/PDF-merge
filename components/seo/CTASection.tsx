import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function CTASection({
  title,
  description,
  ctaText = '지금 바로 시작하기',
  ctaHref = '#pdf-merger',
}: CTASectionProps) {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
          {description}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-xl transition-colors"
        >
          {ctaText}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
