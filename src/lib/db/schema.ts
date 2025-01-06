import { integer, pgTable, varchar, pgEnum, timestamp, text, boolean, json, real } from "drizzle-orm/pg-core";

// ============= 类型定义区域 =============

/**
 * 论文翻译内容的类型定义
 * 所有字段都是可选的，使用 ? 表示
 */
type PaperTranslations = {
  title?: string;            // 论文标题的翻译
  abstractSummary?: string;  // 摘要总结的翻译
  abstract?: string;         // 摘要的翻译
  methodology?: string;      // 方法论的翻译
  limitations?: string;      // 局限性的翻译
  mainFindings?: string;     // 主要发现的翻译
};

/**
 * 单篇论文的数据结构
 * 包含原文和翻译内容
 */
type Paper = {
  // 原文信息
  title: string;             // 论文标题（原文）
  doi: string;              // 论文的 DOI 标识符
  journalName: string;      // 期刊名称
  authors: string[];        // 作者列表，使用字符串数组
  citationCount: number;    // 引用次数
  
  // 原文可选字段
  abstractSummary?: string; // 可选的摘要总结（原文）
  abstract?: string;        // 可选的完整摘要（原文）
  methodology?: string;     // 可选的方法论（原文）
  limitations?: string;     // 可选的研究局限性（原文）
  mainFindings?: string;    // 可选的主要研究发现（原文）
  
  // 所有内容的翻译版本
  translations?: PaperTranslations; // 可选的翻译内容，包含标题翻译
};

/**
 * 论文数据的集合类型
 */
type PapersData = {
  papers: Paper[];          // 论文数组
};

/**
 * 网页搜索结果的单条数据类型
 */
type WebSearchResult = {
  title: string;           // 网页标题
  url: string;            // 网页URL
  snippet: string;        // 网页内容片段
  source?: string;        // 可选的来源信息
  publishDate?: string;   // 可选的发布日期
  relevanceScore?: number; // 可选的相关性得分
};

/**
 * 网页搜索结果的集合类型
 */
type WebSearchData = {
  results: WebSearchResult[]; // 搜索结果数组
};

/**
 * PDF文档信息的类型定义
 */
type DocumentInfo = {
  fileName: string;    // 文件名
  fileKey: string;     // S3存储的文件键
  fileUrl: string;     // 文件访问URL
  fileSize: number;    // 文件大小（字节）
  uploadedAt: string;  // 上传时间
};

/**
 * 聊天消息的类型定义
 */
type ChatMessage = {
  role: 'user' | 'assistant';  // 消息发送者角色：用户或AI助手
  content: string;             // 消息内容
  timestamp: string;           // 消息时间戳
  quotedContent?: {           // 可选的引用内容
    text: string;             // 引用的文本
  }[];
};

/**
 * 文档聊天历史的集合类型
 */
type DocumentChatData = {
  messages: ChatMessage[];    // 聊天消息数组
};

// ============= 表定义区域 =============

/**
 * 消息类型枚举
 * 用于区分不同类型的消息记录
 */
export const messageTypeEnum = pgEnum('message_type', [
  'research_search',  // 研究论文搜索
  'pdf_analysis',    // PDF文档分析
  'web_search'       // 网页搜索
]);

/**
 * 笔记本表
 * 作为主表，包含基本信息
 */
export const notebooks = pgTable('notebooks', {
  id: varchar('id').primaryKey().notNull(),        // 主键ID
  userId: varchar('user_id').notNull(),            // 用户ID，用于访问控制
  title: varchar('title', { length: 255 }).notNull(), // 笔记本标题
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // 更新时间
});

/**
 * 研究论文搜索记录表
 * 存储论文搜索相关的数据
 */
export const researchMessages = pgTable('research_messages', {
  // 基础字段
  id: varchar('id').primaryKey().notNull(),
  notebookId: varchar('notebook_id').notNull().references(() => notebooks.id), // 外键关联到notebooks表
  userId: varchar('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // 搜索相关字段
  searchQuery: text('search_query').notNull(),     // 搜索查询内容
  summaryContent: text('summary_content'),         // 搜索结果总结
  summaryTranslated: text('summary_translated'),   // 总结的翻译
  
  // 论文数据 - 使用JSON类型存储结构化数据
  papers: json('papers').$type<PapersData>().default({ papers: [] }).notNull(),
  
  // 附件相关字段
  hasAttachments: boolean('has_attachments').default(false),
  attachments: json('attachments').default([]),
});

/**
 * 网页搜索记录表
 * 存储网页搜索相关的数据
 */
export const webSearchMessages = pgTable('web_search_messages', {
  // 基础字段
  id: varchar('id').primaryKey().notNull(),
  notebookId: varchar('notebook_id').notNull().references(() => notebooks.id),
  userId: varchar('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // 搜索相关字段
  searchQuery: text('search_query').notNull(),
  summaryReport: text('summary_report'),
  summaryTranslated: text('summary_translated'),
  
  // 搜索结果 - 使用JSON类型存储结构化数据
  searchResults: json('search_results').$type<WebSearchData>().default({ results: [] }).notNull(),
});

/**
 * PDF文档聊天记录表
 * 存储与PDF文档相关的对话数据
 */
export const documentMessages = pgTable('document_messages', {
  // 基础字段
  id: varchar('id').primaryKey().notNull(),
  notebookId: varchar('notebook_id').notNull().references(() => notebooks.id),
  userId: varchar('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // 文档信息
  documentInfo: json('document_info').$type<DocumentInfo>().notNull(),
  
  // 聊天记录
  chatHistory: json('chat_history').$type<DocumentChatData>().default({ messages: [] }).notNull(),
  
  // 处理状态
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  
  // 元数据
  lastMessageAt: timestamp('last_message_at'),
  messageCount: integer('message_count').default(0),
  
  // AWS S3相关
  bucketName: varchar('bucket_name').notNull(),
  region: varchar('region').notNull(),
  
  // 文档分析结果
  extractedText: text('extracted_text'),
  textSummary: text('text_summary'),
  translatedSummary: text('translated_summary'),
  summaryContent: text('summary_content'),
  summaryTranslated: text('summary_translated'),
});