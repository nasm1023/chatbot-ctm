import { useState, useRef, useEffect } from 'react'
import { useChatMessages, sendMessage } from '../hooks/useChatMessages'
import type { ChatMessage } from '../types/chat'

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data, isLoading: isFetching } = useChatMessages()
    // const messages = data?.messages || []
    // const { mutateAsync: sendMsg, isPending } = useSendMessage()

    const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([])
    const rawMessages = [...(data?.messages || []), ...pendingMessages]
    const messages = Array.from(new Map(rawMessages.map(m => [m.id, m])).values())

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault()

    //     const trimmedInput = inputValue.trim()
    //     if (!trimmedInput || isPending) return

    //     setInputValue('')

    //     await sendMsg(trimmedInput)
    // }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return

        const tempUserMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        }

        setPendingMessages(prev => [...prev, tempUserMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const assistantReply = await sendMessage(tempUserMessage.content)
            setPendingMessages(prev => [...prev, assistantReply])
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // 1. Wrapper 
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">

            {/* 2. Chat Window */}
            {isOpen && (
                <div className="w-[350px] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 transition-all origin-bottom-right animate-in zoom-in-95 duration-200">

                    {/* Header: Cố định */}
                    <div className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
                        <h3 className="font-semibold text-base m-0">Customer Support</h3>
                        <button
                            className="text-white/80 hover:text-white transition-colors text-2xl leading-none h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10"
                            onClick={() => setIsOpen(false)}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
                        {isFetching && messages.length === 0 ? (
                            <div className="text-left text-slate-500 text-sm mt-4">Loading history...</div>
                        ) : (
                            messages.map((msg) => (
                                /* WRAPPER ĐỂ CĂN TRÁI/PHẢI CHUẨN XÁC */
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* BUBBLE TIN NHẮN */}
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm relative shadow-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                                            }`}
                                    >
                                        <p className="leading-relaxed break-words text-left">{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-blue-100 text-right' : 'text-slate-400 text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="bg-white border border-slate-100 text-slate-500 max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm self-start shadow-sm flex gap-1 items-center">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                        {/* Phần tử ẩn để Scroll tới */}
                        <div ref={messagesEndRef} className="h-1 shrink-0" />
                    </div>

                    {/* Input Area: Cố định */}
                    <form onSubmit={handleSubmit} className="flex p-3 bg-white border-t border-slate-100 gap-2 shrink-0">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading || isFetching}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading || isFetching}
                            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 -ml-0.5">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* 3. Floating Toggle Button */}
            <button
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? (
                    // X Icon
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    // Chat Icon
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </button>
        </div>
    )
}