// 从 Clerk 的服务端工具包中导入必要的函数
import { clerkMiddleware } from '@clerk/nextjs/server'

// 创建并导出中间件函数
export default clerkMiddleware()

// 配置中间件的运行规则
export const config = {
  // matcher 定义了中间件需要处理哪些路由
  matcher: [
    // 第一个规则：使用复杂的正则表达式匹配需要处理的路径
    // (?!_next|...) 表示排除一些不需要验证的路径，比如：
    // - _next（Next.js的内部文件）
    // - 静态文件（.html, .css, .js, .jpg等）
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    
    // 第二个规则：处理所有 API 路由
    // 匹配所有以 /api 或 /trpc 开头的路径
    // (.*)表示后面可以跟任何字符
    '/(api|trpc)(.*)',
  ],
}