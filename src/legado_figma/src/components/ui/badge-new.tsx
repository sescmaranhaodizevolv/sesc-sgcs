import * as React from "react"
import { cn } from "./utils"

export interface BadgeNewProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'purple' | 'orange';
  weight?: 'heavy' | 'medium' | 'light';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

function BadgeNew({ 
  className, 
  intent = 'neutral', 
  weight = 'medium', 
  size = 'md', 
  icon, 
  children, 
  ...props 
}: BadgeNewProps) {
  
  // Size classes - todos com 12px e alturas reduzidas
  const sizeClasses = {
    sm: 'h-[20px] px-2 text-[12px]',
    md: 'h-[22px] px-2.5 text-[12px]',
    lg: 'h-6 px-3 text-[12px]',
  };

  // Color mappings for each intent and weight combination
  const getColorClasses = () => {
    const colorMap = {
      success: {
        heavy: 'bg-[#1f8f2e] text-white',
        medium: 'bg-[#d4f0d8] text-[#0d5e1a]', // Melhor contraste
        light: 'border border-[#9ad3a3] text-[#1f8f2e] bg-transparent',
      },
      info: {
        heavy: 'bg-[#126aaf] text-white',
        medium: 'bg-[#d6ecff] text-[#0a4a7d]', // Melhor contraste
        light: 'border border-[#a8c7e6] text-[#126aaf] bg-transparent',
      },
      warning: {
        heavy: 'bg-[#e1ad00] text-white',
        medium: 'bg-[#ffd966] text-[#8f6700]', // Tom mais escuro de amarelo com melhor contraste
        light: 'border border-[#f2d48a] text-[#e1ad00] bg-transparent',
      },
      danger: {
        heavy: 'bg-[#c8142c] text-white',
        medium: 'bg-[#fdb0ae] text-[#8f0e1f]', // Melhor contraste
        light: 'border border-[#f3a5b3] text-[#c8142c] bg-transparent',
      },
      neutral: {
        heavy: 'bg-[#7a7a88] text-white',
        medium: 'bg-[#e8e8ea] text-[#4a4a54]', // Melhor contraste
        light: 'border border-[#cfd4da] text-[#7a7a88] bg-transparent',
      },
      purple: {
        heavy: 'bg-[#7c3aed] text-white',
        medium: 'bg-[#ede9fe] text-[#5b21b6]',
        light: 'border border-[#c4b5fd] text-[#7c3aed] bg-transparent',
      },
      orange: {
        heavy: 'bg-[#ea580c] text-white',
        medium: 'bg-[#fed7aa] text-[#9a3412]',
        light: 'border border-[#fdba74] text-[#ea580c] bg-transparent',
      },
    };

    return colorMap[intent][weight];
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full select-none leading-none gap-1.5',
        sizeClasses[size],
        getColorClasses(),
        className
      )}
      {...props}
    >
      {icon && <span className="size-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="leading-none font-medium">{children}</span>
    </span>
  )
}

export { BadgeNew }