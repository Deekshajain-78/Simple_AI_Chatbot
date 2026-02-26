import React from 'react'

export default function Message({ message }){
  const isUser = message.role === 'user'
  return (
    <div className={"message " + (isUser? 'user' : 'assistant')}>
      <div className="bubble">
        <div className="text">{message.text}</div>
      </div>
    </div>
  )
}
