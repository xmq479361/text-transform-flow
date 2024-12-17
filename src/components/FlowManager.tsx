import React, { useState, useEffect } from "react";
import { message } from "antd";
import { ProcessingFlow, ProcessingRule } from "../types";

interface FlowManagerProps {
  onFlowsChange: (flows: ProcessingFlow[]) => void;
}

export default function FlowManager({ onFlowsChange }: FlowManagerProps) {
  const [flows, setFlows] = useState<ProcessingFlow[]>([]);

  useEffect(() => {
    try {
      const savedFlows = localStorage.getItem("flows");
      if (savedFlows) {
        setFlows(JSON.parse(savedFlows));
      }
    } catch (error) {
      console.error("Error loading flows from localStorage:", error);
      message.error("Failed to load saved flows");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flows", JSON.stringify(flows));
      onFlowsChange(flows);
    } catch (error) {
      console.error("Error saving flows to localStorage:", error);
      message.error("Failed to save flows");
    }
  }, [flows, onFlowsChange]);

  const handleFlowChange = (
    flowId: string,
    updates: Partial<ProcessingFlow>
  ) => {
    setFlows(
      flows.map((flow) => (flow.id === flowId ? { ...flow, ...updates } : flow))
    );
  };

  const handleRuleChange = (
    flowId: string,
    ruleId: string,
    updates: Partial<ProcessingRule>
  ) => {
    setFlows(
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
  };

  const handleAddFlow = (flowName: string) => {
    const newFlow: ProcessingFlow = {
      id: Date.now().toString(),
      name: flowName,
      rules: [],
    };
    setFlows([...flows, newFlow]);
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
      caseSensitive: false,
      extractOnly: false,
      order: flows.find((flow) => flow.id === flowId)?.rules.length || 0,
    };
    setFlows(
      flows.map((flow) =>
        flow.id === flowId ? { ...flow, rules: [...flow.rules, newRule] } : flow
      )
    );
    message.success("New rule added");
  };

  const handleDeleteRule = (flowId: string, ruleId: string) => {
    setFlows(
      flows.map((flow) =>
        flow.id === flowId
          ? { ...flow, rules: flow.rules.filter((rule) => rule.id !== ruleId) }
          : flow
      )
    );
    message.success("Rule deleted");
  };

  const handleReorderRules = (
    flowId: string,
    startIndex: number,
    endIndex: number
  ) => {
    setFlows(
      flows.map((flow) => {
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
      })
    );
  };

  return {
    flows,
    handleFlowChange,
    handleRuleChange,
    handleAddFlow,
    handleAddRule,
    handleDeleteRule,
    handleReorderRules,
  };
}
