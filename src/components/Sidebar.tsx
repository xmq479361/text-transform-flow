import React, { useState } from "react";
import {
  Collapse,
  Tooltip,
  Form,
  Input,
  Checkbox,
  Button,
  message,
} from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
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
  onReorderRules: (
    flowId: string,
    startIndex: number,
    endIndex: number
  ) => void;
}

export default function Sidebar({
  flows,
  onFlowSelect,
  onRuleChange,
  onAddFlow,
  onAddRule,
  onDeleteRule,
  onReorderRules,
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
        <Tooltip title="替换匹配到的文本，可以使用$1, $2等引用捕获组">
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
        {flows.map((flow) => (
          <Droppable droppableId={`flow-${flow.id}`} key={flow.id}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <Collapse
                  key={flow.id}
                  accordion
                  ghost
                  onChange={handleCollapseChange}
                >
                  <Panel
                    key={`flow-panel-${flow.id}`}
                    header={
                      <span
                        className={`font-semibold cursor-pointer`}
                        onClick={() => onFlowSelect(flow)}
                      >
                        {flow.name}
                      </span>
                    }
                    className="border-0"
                  >
                    {flow.rules.map((rule, index) => (
                      <Draggable
                        key={`rule-${rule.id}`}
                        draggableId={rule.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Collapse
                              key={rule.id}
                              accordion
                              bordered={false}
                              ghost
                            >
                              <Panel
                                header={getRuleSummary(rule)}
                                key={rule.id}
                                extra={
                                  <div className="flex items-center ml-2 ">
                                    <DeleteOutlined
                                      onClick={() =>
                                        onDeleteRule(flow.id, rule.id)
                                      }
                                      className={`cursor-pointer`}
                                      style={{ fontSize: 16 }}
                                    />
                                    <Checkbox
                                      className="mr-2 ml-2 "
                                      checked={rule.enabled}
                                      onChange={(e) =>
                                        onRuleChange(flow.id, rule.id, {
                                          enabled: e.target.checked,
                                        })
                                      }
                                    />
                                  </div>
                                }
                              >
                                {renderRuleForm(flow, rule)}
                              </Panel>
                            </Collapse>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <div>
                      <Button
                        onClick={() => onAddRule(flow.id)}
                        icon={<PlusOutlined />}
                        className="w-full mt-4"
                      >
                        添加规则
                      </Button>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
      {/* <Collapse
        accordion
        ghost
        onChange={handleCollapseChange}
        style={{ padding: 0 }}
      >
        {flows.map((flow) => (
          <Panel
            key={flow.id}
            header={
              <span
                className={`font-semibold cursor-pointer`}
                onClick={() => onFlowSelect(flow)}
              >
                {flow.name}
              </span>
            }
            className="border-0"
          >
            <Collapse accordion bordered={false} ghost>
              {flow.rules.map((rule) => (
                <Panel
                  key={rule.id}
                  header={
                    rule.description || rule.pattern + " => " + rule.replacement
                  }
                  className="border-0"
                  extra={
                    <div className="flex items-center">
                      <DeleteOutlined
                        onClick={() => onDeleteRule(flow.id, rule.id)}
                        className={`cursor-pointer`}
                        style={{ fontSize: 16 }}
                      />
                      <Checkbox
                        style={{ margin: "0px 5px" }}
                        checked={rule.enabled}
                        onChange={(e) =>
                          onRuleChange(flow.id, rule.id, {
                            enabled: e.target.checked,
                          })
                        }
                      />
                    </div>
                  }
                >
                  {renderRuleForm(flow, rule)}
                </Panel>
              ))}
            </Collapse>

            <Button
              onClick={() => onAddRule(flow.id)}
              icon={<PlusOutlined />}
              className="w-full mt-4"
            >
              添加规则
            </Button>
          </Panel>
        ))}
      </Collapse>
      </DragDropContext> */}
    </div>
  );
}
