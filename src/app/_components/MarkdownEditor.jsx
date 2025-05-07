import React from 'react'
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import '../globals.css'

const mdParser = new MarkdownIt({ html: true })

const MarkdownEditor = ({ label, value, onChange }) => {
  const handleEditorChange = ({ text }) => {
    onChange(text)
  }

  return (
    <div className='bg-[#00000061] p-2 rounded'>
      <label className='block text-sm font-medium mb-1'>{label}</label>
      <MdEditor
        value={value}
        style={{ height: '400px' }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
      <p className='text-xs text-gray-400 mt-1'>
        Markdown & raw HTML supported
      </p>
    </div>
  )
}

export default MarkdownEditor
