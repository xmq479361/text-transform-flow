import React, { useState } from "react";
import { Collapse, Form, Input, Checkbox, Button, message } from "antd";

import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ProcessingFlow, ProcessingRule } from "../types";

const { Panel } = Collapse;

interface SidebarProps {
  flows: ProcessingFlow[];
  selectedFlow: ProcessingFlow | null;
  onFlowSelect: (flow: ProcessingFlow | null) => void;
  onFlowChange: (flowId: string, updates: Partial<ProcessingFlow>) => void;
  onRuleChange: (
    flowId: string,
    ruleId: string,
    updates: Partial<ProcessingRule>
  ) => void;
  onAddFlow: (flowName: string, id: string) => void;
  onAddRule: (flowId: string) => void;
  onDeleteRule: (flowId: string, ruleId: string) => void;
}

export default function Sidebar({
  flows,
  onFlowSelect,
  onRuleChange,
  onAddFlow,
  onAddRule,
  onDeleteRule,
}: SidebarProps) {
  const [newFlowName, setNewFlowName] = useState("");
  const handleAddFlow = () => {
    if (newFlowName) {
      var id = Date.now().toString();
      onAddFlow(newFlowName, id);
      setNewFlowName("");
    } else {
      message.warning("Please enter a flow name");
    }
  };

  const handleCollapseChange = (key: string | string[]) => {
    const flowId = key[0];
    const flow = flows.find((flow) => flow.id === flowId);
    console.log("handleCollapseChange", key, flowId, flow, flows);
    if (flow) {
      onFlowSelect(flow);
    } else {
      onFlowSelect(null);
    }
  };

  const renderRuleForm = (flow: ProcessingFlow, rule: ProcessingRule) => (
    <Form key={rule.id} layout="vertical" className="p-2">
      <div className="flex items-center mb-2">
        <Checkbox
          checked={rule.enabled}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { enabled: e.target.checked })
          }
        />
        <span className="ml-2 text-white">启用</span>
      </div>
      <Form.Item className="mb-2">
        <Input
          placeholder="查找模式"
          value={rule.pattern}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { pattern: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item className="mb-2">
        <Input
          placeholder="替换文本"
          value={rule.replacement}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { replacement: e.target.value })
          }
        />
      </Form.Item>
      <div className="flex items-center">
        <Checkbox
          checked={rule.global}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { global: e.target.checked })
          }
        >
          <span className="text-white">全局</span>
        </Checkbox>
        <Checkbox
          className="ml-4"
          checked={rule.caseSensitive}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { caseSensitive: e.target.checked })
          }
        >
          <span className="text-white">区分大小写</span>
        </Checkbox>
      </div>
    </Form>
  );

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="p-4">
        <Input
          placeholder="新处理流名称"
          value={newFlowName}
          onChange={(e) => setNewFlowName(e.target.value)}
          onPressEnter={handleAddFlow}
          suffix={
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={handleAddFlow}
            />
          }
        />
      </div>
      <Collapse
        accordion
        ghost
        expandIconPosition="right"
        className="bg-gray-800 border-0 padding-0"
        onChange={handleCollapseChange}
        style={{ width: 300, padding: 0 }}
      >
        {flows.map((flow) => (
          <Panel
            key={flow.id}
            header={
              <span
                className="text-white font-semibold cursor-pointer"
                onClick={() => onFlowSelect(flow)}
              >
                {flow.name}
              </span>
            }
            className="bg-gray-800 border-0"
          >
            <Collapse accordion bordered={false} ghost>
              {flow.rules.map((rule) => (
                <Panel
                  key={rule.id}
                  header={rule.pattern + " => " + rule.replacement}
                  className="bg-gray-800 border-0"
                  extra={
                    <DeleteOutlined
                      onClick={() => onDeleteRule(flow.id, rule.id)}
                      className="text-white cursor-pointer"
                      style={{ fontSize: 16 }}
                    />
                  }
                >
                  {renderRuleForm(flow, rule)}
                </Panel>
              ))}
            </Collapse>

            <Button
              onClick={() => onAddRule(flow.id)}
              icon={<PlusOutlined />}
              className="w-full text-white"
            >
              添加规则
            </Button>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}
