import RuleList from './RuleList'
import { useState } from 'react'

import { ProcessingFlow, ProcessingRule } from '../types'

const { Panel } = Collapse

interface SidebarProps {
  flows: ProcessingFlow[]
  selectedFlow: ProcessingFlow | null
  onFlowSelect: (flow: ProcessingFlow) => void
  onFlowChange: (flowId: string, updates: Partial<ProcessingFlow>) => void
  onRuleChange: (flowId: string, ruleId: string, updates: Partial<ProcessingRule>) => void
  onAddFlow: (flowName: string) => void
  onAddRule: (flowId: string) => void
  onDeleteRule: (flowId: string, ruleId: string) => void
}

export default function Sidebar({
  flows,
  selectedFlow,
  onFlowSelect,
  onFlowChange,
  onRuleChange,
  onAddFlow,
  onAddRule,
  onDeleteRule
}: SidebarProps) {
// 在 AppLayout 中
const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)

const handleRuleSelect = (ruleId: string) => {
  setSelectedRuleId(ruleId === selectedRuleId ? null : ruleId)
}

const handleDeleteRule = (flowId: string, ruleId: string) => {
  setFlows(flows.map(flow => 
    flow.id === flowId 
      ? { ...flow, rules: flow.rules.filter(rule => rule.id !== ruleId) }
      : flow
  ))
  if (selectedFlow && selectedFlow.id === flowId) {
    setSelectedFlow({
      ...selectedFlow,
      rules: selectedFlow.rules.filter(rule => rule.id !== ruleId)
    })
  }
  message.success('Rule deleted')
}

// 在 JSX 中使用
<RuleList
  rules={selectedFlow?.rules || []}
  selectedRuleId={selectedRuleId}
  onRuleSelect={handleRuleSelect}
  onRuleChange={handleRuleChange}
  onDeleteRule={handleDeleteRule}
/>
}