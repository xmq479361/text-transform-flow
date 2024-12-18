import React, { useState } from "react";
import {
  Collapse,
  Tooltip,
  Form,
  Input,
  Checkbox,
  Button,
  message,
  Modal,
} from "antd";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";

import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ProcessingFlow, ProcessingRule } from "../types";
interface SidebarProps {
  flows: ProcessingFlow[];
  selectedFlow: ProcessingFlow | null;
  onFlowSelect: (flow: ProcessingFlow | null) => void;
  onFlowChange: (flowId: string, updates: Partial<ProcessingFlow>) => void;
  onFlowDelete: (flowId: string) => void;
  onRuleChange: (
    flowId: string,
    ruleId: string,
    updates: Partial<ProcessingRule>
  ) => void;
  onAddFlow: (flowName: string, id: string) => void;
  onAddRule: (flowId: string) => void;
  onDeleteRule: (flowId: string, ruleId: string) => void;
  onReorderRules: (
    flowId: string,
    startIndex: number,
    endIndex: number
  ) => void;
  setHighlightRules: (rules: ProcessingRule[]) => void;
}

export default function Sidebar({
  flows,
  onFlowSelect,
  onFlowChange,
  onFlowDelete,
  onRuleChange,
  onAddFlow,
  onAddRule,
  onDeleteRule,
  onReorderRules,
  setHighlightRules,
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

  const getRuleSummary = (rule: ProcessingRule) => {
    if (rule.description) {
      return rule.description;
    }
    return `${rule.pattern} -> ${rule.replacement}`;
  };
  const handleFlowCollapseChange = (keys: string | string[]) => {
    const flowId = keys[0];
    const flow = flows.find((flow) => flow.id === flowId);
    console.log("handleFlowCollapseChange", keys, flowId, flow, flows);
    if (flow) {
      onFlowSelect(flow);
    } else {
      onFlowSelect(null);
    }
  };
  const handleRuleCollapseChange = (
    flow: ProcessingFlow,
    keys: string | string[]
  ) => {
    console.log("handleRuleCollapseChange", keys, flow.id, flow, flows);
    if (keys == null || keys.length == 0) {
      onFlowSelect(flow);
    } else {
      const rule = flow.rules.find((rule) => rule.id === keys[0]);
      if (rule) {
        setHighlightRules([rule]);
      }
    }
  };

  const renderRuleForm = (flow: ProcessingFlow, rule: ProcessingRule) => (
    <Form key={rule.id} layout="vertical" className="p-2">
      <Form.Item className="mb-2">
        <Input
          placeholder="规则描述"
          value={rule.description}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { description: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item className="mb-2">
        <Tooltip title="使用正则表达式匹配文本，例如：\b\w+\b">
          <Input
            placeholder="查找模式"
            value={rule.pattern}
            onChange={(e) =>
              onRuleChange(flow.id, rule.id, { pattern: e.target.value })
            }
            suffix={<InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
          />
        </Tooltip>
      </Form.Item>
      <Form.Item className="mb-2">
        <Tooltip title="替换匹配到的文本，可以使用$1, $2等引用捕获组，或${{key}}[index]引用处理流数据">
          <Input
            placeholder="替换文本"
            value={rule.replacement}
            onChange={(e) =>
              onRuleChange(flow.id, rule.id, { replacement: e.target.value })
            }
            suffix={<InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
          />
        </Tooltip>
      </Form.Item>
      <div className="flex items-center">
        <Checkbox
          checked={rule.global}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { global: e.target.checked })
          }
        >
          <span>全局</span>
        </Checkbox>
        <Checkbox
          className="ml-4"
          checked={rule.caseSensitive}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { caseSensitive: e.target.checked })
          }
        >
          <span>区分大小写</span>
        </Checkbox>
      </div>
      <div className="flex items-center mb-2">
        <Checkbox
          checked={rule.extractOnly}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { extractOnly: e.target.checked })
          }
        >
          <span>仅提取匹配内容</span>
        </Checkbox>
      </div>
      <div className="flex items-center mb-2">
        <Checkbox
          checked={rule.storeInFlow}
          onChange={(e) =>
            onRuleChange(flow.id, rule.id, { storeInFlow: e.target.checked })
          }
        >
          <span>存入处理流</span>
        </Checkbox>
      </div>
      {rule.storeInFlow && (
        <Form.Item className="mb-2">
          <Input
            placeholder="处理流key, 后续通过${{key}}提取使用"
            value={rule.flowKey}
            onChange={(e) =>
              onRuleChange(flow.id, rule.id, { flowKey: e.target.value })
            }
          />
        </Form.Item>
      )}
    </Form>
  );
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const flowId = result.source.droppableId;
    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    onReorderRules(flowId, startIndex, endIndex);
  };

  const ruleItems = (flow: ProcessingFlow) => {
    return flow.rules.map((rule, index) => ({
      key: rule.id,
      label: (
        <Draggable key={rule.id} draggableId={rule.id} index={index}>
          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="w-full"
              style={{
                ...provided.draggableProps.style,
                opacity: snapshot.isDragging ? 0.5 : 1,
              }}
            >
              {getRuleSummary(rule)}
            </div>
          )}
        </Draggable>
      ),
      extra: (
        <div className="flex items-center ml-2 mr-4">
          <DeleteOutlined
            onClick={() => onDeleteRule(flow.id, rule.id)}
            className={`cursor-pointer`}
            style={{ fontSize: 16 }}
          />
          <Checkbox
            className="ml-2"
            checked={rule.enabled}
            onChange={(e) =>
              onRuleChange(flow.id, rule.id, {
                enabled: e.target.checked,
              })
            }
          />
        </div>
      ),
      children: renderRuleForm(flow, rule),
    }));
  };
  const flowItems = flows.map((flow) => ({
    key: flow.id,
    label: (
      <span
        className="text-white font-semibold cursor-pointer"
        onClick={() => onFlowSelect(flow)}
      >
        {flow.name}
      </span>
    ),
    extra: (
      <div className="flex items-center">
        <DeleteOutlined
          onClick={() => {
            Modal.confirm({
              title: "确认删除",
              content: "您确定要删除这条规则吗？",
              onOk: () => onFlowDelete(flow.id),
            });
          }}
          // onClick={() => onFlowDelete(flow.id)}
          className={`cursor-pointer`}
          style={{ fontSize: 16 }}
        />
        <Checkbox
          style={{ margin: "0px 5px" }}
          checked={flow.enabled}
          onChange={(e) =>
            onFlowChange(flow.id, {
              enabled: e.target.checked,
            })
          }
        />
      </div>
    ),
    children: (
      <Droppable droppableId={flow.id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Collapse
              accordion
              ghost
              onChange={(keys) => handleRuleCollapseChange(flow, keys)}
              items={ruleItems(flow)}
            />
            {provided.placeholder}
            <Button
              onClick={() => onAddRule(flow.id)}
              icon={<PlusOutlined />}
              className=" mt-2 w-3/4 ml-4"
            >
              添加规则
            </Button>
          </div>
        )}
      </Droppable>
    ),
  }));

  return (
    <div className={`w-full h-full flex flex-col`}>
      <div className="panel-header">
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Collapse
          accordion
          ghost
          onChange={(keys) => handleFlowCollapseChange(keys)}
          items={flowItems}
        />
      </DragDropContext>
    </div>
  );
}
