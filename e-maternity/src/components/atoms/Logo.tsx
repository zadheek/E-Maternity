// components/atoms/Logo.tsx
import { Icons } from '@/components/icons';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className="flex items-center gap-2">
      <Icons.Baby className={`${sizeClasses[size]} text-[#E91E63]`} />
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-[#212121]`}>
          E-Maternity
        </span>
      )}
    </Link>
  );
}
