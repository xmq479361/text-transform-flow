'use client'

import { useEffect, useRef, useState } from 'react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { EditorContent } from '../types'
import { debounce } from 'lodash'

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

interface EditorProps {
  content: EditorContent
  onChange: (content: EditorContent) => void
  highlightPatterns: string[]
}

export default function Editor({ content, onChange, highlightPatterns }: EditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [decorations, setDecorations] = useState<string[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: content.text,
      language: content.language,
      theme: 'vs-dark',
      minimap: { enabled: false },
      automaticLayout: true
    })

    const debouncedOnChange = debounce(() => {
      onChange({
        text: editorRef.current?.getValue() || '',
        language: content.language
      })
    }, 300)

    editorRef.current.onDidChangeModelContent(debouncedOnChange)

    return () => {
      editorRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const model = editorRef.current.getModel()
    if (!model) return

    const newDecorations = highlightPatterns.flatMap(pattern => {
      if (!pattern) return []
      try {
        const matches = model.findMatches(pattern, true, false, true, null, true)
        return matches.map(match => ({
          range: match.range,
          options: {
            inlineClassName: 'pattern-highlight',
            hoverMessage: { value: `Matches pattern: ${pattern}` }
          }
        }))
      } catch (error) {
        console.error('Invalid regex pattern:', error)
        return []
      }
    })

    const decorationIds = editorRef.current.deltaDecorations(decorations, newDecorations)
    setDecorations(decorationIds)
  }, [highlightPatterns, content.text])

  return (
    <div ref={containerRef} className="h-full w-full" />
  )
}

