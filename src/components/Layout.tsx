"use client";

import { Layout as AntLayout, Button, message, Switch } from "antd";
import { useState, useEffect } from "react";
import { CopyOutlined } from "@ant-design/icons";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import Output from "./Output";
import {
  ProcessingFlow,
  EditorContent,
  ProcessingRule,
  LayoutSizeProps,
  LayoutSizes,
} from "../types";
import { Resizable } from "re-resizable";

const { Content } = AntLayout;

const siderWidthConfig: LayoutSizeProps = {
  min: 15,
  default: 20,
  max: 40,
};
const editorWidth: LayoutSizeProps = {
  min: 30,
  default: 45,
  max: 60,
};
const outputWidth: LayoutSizeProps = {
  min: 20,
  default: 35,
  max: 50,
};
const DEFAULT_LAYOUT: LayoutSizes = {
  siderWidthPercent: 20, // 20% of total width
  editorWidthPercent: 45, // 45% of total width
  outputWidthPercent: 35, // 35% of total width
};

interface AppLayoutProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  flows: ProcessingFlow[];
  onFlowsChange: (flows: ProcessingFlow[]) => void;
}

export default function AppLayout({
  isDarkMode,
  setIsDarkMode,
  flows,
  onFlowsChange,
}: AppLayoutProps) {
  const [layout, setLayout] = useState<LayoutSizes>(() => {
    const savedLayout = localStorage.getItem("layoutP");
    console.log("savedLayout", savedLayout);
    return savedLayout ? JSON.parse(savedLayout) : DEFAULT_LAYOUT;
  });
  const [highlightRules, setHighlightRules] = useState<ProcessingRule[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ProcessingFlow | null>(
    () => {
      const savedFlow = localStorage.getItem("selectedFlow");

      return savedFlow ? JSON.parse(savedFlow) : null;
    }
  );
  const [editorContent, setEditorContent] = useState<EditorContent>(() => {
    const savedContent = localStorage.getItem("editorContent");
    return savedContent
      ? JSON.parse(savedContent)
      : {
          text: "",
          language: "javascript",
        };
  });
  const [processedText, setProcessedText] = useState("");
  const [isRealTimeProcessing, setIsRealTimeProcessing] = useState(true);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const updateContainerWidth = () => {
      const root = document.getElementById("root");
      if (root) {
        console.log("updateContainerWidth", root.clientWidth);
        setContainerWidth(root.clientWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("layoutP", JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("selectedFlow", JSON.stringify(selectedFlow));
  }, [selectedFlow]);

  useEffect(() => {
    localStorage.setItem("editorContent", JSON.stringify(editorContent));
  }, [editorContent]);

  const handleFlowChange = (
    flowId: string,
    updates: Partial<ProcessingFlow>
  ) => {
    console.log("handleFlowChange", flowId, updates);
    onFlowsChange(
      flows.map((flow) => (flow.id === flowId ? { ...flow, ...updates } : flow))
    );
    if (selectedFlow && selectedFlow.id === flowId) {
      setSelectedFlow({ ...selectedFlow, ...updates });
    }
  };

  const handleDeleteFlow = (flowId: string) => {
    onFlowsChange(flows.filter((flow) => flow.id !== flowId));
  };

  const handleFlowSelect = (flow: ProcessingFlow | null) => {
    setSelectedFlow(flow);
    if (flow?.enabled && flow?.rules) {
      setHighlightRules(flow.rules.filter((rule) => rule.enabled));
    } else {
      setHighlightRules([]);
    }
  };

  const handleRuleChange = (
    flowId: string,
    ruleId: string,
    updates: Partial<ProcessingRule>
  ) => {
    console.log("handleRuleChange", flowId, ruleId, updates);
    onFlowsChange(
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
      console.log("setHighlightPatterns", updates.pattern, updates);
      if (updates.pattern || updates.enabled != null) {
        var rule = selectedFlow.rules.find((rule) => rule.id === ruleId);
        if (rule) {
          rule = { ...rule, ...updates };
          var pattern = rule.enabled == true ? rule.pattern : "";
          console.log("setHighlightPatterns", pattern);
          setHighlightRules([rule]);
        }
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
      enabled: true,
      rules: [],
    };
    onFlowsChange([...flows, newFlow]);
    message.success(`New flow "${flowName}" added`);
  };

  const handleAddRule = (flowId: string) => {
    const newRule: ProcessingRule = {
      id: Date.now().toString(),
      pattern: "",
      replacement: "",
      description: "",
      enabled: true,
      global: true,
      extractOnly: false,
      caseSensitive: false,
    };
    onFlowsChange(
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
    onFlowsChange(
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
  const handleReorderRules = (
    flowId: string,
    startIndex: number,
    endIndex: number
  ) => {
    const updatedFlows = flows.map((flow) => {
      if (flow.id === flowId) {
        const newRules = Array.from(flow.rules);
        const [reorderedItem] = newRules.splice(startIndex, 1);
        newRules.splice(endIndex, 0, reorderedItem);
        return {
          ...flow,
          rules: newRules.map((rule, index) => ({ ...rule, order: index })),
        };
      }
      return flow;
    });
    onFlowsChange(updatedFlows);
    if (selectedFlow && selectedFlow.id === flowId) {
      const newRules = Array.from(selectedFlow.rules);
      const [reorderedItem] = newRules.splice(startIndex, 1);
      newRules.splice(endIndex, 0, reorderedItem);
      setSelectedFlow({
        ...selectedFlow,
        rules: newRules.map((rule, index) => ({ ...rule, order: index })),
      });
    }
  };

  const handleCopyOutput = () => {
    navigator.clipboard
      .writeText(processedText)
      .then(() => message.success("Output copied to clipboard"))
      .catch(() => message.error("Failed to copy output"));
  };

  const getPixelWidth = (percentage: number) => {
    return (percentage / 100) * containerWidth;
  };

  const handleResizeStop = (
    direction: "left" | "right",
    panelType: keyof LayoutSizes,
    delta: number
  ) => {
    const deltaPercent = (delta / containerWidth) * 100;

    setLayout((prev) => {
      const newLayout = { ...prev };
      console.log("handleResizeStop", "prev", prev);
      if (panelType === "siderWidthPercent") {
        newLayout.siderWidthPercent = Math.max(
          siderWidthConfig.min,
          Math.min(siderWidthConfig.max, prev.siderWidthPercent + deltaPercent)
        );
        newLayout.editorWidthPercent = Math.max(
          editorWidth.min,
          Math.min(
            editorWidth.max,
            100 - newLayout.siderWidthPercent - prev.outputWidthPercent
          )
        );
        newLayout.outputWidthPercent =
          100 - newLayout.siderWidthPercent - newLayout.editorWidthPercent;
      } else if (panelType === "editorWidthPercent") {
        newLayout.editorWidthPercent = Math.max(
          editorWidth.min,
          Math.min(editorWidth.max, prev.editorWidthPercent + deltaPercent)
        );
        newLayout.outputWidthPercent = Math.max(
          outputWidth.min,
          Math.min(
            outputWidth.max,
            100 - newLayout.siderWidthPercent - newLayout.editorWidthPercent
          )
        );
      }

      return newLayout;
    });

    setIsResizing(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleRealTimeProcessing = () => {
    setIsRealTimeProcessing(!isRealTimeProcessing);
  };
  return (
    <AntLayout
      className={`app-container ${isDarkMode ? "theme-dark" : "theme-light"} `}
    >
      <Resizable
        size={{
          width: getPixelWidth(layout.siderWidthPercent),
        }}
        maxWidth={getPixelWidth(siderWidthConfig.max)}
        minWidth={getPixelWidth(siderWidthConfig.min)}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={(_e, _direction, _ref, d) => {
          handleResizeStop("right", "siderWidthPercent", d.width);
        }}
        enable={{ right: true }}
        className="relative panel flex-row h-full"
      >
        <div className="scroll-container sidebar h-full">
          <Sidebar
            flows={flows}
            selectedFlow={selectedFlow}
            onFlowSelect={handleFlowSelect}
            onFlowChange={handleFlowChange}
            onFlowDelete={handleDeleteFlow}
            onRuleChange={handleRuleChange}
            onAddFlow={handleAddFlow}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onReorderRules={handleReorderRules}
            setHighlightRules={setHighlightRules}
          />
        </div>
        <div
          className={`resizable-handle right ${isResizing ? "active" : ""}`}
        />
      </Resizable>
      <AntLayout>
        <Content className="flex  flex flex-row overflow-hidden">
          <Resizable
            size={{
              width: getPixelWidth(layout.editorWidthPercent),
              height: "100%",
            }}
            maxWidth={getPixelWidth(editorWidth.max)}
            minWidth={getPixelWidth(editorWidth.min)}
            onResizeStart={() => setIsResizing(true)}
            onResizeStop={(e, _direction, _ref, d) => {
              handleResizeStop("right", "editorWidthPercent", d.width);
            }}
            enable={{ right: true }}
            className="relative panel h-full"
          >
            <div className="flex-1 flex flex-col h-full">
              <div className="panel-header p-2 flex items-center justify-between">
                <span>当前处理流: {selectedFlow?.name || "无"}</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checkedChildren="Dark"
                    unCheckedChildren="Light"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  {/* <Switch
                    checkedChildren="实时处理"
                    unCheckedChildren="Manual"
                    checked={isRealTimeProcessing}
                    onChange={toggleRealTimeProcessing}
                  /> */}
                </div>
              </div>
              <div className="flex-1 scroll-container">
                <Editor
                  content={editorContent}
                  onChange={setEditorContent}
                  highlightRules={highlightRules}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
            <div
              className={`resizable-handle right ${isResizing ? "active" : ""}`}
            />
          </Resizable>
          {(editorContent.text || !isRealTimeProcessing) && (
            <div
              className="panel flex flex-col"
              style={{
                width: `${getPixelWidth(layout.outputWidthPercent)}px`,
              }}
            >
              <div className="panel-header p-2 flex items-center">
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleCopyOutput}
                  className="theme-input"
                >
                  复制
                </Button>
                {/* {!isRealTimeProcessing && (
                  <Button
                    onClick={() => setProcessedText(editorContent.text)}
                    className="theme-input ml-2"
                  >
                    处理
                  </Button>
                )} */}
              </div>
              <div className="flex-1 scroll-container h-full overflow-x-scroll">
                <Output
                  content={editorContent}
                  flow={selectedFlow}
                  onProcessedTextChange={setProcessedText}
                  isRealTimeProcessing={isRealTimeProcessing}
                />
              </div>
            </div>
          )}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
