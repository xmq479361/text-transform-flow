import React, { useState } from 'react';
import { Tree, Form, Input, Checkbox, Button, message } from 'antd';
import { ProcessingFlow, ProcessingRule } from '../types';
import { Key } from 'rc-tree/lib/interface';

interface SidebarProps {
    flows: ProcessingFlow[]
    selectedFlow: ProcessingFlow | null
    onFlowSelect: (flow: ProcessingFlow) => void
    onFlowChange: (flowId: string, updates: Partial<ProcessingFlow>) => void
    onRuleChange: (flowId: string, ruleId: string, updates: Partial<ProcessingRule>) => void
    onAddFlow: (flowName: string, id: string) => void
    onAddRule: (flowId: string) => void
    onDeleteRule: (flowId: string, ruleId: string) => void
    onPatternChange: (pattern: string) => void
  }
  
  export default function RuleTree({
    flows,
    selectedFlow,
    onFlowSelect,
    onRuleChange,
    onAddFlow,
    onAddRule,
    onDeleteRule,
    onPatternChange,
  }: SidebarProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const handleSelect = (keys: Key[], info: any) => {
    const selectedKey = keys[0];
    setEditingKey(selectedKey === editingKey ? null : selectedKey);
  };

  const handleFormSubmit = (key: string, values: Partial<ProcessingRule>) => {
    // onRuleChange(key, values);
    message.success('规则已更新');
    setEditingKey(null);
  };

  const renderFlowTreeNodes = (flows: ProcessingFlow[]) =>
    flows.map((flow) => ({
      title: flow.name,
      key: flow.id,
      children: renderTreeNodes(flow.id, flow.rules),
    }));

  const renderTreeNodes = (flowId: string, rules: ProcessingRule[]) =>
    rules.map((rule) => ({
      title: `规则: ${rule.pattern}`,
      key: rule.id,
      children: editingKey === rule.id ? [
        {
          title: (
            <Form
              layout="vertical"
              style={{ padding: '10px' }}
              initialValues={rule}
              onFinish={(values) => handleFormSubmit(rule.id, values)}
            >
              <Form.Item
                label="描述"
                name="pattern"
                rules={[{ required: true, message: '请输入规则描述' }]}
              >
                <Input placeholder="规则描述" />
              </Form.Item>
              <Form.Item
                label="替换"
                name="replacement"
                rules={[{ required: true, message: '请输入替换文本' }]}
              >
                <Input placeholder="替换文本" />
              </Form.Item>
              <Form.Item name="enabled" valuePropName="checked">
                <Checkbox>启用</Checkbox>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存
                </Button>
                <Button type="link" danger onClick={() => onDeleteRule(flowId, rule.id)}>
                  删除
                </Button>
              </Form.Item>
            </Form>
          ),
          key: `${rule.id}-form`,
          isLeaf: true,
        },
      ] : [],
    }));

  return (
    <Tree
      treeData={renderFlowTreeNodes(flows)}
      onSelect={handleSelect}
      defaultExpandAll
    />
  );
};
