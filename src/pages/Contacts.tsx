import { useMemo, useState } from 'react'
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
import { ContactRow } from '../components/cards'
import { Icon } from '../components/icons'
import { newId } from '../lib/format'
import { getCompany } from '../lib/selectors'
import { useApp } from '../state/AppState'
import type { Contact, Verification } from '../lib/types'

export function Contacts() {
  const { state, dispatch } = useApp()
  const [text, setText] = useState('')
  const [verification, setVerification] = useState<Verification | ''>('')
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  const sorted = useMemo(
    () =>
      [...state.contacts]
        .filter((c) => {
          if (verification && c.verification !== verification) return false
          const need = text.trim().toLowerCase()
          if (need) {
            const company = getCompany(state, c.companyId)
            const haystack = [c.name, c.role, company?.name ?? ''].join(' ').toLowerCase()
            if (!haystack.includes(need)) return false
          }
          return true
        })
        .sort((a, b) => a.companyId.localeCompare(b.companyId) || a.name.localeCompare(b.name)),
    [state.contacts, state, text, verification],
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { verified: 0, unverified: 0, needs_check: 0 }
    for (const c of state.contacts) map[c.verification] += 1
    return map
  }, [state.contacts])

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Professional contacts with honest verification status — never plausible-looking fakes."
        action={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Icon name="plus" className="h-4 w-4" />
            Add contact
          </Button>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Input placeholder="Search name, role, company…" value={text} onChange={(e) => setText(e.target.value)} className="max-w-xs" />
          <Select value={verification} onChange={(e) => setVerification(e.target.value as Verification | '')} className="w-auto">
            <option value="">All verification states</option>
            <option value="verified">Verified ({counts.verified})</option>
            <option value="needs_check">Needs check ({counts.needs_check})</option>
            <option value="unverified">Unverified ({counts.unverified})</option>
          </Select>
          <span className="ml-auto text-xs text-slate-500">{sorted.length} contacts</span>
        </div>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState title="No contacts found" description="Adjust the search or add a contact from a company profile." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-3 py-2.5 font-medium">Contact</th>
                <th className="px-3 py-2.5 font-medium">Company</th>
                <th className="px-3 py-2.5 font-medium">Relevance & details</th>
                <th className="px-3 py-2.5 font-medium">Verification</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((contact) => (
                <ContactRow key={contact.id} contact={contact} onEdit={setEditing} />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AddContactModal open={addOpen} onClose={() => setAddOpen(false)} />
      {editing ? <EditContactModal contact={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function AddContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({
    name: '',
    role: '',
    companyId: state.companies[0]?.id ?? '',
    relevance: '',
    email: '',
  })

  const invalid = !form.name.trim() || !form.role.trim() || !form.companyId

  const submit = () => {
    if (invalid) return
    const contact: Contact = {
      id: newId('p'),
      companyId: form.companyId,
      name: form.name.trim(),
      role: form.role.trim(),
      relevance: form.relevance.trim() || 'Relevance not yet recorded.',
      email: form.email.trim() || undefined,
      verification: 'unverified',
    }
    dispatch({ type: 'ADD_CONTACT', contact })
    setForm({ name: '', role: '', companyId: state.companies[0]?.id ?? '', relevance: '', email: '' })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add contact"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={invalid}>Add contact</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Company">
          <Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
            {state.companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. IT Manager" />
        </Field>
        <Field label="Relevance">
          <Input value={form.relevance} onChange={(e) => setForm({ ...form, relevance: e.target.value })} placeholder="Why this person is relevant" />
        </Field>
        <Field label="Public business email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optional" />
        </Field>
      </div>
    </Modal>
  )
}

function EditContactModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState({
    name: contact.name,
    role: contact.role,
    relevance: contact.relevance,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    verification: contact.verification as Verification,
  })

  const submit = () => {
    dispatch({
      type: 'UPDATE_CONTACT',
      id: contact.id,
      patch: {
        name: form.name.trim() || contact.name,
        role: form.role.trim() || contact.role,
        relevance: form.relevance.trim() || contact.relevance,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        verification: form.verification,
      },
    })
    onClose()
  }

  return (
    <Modal
      open
      title={`Edit ${contact.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Save changes</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Role">
          <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </Field>
        <Field label="Relevance">
          <Input value={form.relevance} onChange={(e) => setForm({ ...form, relevance: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>
        <Field label="Verification status">
          <Select value={form.verification} onChange={(e) => setForm({ ...form, verification: e.target.value as Verification })}>
            <option value="verified">Verified</option>
            <option value="needs_check">Needs check</option>
            <option value="unverified">Unverified</option>
          </Select>
        </Field>
      </div>
    </Modal>
  )
}