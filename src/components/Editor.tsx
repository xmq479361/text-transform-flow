"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { EditorContent, ProcessingRule } from "../types";
import { debounce } from "lodash";

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

interface EditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  highlightRules: ProcessingRule[];
  isDarkMode: boolean;
}

export default function Editor({
  content,
  onChange,
  highlightRules,
  isDarkMode,
}: EditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [decorations, setDecorations] = useState<string[]>([]);
  const decorationsRef = useRef<string[]>([]);

  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange({
        text: value,
        language: content.language,
      });
    }, 300),
    [onChange, content.language]
  );
  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: content.text,
      language: content.language,
      theme: isDarkMode ? "vs-dark" : "vs-light",
      minimap: { enabled: false },
      automaticLayout: true,
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      lineNumbers: "on",
      wordWrap: "on",
      wrappingStrategy: "advanced",
      fontSize: 14,
      lineHeight: 21,
      padding: { top: 8, bottom: 8 },
      folding: true,
      foldingStrategy: "indentation",
      renderLineHighlight: "all",
      contextmenu: true,
      mouseWheelZoom: true,
      quickSuggestions: true,
      scrollBeyondLastLine: false,
    });

    editorRef.current.onDidChangeModelContent(() => {
      debouncedOnChange(editorRef.current?.getValue() || "");
    });

    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Clear previous decorations
    if (decorationsRef.current.length > 0) {
      model.deltaDecorations(decorationsRef.current, []);
    }

    const newDecorations = highlightRules.flatMap((rule) => {
      console.log("pattern", rule.pattern);
      if (!rule.pattern || !rule.pattern.trim() || !rule.enabled) return [];
      try {
        const matches = model.findMatches(
          rule.pattern,
          true,
          true,
          rule.caseSensitive,
          null,
          true
        );
        return matches.map((match) => ({
          range: match.range,
          options: {
            inlineClassName: "pattern-highlight",
            hoverMessage: { value: `Matches pattern: ${rule.pattern}` },
          },
        }));
      } catch (error) {
        console.error("Invalid regex pattern:", error);
        return [];
      }
    });
    const decorationIds = model.deltaDecorations([], newDecorations);
    decorationsRef.current = decorationIds;
    console.log("decorationIds", decorationIds);
    setDecorations(decorationIds);
  }, [highlightRules, content.text]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: isDarkMode ? "vs-dark" : "vs-light",
      });
    }
  }, [isDarkMode]);

  return <div ref={containerRef} className="h-full w-full" />;
}
