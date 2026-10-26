const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const defaultWsProto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${defaultWsProto}//${defaultHost}:4000/ws`

export type ServerEvent =
  | { type: 'connection.ready'; payload: { userId: string; publicId: string; tokenBalance: number } }
  | { type: 'queue.waiting' }
  | { type: 'game.matched'; payload: { gameId: string } }
  | { type: 'game.started'; payload: { gameId: string; endsAt: string; isFirstSender: boolean } }
  | {
      type: 'chat.message'
      payload: {
        id: string
        isSelf: boolean
        sequenceNumber: number
        content: string
        createdAt: string
      }
    }
  | { type: 'chat.ai_delta'; payload: { delta: string } }
  | { type: 'chat.ai_done'; payload: { id: string; sequenceNumber: number; content: string } }
  | { type: 'session.ended'; payload: { gameId: string } }
  | { type: 'guess.request'; payload: { gameId: string } }
  | {
      type: 'guess.result'
      payload: {
        guess: 'HUMAN' | 'AI'
        isCorrect: boolean
        reward: number
        actualOpponentType: 'HUMAN' | 'AI'
        balanceAfter: number
      }
    }
  | { type: 'game.resolved'; payload: { gameId: string; canExtend: boolean } }
  | { type: 'extension.requested'; payload: { requestId: string; cost: number; expiresAt: string } }
  | { type: 'extension.accepted'; payload: { requestId: string } }
  | { type: 'extension.declined'; payload: { requestId: string } }
  | { type: 'extension.started'; payload: { gameId: string; endsAt: string } }
  | { type: 'extension.ended'; payload: { gameId: string } }
  | { type: 'token.balance'; payload: { balance: number } }
  | { type: 'pong' }
  | { type: 'error'; code: string; message: string }

type EventHandler = (event: ServerEvent) => void

export class GameSocketClient {
  private ws: WebSocket | null = null
  private handlers: Set<EventHandler> = new Set()
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private isExplicitClose = false
  private sendQueue: object[] = []

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.isExplicitClose = false
    try {
      const token = localStorage.getItem('botornot_auth_token')
      const targetUrl = token
        ? `${WS_URL}${WS_URL.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
        : WS_URL

      console.log('[WS Client] Connecting with token:', token ? 'present' : 'none')
      this.ws = new WebSocket(targetUrl)

      this.ws.onopen = () => {
        console.log('[WS Client] Connected. Flushing queue of', this.sendQueue.length, 'messages')
        while (this.sendQueue.length > 0) {
          const item = this.sendQueue.shift()
          if (item && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(item))
          }
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as ServerEvent
          this.handlers.forEach((h) => h(parsed))
        } catch {
          // Ignore malformed message
        }
      }

      this.ws.onclose = (event) => {
        console.log('[WS Client] Closed:', event.code, event.reason)
        if (event.code === 4401) {
          this.handlers.forEach((h) =>
            h({
              type: 'error',
              code: 'UNAUTHORIZED',
              message: 'Authentication session required to play',
            }),
          )
          return
        }
        if (!this.isExplicitClose) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 2000)
        }
      }

      this.ws.onerror = (err) => {
        console.warn('[WS Client] Error:', err)
      }
    } catch (err) {
      console.warn('[WS Client] Connection failed:', err)
    }
  }

  disconnect() {
    this.isExplicitClose = true
    this.sendQueue = []
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendQueue.push(data)
      // Ensure connect is in flight if not already
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
        this.connect()
      }
    }
  }

  joinQueue() {
    this.send({ type: 'queue.join' })
  }

  cancelQueue() {
    this.sendQueue = this.sendQueue.filter((item: any) => item.type !== 'queue.join')
    this.send({ type: 'queue.cancel' })
  }

  sendMessage(gameId: string, content: string) {
    this.send({
      type: 'chat.send',
      payload: { gameId, content },
    })
  }

  submitGuess(gameId: string, guess: 'HUMAN' | 'AI') {
    this.send({
      type: 'guess.submit',
      payload: { gameId, guess },
    })
  }

  requestExtension(gameId: string) {
    this.send({
      type: 'extension.request',
      payload: { gameId },
    })
  }

  respondExtension(requestId: string, accept: boolean) {
    this.send({
      type: 'extension.respond',
      payload: { requestId, accept },
    })
  }
}

export const gameSocket = new GameSocketClient()
