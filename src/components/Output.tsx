import { useEffect, useState, useCallback } from "react";
import { EditorContent, ProcessingFlow } from "../types";
import { debounce } from "lodash";

interface OutputProps {
  content: EditorContent;
  flow: ProcessingFlow | null;
  onProcessedTextChange: (text: string) => void;
  isRealTimeProcessing: boolean;
}

export default function Output({
  content,
  flow,
  onProcessedTextChange,
  isRealTimeProcessing,
}: OutputProps) {
  const [processedText, setProcessedText] = useState("");

  const processText = useCallback(
    debounce((text: string, currentFlow: ProcessingFlow | null) => {
      if (!currentFlow || !text) {
        setProcessedText(text);
        onProcessedTextChange(text);
        return;
      }

      let result = text;
      currentFlow.rules.forEach((rule) => {
        if (!rule.enabled) return;

        try {
          const flags = `${rule.global ? "g" : ""}${
            rule.caseSensitive ? "" : "i"
          }`;
          const regex = new RegExp(rule.pattern, flags);
          result = result.replace(regex, rule.replacement);
        } catch (error) {
          console.error("Invalid regex pattern:", error);
        }
      });

      setProcessedText(result);
      onProcessedTextChange(result);
    }, 300),
    [onProcessedTextChange]
  );
  useEffect(() => {
    if (isRealTimeProcessing) {
      processText(content.text, flow);
    }
  }, [content.text, flow, processText, isRealTimeProcessing]);
  useEffect(() => {
    if (!isRealTimeProcessing) {
      setProcessedText(content.text);
      onProcessedTextChange(content.text);
    }
  }, [isRealTimeProcessing, content.text, onProcessedTextChange]);
  return (
    <pre className={`p-2 whitespace-pre-wrap h-full `}>{processedText}</pre>
  );
}
