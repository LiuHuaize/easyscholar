// 从 Clerk 的服务端工具包中导入必要的函数
// clerkMiddleware: 用于处理用户认证的中间件
// createRouteMatcher: 用于创建路由匹配器，判断哪些路由可以公开访问
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 定义公开路由（不需要登录就能访问的页面）
// '/sign-in(.*)': 所有以 /sign-in 开头的路径，(.*)表示后面可以跟任何字符
// '/sign-up(.*)': 所有以 /sign-up 开头的路径
// '/': 网站的首页
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/'
])

// 创建并导出中间件函数
// 中间件会在每个页面请求之前运行，用于检查用户是否有权限访问该页面
export default clerkMiddleware(async (auth, request) => {
  // 如果请求的不是公开路由
  if (!isPublicRoute(request)) {
    // 则要求用户必须登录才能访问
    // 如果用户未登录，会自动重定向到登录页面
    await auth.protect()
  }
})

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