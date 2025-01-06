import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { notebooks, researchMessages, webSearchMessages, documentMessages } from './schema';
import { eq, and } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// 导出常用的查询构建器
export const queries = {
  // 笔记本相关查询
  notebooks: {
    getByUserId: (userId: string) => 
      db.select().from(notebooks).where(eq(notebooks.userId, userId)),
    
    getById: (id: string, userId: string) =>
      db.select().from(notebooks).where(
        and(
          eq(notebooks.id, id),
          eq(notebooks.userId, userId)
        )
      ),
  },

  // 研究搜索相关查询
  researchMessages: {
    getByNotebookId: (notebookId: string, userId: string) =>
      db.select().from(researchMessages).where(
        and(
          eq(researchMessages.notebookId, notebookId),
          eq(researchMessages.userId, userId)
        )
      ),
  },

  // 网页搜索相关查询
  webSearchMessages: {
    getByNotebookId: (notebookId: string, userId: string) =>
      db.select().from(webSearchMessages).where(
        and(
          eq(webSearchMessages.notebookId, notebookId),
          eq(webSearchMessages.userId, userId)
        )
      ),
  },

  // 文档消息相关查询
  documentMessages: {
    getByNotebookId: (notebookId: string, userId: string) =>
      db.select().from(documentMessages).where(
        and(
          eq(documentMessages.notebookId, notebookId),
          eq(documentMessages.userId, userId)
        )
      ),
  },
};

export type DB = typeof db;
export { notebooks, researchMessages, webSearchMessages, documentMessages };
export default db;

