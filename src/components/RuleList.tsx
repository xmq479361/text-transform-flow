import { Collapse, Checkbox, Button, message } from 'antd'
import { ProcessingRule } from '../types'

interface RuleListProps {
  rules: ProcessingRule[]
  selectedRuleId: string | null
  onRuleSelect: (ruleId: string) => void
  onRuleChange: (ruleId: string, updates: Partial<ProcessingRule>) => void
  onDeleteRule: (ruleId: string) => void
}

const RuleList: React.FC<RuleListProps> = ({
  rules,
  selectedRuleId,
  onRuleSelect,
  onRuleChange,
  onDeleteRule
}) => {
  return (
    <Collapse activeKey={selectedRuleId ? [selectedRuleId] : []} onChange={key => onRuleSelect(key[0] as string)}>
      {rules.map(rule => (
        <Collapse.Panel
          header={`Rule: ${rule.pattern}`}
          key={rule.id}
          extra={
            <Button
              type="link"
              danger
              onClick={() => onDeleteRule(rule.id)}
            >
              删除
            </Button>
          }
        >
          <div>
            <Checkbox
              checked={rule.enabled}
              onChange={e => onRuleChange(rule.id, { enabled: e.target.checked })}
            >
              启用
            </Checkbox>
            <div>
              <strong>描述: </strong>
              <input
                value={rule.pattern}
                onChange={e => onRuleChange(rule.id, { pattern: e.target.value })}
                placeholder="规则描述"
              />
            </div>
            <div>
              <strong>替换:</strong>
              <input
                value={rule.replacement}
                onChange={e => onRuleChange(rule.id, { replacement: e.target.value })}
                placeholder="替换文本"
              />
            </div>
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  )
}

export default RuleList
