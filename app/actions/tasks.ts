'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, type TaskStatus } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getTasks() {
  const userId = await getUserId()
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(asc(tasks.createdAt))
}

export async function createTask(title: string) {
  const userId = await getUserId()
  const trimmed = title.trim()
  if (!trimmed) return
  await db.insert(tasks).values({ userId, title: trimmed.slice(0, 500) })
  revalidatePath('/')
}

export async function updateTaskStatus(id: number, status: TaskStatus) {
  const userId = await getUserId()
  if (!STATUSES.includes(status)) throw new Error('Invalid status')
  await db
    .update(tasks)
    .set({ status })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath('/')
}

export async function deleteTask(id: number) {
  const userId = await getUserId()
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath('/')
}
