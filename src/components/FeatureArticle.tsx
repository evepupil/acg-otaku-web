'use client'

import { remark } from 'remark'
import html from 'remark-html'
import { useEffect, useState } from 'react'

interface FeatureArticleProps {
  content: string
}

export default function FeatureArticle({ content }: FeatureArticleProps) {
  const [htmlContent, setHtmlContent] = useState('')

  useEffect(() => {
    if (!content) return
    remark()
      .use(html)
      .process(content)
      .then(result => setHtmlContent(String(result)))
  }, [content])

  if (!content) return null

  return (
    <article
      className="prose prose-green prose-lg max-w-none
        prose-headings:text-gray-900 prose-headings:font-bold
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-lg
        prose-blockquote:border-green-500 prose-blockquote:bg-green-50/50 prose-blockquote:rounded-r-xl
        prose-code:text-green-700 prose-code:bg-green-50 prose-code:px-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
