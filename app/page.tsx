import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTasks } from '@/app/actions/tasks'
import { TaskManager } from '@/components/task-manager'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const tasks = await getTasks()

  return (
    <TaskManager
      initialTasks={tasks}
      userName={session.user.name || session.user.email}
    />
  )
}
