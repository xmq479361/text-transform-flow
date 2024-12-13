import { useEffect, useState } from 'react'
import { EditorContent, ProcessingFlow } from '../types'

interface OutputProps {
  content: EditorContent
  flow: ProcessingFlow | null
  onProcessedTextChange: (text: string) => void
}

export default function Output({ content, flow, onProcessedTextChange }: OutputProps) {
  const [processedText, setProcessedText] = useState('')

  useEffect(() => {
    if (!flow || !content.text) {
      setProcessedText(content.text)
      onProcessedTextChange(content.text)
      return
    }

    let result = content.text
    flow.rules.forEach(rule => {
      if (!rule.enabled) return
      
      try {
        const flags = `${rule.global ? 'g' : ''}${rule.caseSensitive ? '' : 'i'}`
        const regex = new RegExp(rule.pattern, flags)
        result = result.replace(regex, rule.replacement)
      } catch (error) {
        console.error('Invalid regex pattern:', error)
      }
    })

    setProcessedText(result)
    onProcessedTextChange(result)
  }, [content.text, flow, onProcessedTextChange])

  return (
    <pre className="p-4 text-white whitespace-pre-wrap h-full overflow-auto">
      {processedText}
    </pre>
  )
}

