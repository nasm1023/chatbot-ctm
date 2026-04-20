import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ChatMessage, ChatResponse } from '../types/chat'
import apiClient from '../api/client'

// Mock data
const mockMessages: ChatMessage[] = [
    {
        id: '1',
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
        id: '2',
        role: 'user',
        content: 'I have a question about your services',
        timestamp: new Date(Date.now() - 4 * 60000),
    },
    {
        id: '3',
        role: 'assistant',
        content: 'Sure! I\'d be happy to help. What would you like to know?',
        timestamp: new Date(Date.now() - 3 * 60000),
    },
    {
        id: '4',
        role: 'user',
        content: 'What are your business hours?',
        timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
        id: '5',
        role: 'assistant',
        content: 'We\'re available 24/7 to assist you. Feel free to reach out anytime!',
        timestamp: new Date(Date.now() - 60000),
    },
]

const fetchChatMessages = async (): Promise<ChatResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ messages: mockMessages })
        }, 500)
    })

    // Uncomment below when you have a real API and remove above
    // const response = await apiClient.get<ChatResponse>('/messages')
    // return response.data
}

export const useChatMessages = () => {
    return useQuery({
        queryKey: ['chatMessages'],
        queryFn: fetchChatMessages,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const sendMessage = async (message: string): Promise<ChatMessage> => {
    // Mock response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: Math.random().toString(36).substr(2, 9),
                role: 'assistant',
                content: `This is a mock response to: "${message}"`,
                timestamp: new Date(),
            })
        }, 800)
    })

    // Uncomment below when you have a real API and remove above
    // const response = await apiClient.post<ChatMessage>('/messages', { content: message })
    // return response.data
}

const postMessage = async (message: string): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>('/messages', { content: message })
    return response.data
}

export const useSendMessage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: postMessage,

        onSuccess: (newServerMessage) => {
            queryClient.setQueryData(['chatMessages'], (oldData: ChatResponse | undefined) => {
                if (!oldData) return { messages: [newServerMessage] }

                return {
                    ...oldData,
                    messages: [...oldData.messages, newServerMessage]
                }
            })
        },
        onError: (error) => {
            console.error("Failed to send message:", error)
        }
    })
}