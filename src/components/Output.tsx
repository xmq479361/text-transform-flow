import { useEffect, useState, useCallback } from "react";
import { EditorContent, ProcessingFlow, FlowDictionary } from "../types";
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
  const [flowDictionary, setFlowDictionary] = useState<FlowDictionary>({});

  const unescapeString = (str: string): string => {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  const processText = useCallback(
    debounce((text: string, currentFlow: ProcessingFlow | null) => {
      if (!currentFlow || !text) {
        setProcessedText(text);
        onProcessedTextChange(text);
        return;
      }

      let result = text;
      let newFlowDictionary: FlowDictionary = {};

      currentFlow.rules.forEach((rule) => {
        if (!rule.enabled) return;

        try {
          const flags = `${rule.global ? "g" : ""}${
            rule.caseSensitive ? "" : "i"
          }`;
          const regex = new RegExp(rule.pattern, flags);

          if (rule.extractOnly) {
            const matches = result.match(regex);
            result = matches ? matches.join("\n") : "";
          } else {
            if (rule.storeInFlow && rule.flowKey) {
              console.log("rule.flowKey", rule.flowKey, rule.pattern);
              const matches = result.match(new RegExp(rule.pattern, flags));
              console.log("newFlowDictionary.flowKey", rule.flowKey, matches);
              if (matches) {
                newFlowDictionary[rule.flowKey] = matches;
              }
            }
            result = result.replace(regex, (match, ...args) => {
              let replacement = rule.replacement;

              // Replace ${{key[index]}} with values from flowDictionary
              replacement = replacement.replace(
                /\$\{\{(\w+)\[?(\d+)?\]\}\}?/g,
                (_, key, index) => {
                  console.log(
                    "newFlowDictionary get ",
                    key,
                    index,
                    newFlowDictionary[key]
                  );
                  if (key) {
                    if (index) {
                      return newFlowDictionary[key]?.[Number(index)] || match;
                    }
                    return newFlowDictionary[key][0] || match;
                  }
                  return match;
                }
              );

              // Process capture groups
              args.forEach((arg, index) => {
                replacement = replacement.replace(
                  new RegExp(`\\$${index + 1}`, "g"),
                  arg || ""
                );
              });
              console.log("replacement", replacement);
              return unescapeString(replacement);
            });
          }
        } catch (error) {
          console.error("Invalid regex pattern:", error);
        }
      });

      setFlowDictionary(newFlowDictionary);
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
