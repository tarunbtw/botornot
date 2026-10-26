import WebSocket from 'ws'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { game } from '../db/schema/games.js'

async function runLiveE2E() {
  console.log('[E2E] 1. Creating guest session...')
  const sessionRes = await fetch('http://localhost:4000/api/auth/guest-session', {
    method: 'POST',
  })
  if (!sessionRes.ok) {
    throw new Error(`Failed to create guest session: ${sessionRes.statusText}`)
  }
  const sessionCookie = sessionRes.headers.get('set-cookie')
  const sessionData = (await sessionRes.json()) as { user: { name: string; id: string } }
  console.log('[E2E] Guest created:', sessionData.user.name, sessionData.user.id)

  console.log('[E2E] 2. Connecting to WebSocket ws://localhost:4000/ws...')
  const ws = new WebSocket('ws://localhost:4000/ws', {
    headers: {
      cookie: sessionCookie || '',
    },
  })

  await new Promise<void>((resolve, reject) => {
    ws.on('open', () => {
      console.log('[E2E] WebSocket connected!')
      resolve()
    })
    ws.on('error', reject)
  })

  let currentGameId: string | null = null

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('E2E timed out waiting for flow')), 25000)

    ws.on('message', async (data) => {
      const msg = JSON.parse(data.toString())
      console.log('[E2E WS Event Received]:', msg.type, msg.payload || '')

      if (msg.type === 'connection.ready') {
        console.log('[E2E] Joining matchmaking queue...')
        ws.send(JSON.stringify({ type: 'queue.join' }))
      }

      if (msg.type === 'game.started') {
        currentGameId = msg.payload.gameId
        console.log(`[E2E] Game started! ID: ${currentGameId}. Sending chat message...`)
        ws.send(
          JSON.stringify({
            type: 'chat.send',
            payload: {
              gameId: currentGameId,
              content: 'Hey there! Are you a real human or a bot?',
            },
          }),
        )
      }

      if (msg.type === 'chat.ai_done') {
        console.log(`[E2E] Received AI opponent response: "${msg.payload.content}"`)
        console.log('[E2E] Fast-forwarding game timer to simulate 120s timer expiration...')
        await db
          .update(game)
          .set({
            status: 'GUESSING',
            initialEndsAt: new Date(Date.now() - 5000),
          })
          .where(eq(game.id, currentGameId!))

        console.log('[E2E] Submitting guess "AI"...')
        ws.send(
          JSON.stringify({
            type: 'guess.submit',
            payload: {
              gameId: currentGameId,
              guess: 'AI',
            },
          }),
        )
      }

      if (msg.type === 'guess.result') {
        console.log('[E2E] Guess result received:', msg.payload)
        console.log(`[E2E] Correct? ${msg.payload.isCorrect}! Reward: +${msg.payload.reward} tokens! Balance: ${msg.payload.balanceAfter}`)
        clearTimeout(timer)
        ws.close()
        resolve()
      }
    })
  })

  console.log('\n🎉 [E2E] End-to-end game lifecycle test completed successfully!')

  console.log('[E2E] 3. Testing DELETE /api/me account deletion...')
  const deleteRes = await fetch('http://localhost:4000/api/me', {
    method: 'DELETE',
    headers: {
      cookie: sessionCookie || '',
    },
  })
  if (!deleteRes.ok) {
    throw new Error(`Account deletion failed with status ${deleteRes.status}`)
  }
  const deleteData = (await deleteRes.json()) as { success: boolean; message: string }
  console.log('[E2E] Delete account response:', deleteData)

  const verifyRes = await fetch('http://localhost:4000/api/me', {
    headers: {
      cookie: sessionCookie || '',
    },
  })
  if (verifyRes.status !== 401) {
    throw new Error(`Expected 401 after deletion, got ${verifyRes.status}`)
  }
  console.log('[E2E] Confirmed account deletion: GET /api/me returns 401 Unauthorized!')
  console.log('✅ [E2E] Full end-to-end + Account Deletion passed!')
}

runLiveE2E().catch((err) => {
  console.error('E2E test failed:', err)
  process.exit(1)
})
