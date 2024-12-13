"use client";

import { Layout, Menu, Button, message } from "antd";
import { useState, useEffect } from "react";
import { CopyOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import Output from "./Output";
import { ProcessingFlow, EditorContent, ProcessingRule } from "../types";

const { Content, Sider } = Layout;

export default function AppLayout() {
  const [siderWidth, setSiderWidth] = useState(300);
  const [flows, setFlows] = useState<ProcessingFlow[]>([]);
  const [highlightPatterns, setHighlightPatterns] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ProcessingFlow | null>(null);
  const [editorContent, setEditorContent] = useState<EditorContent>({
    text: "",
    language: "javascript",
  });
  const [processedText, setProcessedText] = useState("");

  // Load flows from localStorage on component mount
  useEffect(() => {
    try {
      const savedFlows = localStorage.getItem("flows");
      console.log("restore Flows", savedFlows);
      if (savedFlows) {
        setFlows(JSON.parse(savedFlows));
      }
    } catch (error) {
      console.error("Error loading flows from localStorage:", error);
      message.error("Failed to load saved flows");
    }
  }, []);

  const handleSetFlows = (flows: ProcessingFlow[]) => {
    setFlows(flows);
    try {
      console.log("save flows", flows);
      localStorage.setItem("flows", JSON.stringify(flows));
    } catch (error) {
      console.error("Error saving flows to localStorage:", error);
      message.error("Failed to save flows");
    }
  };

  const handleFlowChange = (
    flowId: string,
    updates: Partial<ProcessingFlow>
  ) => {
    console.log("handleFlowChange", flowId, updates);
    handleSetFlows(
      flows.map((flow) => (flow.id === flowId ? { ...flow, ...updates } : flow))
    );
    if (selectedFlow && selectedFlow.id === flowId) {
      setSelectedFlow({ ...selectedFlow, ...updates });
    }
  };
  const handleRuleChange = (
    flowId: string,
    ruleId: string,
    updates: Partial<ProcessingRule>
  ) => {
    console.log("handleRuleChange", flowId, ruleId, updates);
    handleSetFlows(
      flows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              rules: flow.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
              ),
            }
          : flow
      )
    );
    if (selectedFlow && selectedFlow.id === flowId) {
      var rule = selectedFlow.rules.find((rule) => rule.id === ruleId);
      if (rule) {
        setHighlightPatterns([rule.pattern]);
      }
      setSelectedFlow({
        ...selectedFlow,
        rules: selectedFlow.rules.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule
        ),
      });
    }
  };

  const handleAddFlow = (flowName: string, id: string) => {
    const newFlow: ProcessingFlow = {
      id: id,
      name: flowName,
      rules: [],
    };
    handleSetFlows([...flows, newFlow]);
    message.success(`New flow "${flowName}" added`);
  };

  const handleAddRule = (flowId: string) => {
    const newRule: ProcessingRule = {
      id: Date.now().toString(),
      pattern: "",
      replacement: "",
      enabled: true,
      global: true,
      caseSensitive: false,
    };
    handleSetFlows(
      flows.map((flow) =>
        flow.id === flowId ? { ...flow, rules: [...flow.rules, newRule] } : flow
      )
    );
    console.log("handleAddRule", flowId, newRule, selectedFlow);
    if (selectedFlow && selectedFlow.id === flowId) {
      setSelectedFlow({
        ...selectedFlow,
        rules: [...selectedFlow.rules, newRule],
      });
    } else {
      setSelectedFlow(null);
    }
    message.success("New rule added");
  };

  const handleDeleteRule = (flowId: string, ruleId: string) => {
    handleSetFlows(
      flows.map((flow) =>
        flow.id === flowId
          ? { ...flow, rules: flow.rules.filter((rule) => rule.id !== ruleId) }
          : flow
      )
    );
    if (selectedFlow && selectedFlow.id === flowId) {
      setSelectedFlow({
        ...selectedFlow,
        rules: selectedFlow.rules.filter((rule) => rule.id !== ruleId),
      });
    }
    message.success("Rule deleted");
  };

  const handleCopyOutput = () => {
    navigator.clipboard
      .writeText(processedText)
      .then(() => message.success("Output copied to clipboard"))
      .catch(() => message.error("Failed to copy output"));
  };

  return (
    <Layout className="min-h-screen">
      <Sider width={siderWidth} className="overflow-auto" theme="dark">
        <Sidebar
          flows={flows}
          selectedFlow={selectedFlow}
          onFlowSelect={setSelectedFlow}
          onFlowChange={handleFlowChange}
          onRuleChange={handleRuleChange}
          onAddFlow={handleAddFlow}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
        />
      </Sider>
      <Layout>
        <Content className="flex flex-col">
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              <Menu mode="horizontal" theme="dark">
                <Menu.Item key="currentFlow">
                  当前处理流: {selectedFlow ? selectedFlow.name : "无"}
                </Menu.Item>
              </Menu>
              <div className="flex-1 overflow-auto">
                <Editor
                  content={editorContent}
                  onChange={setEditorContent}
                  highlightPatterns={highlightPatterns}
                />
              </div>
            </div>
            <div className="w-[400px] flex flex-col">
              <Menu mode="horizontal" theme="dark">
                <Menu.Item key="copy" onClick={handleCopyOutput}>
                  <CopyOutlined /> 复制
                </Menu.Item>
              </Menu>
              <div className="flex-1 overflow-auto">
                <Output
                  content={editorContent}
                  flow={selectedFlow}
                  onProcessedTextChange={setProcessedText}
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
