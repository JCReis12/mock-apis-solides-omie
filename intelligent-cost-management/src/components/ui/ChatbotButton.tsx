import { ArrowUpRight, MessageSquare } from 'lucide-react'
import { chatbotUrl } from '../../data/chatbot'

export function ChatbotButton() {
  return (
    <a
      href={chatbotUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="button chatbot-button"
      aria-label="Acessar chatbot da equipe (abre em nova aba)"
      title="Abrir o ambiente da equipe no Google Cloud em nova aba"
    >
      <MessageSquare size={17} aria-hidden="true" />
      Acessar chatbot
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  )
}
