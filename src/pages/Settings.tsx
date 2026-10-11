import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Field, Input, PageHeader, Textarea } from '../components/ui'
import { Icon } from '../components/icons'
import { useApp } from '../state/AppState'
import type { ScoreWeights, SenderProfile } from '../lib/types'

export function Settings() {
  const { state, dispatch, resetDemo } = useApp()
  const settings = state.settings

  const [sender, setSender] = useState<SenderProfile>(settings.sender)
  const [weights, setWeights] = useState<ScoreWeights>(settings.weights)

  const weightSum = weights.impact + weights.evidenceStrength + weights.feasibility + weights.strategic
  const weightsValid = weightSum === 100
  const senderChanged = JSON.stringify(sender) !== JSON.stringify(settings.sender)
  const weightsChanged = JSON.stringify(weights) !== JSON.stringify(settings.weights)
  const dirty = senderChanged || weightsChanged

  const saveSettings = () => {
    if (!weightsValid) return
    if (senderChanged) dispatch({ type: 'UPDATE_SETTINGS', patch: { sender } })
    if (weightsChanged) dispatch({ type: 'UPDATE_SETTINGS', patch: { weights } })
  }

  const setWeight = (key: keyof ScoreWeights, value: number) => {
    setWeights((w) => ({ ...w, [key]: Math.max(0, Math.min(100, value)) }))
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your sender profile and the transparent scoring configuration."
        action={
          <Button variant="primary" onClick={saveSettings} disabled={!dirty || !weightsValid}>
            Save changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sender profile" description="Used to personalise outreach drafts. Replaced with real authentication in Phase 2." />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your name">
                <Input value={sender.name} onChange={(e) => setSender({ ...sender, name: e.target.value })} />
              </Field>
              <Field label="Company / studio">
                <Input value={sender.company} onChange={(e) => setSender({ ...sender, company: e.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <Input type="email" value={sender.email} onChange={(e) => setSender({ ...sender, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={sender.phone} onChange={(e) => setSender({ ...sender, phone: e.target.value })} />
              </Field>
            </div>
            <Field label="Services you offer (one per line)" hint="Shown as suggestions in the Outreach Studio.">
              <Textarea
                value={sender.services.join('\n')}
                onChange={(e) =>
                  setSender({
                    ...sender,
                    services: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Priority scoring weights" description="The formula is public and configurable. Weights should sum to 100." />
          <CardBody className="space-y-3">
            {(
              [
                ['impact', 'Potential business impact'],
                ['evidenceStrength', 'Evidence strength'],
                ['feasibility', 'Implementation feasibility'],
                ['strategic', 'Strategic relevance to your services'],
              ] as Array<[keyof ScoreWeights, string]>
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[key]}
                    onChange={(e) => setWeight(key, Number(e.target.value))}
                    className="w-full accent-indigo-600"
                    aria-label={label}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={weights[key]}
                    onChange={(e) => setWeight(key, Number(e.target.value))}
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-right text-sm text-slate-700"
                    aria-label={`${label} weight value`}
                  />
                </div>
              </Field>
            ))}
            <p className={`text-xs font-medium ${weightsValid ? 'text-emerald-700' : 'text-rose-700'}`}>
              Sum: {weightSum} {weightsValid ? '· valid (100)' : `· must equal 100 (currently ${weightSum})`}
            </p>
            <p className="text-xs text-slate-400">
              Formula: score = impact×{weights.impact} + evidence×{weights.evidenceStrength} + feasibility×
              {weights.feasibility} + strategic×{weights.strategic}, normalised to 0–100.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5 border-rose-200">
        <CardHeader title="Demo data" description="Restore the original sample dataset and discard local changes." />
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs text-slate-600">
            This clears the <code className="rounded bg-slate-100 px-1">localStorage</code> persisted state and
            reloads the seed data. There is no undo.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Reset all demo data to the original sample dataset?')) resetDemo()
            }}
          >
            <Icon name="refresh" className="h-4 w-4" />
            Reset demo data
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}