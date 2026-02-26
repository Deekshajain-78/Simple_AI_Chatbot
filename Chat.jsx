import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Message from './Message'
import TypingDots from './TypingDots'

export default function Chat({ backendUrl, mode='rest' }){
  const [messages, setMessages] = useState([
    { id: 'm1', role: 'assistant', text: 'Hello — I am your chatbot. Ask me anything.' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const wsRef = useRef(null)
  const listRef = useRef(null)

  useEffect(()=>{
    if(mode === 'ws'){
      try{
        const wsUrl = backendUrl.replace(/^http/, 'ws')
        wsRef.current = new WebSocket(wsUrl)
        wsRef.current.onmessage = (e) => {
          setTyping(false)
          setMessages(m=>[...m, { id: Date.now().toString(), role: 'assistant', text: e.data }])
        }
      }catch(e){
        console.warn('WS connect failed', e)
      }
      return ()=>{ if(wsRef.current) wsRef.current.close() }
    }
  }, [mode, backendUrl])

  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, typing])

  async function send(){
    if(!input.trim()) return
    const text = input.trim()
    const id = Date.now().toString()
    setMessages(m=>[...m, { id, role:'user', text }])
    setInput('')
    setTyping(true)

    if(mode === 'ws' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN){
      wsRef.current.send(text)
      return
    }

    try{
      const res = await axios.post(backendUrl, { message: text }, { timeout: 60000 })
      const reply = res?.data?.reply ?? (typeof res.data === 'string'? res.data : 'No reply')
      setMessages(m=>[...m, { id: Date.now().toString(), role: 'assistant', text: reply }])
    }catch(err){
      setMessages(m=>[...m, { id: Date.now().toString(), role: 'assistant', text: 'Error: '+ (err.message || 'request failed') }])
    }finally{
      setTyping(false)
    }
  }

  function onKey(e){ if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div className="chat-shell">
      <div className="message-list" ref={listRef}>
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map(m=> (
            <motion.div key={m.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
              <Message message={m} />
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && <TypingDots />}
      </div>

      <div className="composer">
        <textarea placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} />
        <button onClick={send} className="send">Send</button>
      </div>
    </div>
  )
}
