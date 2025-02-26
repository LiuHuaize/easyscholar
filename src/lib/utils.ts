import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 添加一个帮助函数来处理动态类名
export function getDynamicClassName(baseClass: string, conditionalClasses: Record<string, boolean>) {
  return cn(baseClass, Object.entries(conditionalClasses)
    .filter(([_, value]) => value)
    .map(([className]) => className)
  )
}
