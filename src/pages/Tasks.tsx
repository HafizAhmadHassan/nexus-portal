import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
} from '../components/ui'
import { TaskCard } from '../components/cards'
import { Icon } from '../components/icons'
import { taskStatusLabels, taskStatusTone } from '../lib/labels'
import { newId } from '../lib/format'
import { useApp } from '../state/AppState'
import type { Task, TaskPriority, TaskStatus } from '../lib/types'

const statuses: TaskStatus[] = ['todo', 'in_progress', 'waiting', 'completed']
const priorities: TaskPriority[] = ['low', 'medium', 'high']

export function Tasks() {
  const { state } = useApp()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [addOpen, setAddOpen] = useState(false)
  const [createCompany, setCreateCompany] = useState(searchParams.get('company') ?? '')

  useEffect(() => {
    const company = searchParams.get('company')
    if (company) setCreateCompany(company)
  }, [searchParams])

  const tasks = useMemo(
    () =>
      [...state.tasks]
        .filter((t) => {
          if (statusFilter && t.status !== statusFilter) return false
          if (priorityFilter && t.priority !== priorityFilter) return false
          return true
        })
        .sort((a, b) => {
          const statusOrder = (s: TaskStatus) => (s === 'completed' ? 1 : 0)
          if (statusOrder(a.status) !== statusOrder(b.status)) return statusOrder(a.status) - statusOrder(b.status)
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
          return da - db
        }),
    [state.tasks, statusFilter, priorityFilter],
  )

  const openCount = tasks.filter((t) => t.status !== 'completed').length

  return (
    <div>
      <PageHeader
        title="Tasks & follow-ups"
        description="Plan the next concrete step for each company and opportunity."
        action={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Icon name="plus" className="h-4 w-4" />
            New task
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')} className="w-auto">
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{taskStatusLabels[s]}</option>
            ))}
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')} className="w-auto">
            <option value="">All priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
            ))}
          </Select>
          <span className="text-xs text-slate-500">{openCount} open · {tasks.length} shown</span>
          <div className="ml-auto flex rounded-lg border border-slate-300 p-0.5">
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className={`rounded-md px-2.5 py-1 text-xs ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              className={`rounded-md px-2.5 py-1 text-xs ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Kanban
            </button>
          </div>
        </div>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks"
          description="Create a task to schedule the next follow-up."
          action={<Button size="sm" onClick={() => setAddOpen(true)}>New task</Button>}
        />
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-slate-100/60 p-2">
              <div className="flex items-center justify-between px-1 pb-2">
                <span className={`text-xs font-semibold ${taskStatusTone[status] === 'success' ? 'text-emerald-700' : taskStatusTone[status] === 'warning' ? 'text-amber-700' : taskStatusTone[status] === 'info' ? 'text-sky-700' : 'text-slate-600'}`}>
                  {taskStatusLabels[status]}
                </span>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                  {tasks.filter((t) => t.status === status).length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen ? (
        <AddTaskModal open onClose={() => setAddOpen(false)} companyId={createCompany} />
      ) : null}
    </div>
  )
}

function AddTaskModal({ open, onClose, companyId }: { open: boolean; onClose: () => void; companyId?: string }) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    dueDate: '',
    companyId: companyId ?? '',
  })

  const submit = () => {
    if (!form.title.trim()) return
    const task: Task = {
      id: newId('t'),
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : undefined,
      companyId: form.companyId || undefined,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TASK', task })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="New task"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!form.title.trim()}>Create task</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Title">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Follow up on proposal" autoFocus />
        </Field>
        <Field label="Description">
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
              {priorities.map((p) => (
                <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
              {statuses.map((s) => (
                <option key={s} value={s}>{taskStatusLabels[s]}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Due date">
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
        <Field label="Related company">
          <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
            <option value="">None</option>
            {state.companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  )
}