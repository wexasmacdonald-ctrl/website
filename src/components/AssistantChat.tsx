import { useState, useRef, useEffect } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import Logo from './Logo'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const previousOverflow = useRef<string | null>(null)
  const desktopContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(max-width: 767px)')
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)

    setIsMobile(mql.matches)

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange)
      return () => mql.removeEventListener('change', handleChange)
    }

    mql.addListener(handleChange)
    return () => mql.removeListener(handleChange)
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isMobile) return

    const body = document.body
    if (isOpen) {
      previousOverflow.current = body.style.overflow
      body.style.overflow = 'hidden'
    } else if (previousOverflow.current !== null) {
      body.style.overflow = previousOverflow.current
    }

    return () => {
      if (previousOverflow.current !== null) {
        body.style.overflow = previousOverflow.current
      }
    }
  }, [isMobile, isOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOpen = () => {
      setIsOpen(true)
      setError(null)
    }
    window.addEventListener('open-assistant-chat', handleOpen)
    return () => window.removeEventListener('open-assistant-chat', handleOpen)
  }, [])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const resp = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data?.error || 'Assistant unavailable right now')
      }
      const data = await resp.json()
      const reply = typeof data?.message === 'string' ? data.message.trim() : ''
      if (!reply) throw new Error('Assistant returned an empty response')
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await sendMessage()
  }

  function handleTextareaKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  useEffect(() => {
    if (!isOpen || isMobile) return
    function handleClickOutside(event: MouseEvent) {
      if (desktopContainerRef.current && !desktopContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setError(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isMobile])

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 hidden rounded-full bg-[--color-brand-red] px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-black/30 transition hover:scale-105 md:inline-flex md:items-center md:justify-center"
        >
          Ask MacDonald AI
        </button>
      )}

      {isOpen && (
        <>
          {isMobile ? (
            <div
              className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setIsOpen(false)
                setError(null)
              }}
            >
              <div
                className="mt-auto w-full px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/15 bg-black/90 shadow-2xl shadow-black/60">
                  <header className="flex items-center justify-between border-b border-white/10 px-5 pt-5 pb-4">
                    <div className="flex items-center gap-2">
                      <Logo className="flex-shrink-0" forceExpanded textClassName="text-base" showUnderline={false} />
                      <span className="text-xs font-semibold uppercase tracking-wide text-[--color-brand-red] leading-none">
                        Assistant
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false)
                        setError(null)
                      }}
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-red]/70"
                    >
                      Close
                    </button>
                  </header>
                  <div ref={scrollRef} className="max-h-[55vh] overflow-y-auto px-5 py-4 space-y-3 text-sm text-white/90">
                    {messages.length === 0 && (
                      <p className="rounded-lg bg-white/5 px-3 py-2 text-white/70">
                        How can I help today?
                      </p>
                    )}
                    {messages.map((msg, idx) => (
                      <div
                        key={`${msg.role}-${idx}`}
                        className={msg.role === 'user' ? 'text-right' : 'text-left'}
                      >
                        {msg.role === 'user' ? (
                          <div className="inline-block max-w-[80%] rounded-lg bg-[--color-brand-red] px-3 py-2 text-black">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="inline-block max-w-[80%] rounded-lg border border-[--color-brand-red] bg-white/5 px-3 py-2 text-white">
                            <ReactMarkdown className="assistant-markdown">{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start text-white/60">
                        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                          <span className="sr-only">Assistant is typing</span>
                          <div className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[--color-brand-red]" />
                            <span className="inline-block h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.2s] rounded-full bg-[--color-brand-red]" />
                            <span className="inline-block h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.4s] rounded-full bg-[--color-brand-red]" />
                          </div>
                        </div>
                      </div>
                    )}
                    {error && (
                      <p className="rounded bg-red-500/20 px-3 py-2 text-xs text-red-200">
                        {error}
                      </p>
                    )}
                  </div>
                  <form onSubmit={handleSubmit} className="border-t border-white/10 px-5 py-4">
                    <label className="sr-only" htmlFor="assistant-chat-input">
                      Message MacDonald AI Assistant
                    </label>
                    <textarea
                      id="assistant-chat-input"
                      rows={2}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Ask your question…"
                      className="w-full resize-none rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[--color-brand-red]/70"
                      disabled={loading}
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="rounded-lg bg-[--color-brand-red] px-4 py-2 text-sm font-semibold text-black transition disabled:opacity-50"
                      >
                        {loading ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={desktopContainerRef}
              className="fixed bottom-5 right-5 z-40 flex w-[320px] flex-col rounded-xl border border-white/15 bg-black/85 backdrop-blur-md shadow-2xl shadow-black/40"
            >
              <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Logo className="flex-shrink-0" forceExpanded textClassName="text-sm" showUnderline={false} />
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[--color-brand-red] leading-none">
                    Assistant
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setError(null)
                  }}
                  className="rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </header>

              <div ref={scrollRef} className="max-h-72 overflow-y-auto px-4 py-3 space-y-3 text-sm text-white/90">
                {messages.length === 0 && (
                  <p className="rounded-lg bg-white/5 px-3 py-2 text-white/70">
                    How can I help today?
                  </p>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}`}
                    className={msg.role === 'user' ? 'text-right' : 'text-left'}
                  >
                    {msg.role === 'user' ? (
                      <div className="inline-block max-w-[80%] rounded-lg bg-[--color-brand-red] px-3 py-2 text-black">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="inline-block max-w-[80%] rounded-lg border border-[--color-brand-red] bg-white/5 px-3 py-2 text-white">
                        <ReactMarkdown className="assistant-markdown">{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start text-white/60">
                    <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                      <span className="sr-only">Assistant is typing</span>
                      <div className="flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[--color-brand-red]" />
                        <span className="inline-block h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.2s] rounded-full bg-[--color-brand-red]" />
                        <span className="inline-block h-1.5 w-1.5 animate-[bounce_1.2s_infinite_0.4s] rounded-full bg-[--color-brand-red]" />
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <p className="rounded bg-red-500/20 px-3 py-2 text-xs text-red-200">
                    {error}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-white/10 px-3 py-2">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Ask your question…"
                  className="w-full resize-none rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[--color-brand-red]/70"
                  disabled={loading}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="rounded-lg bg-[--color-brand-red] px-3 py-1.5 text-sm font-semibold text-black transition disabled:opacity-50"
                  >
                    {loading ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </>
  )
}
