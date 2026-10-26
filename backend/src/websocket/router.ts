import type { WebSocket } from 'ws'
import { clientEventSchema } from './protocol.js'
import { connectionManager } from './connection-manager.js'
import { matchmakingService } from '../modules/matchmaking/queue.js'
import { chatService } from '../modules/chat/service.js'
import { guessService } from '../modules/games/guess.js'
import { extensionService } from '../modules/extensions/service.js'
import { gameService } from '../modules/games/state-machine.js'
import { statsService } from '../modules/stats/service.js'

export async function handleWebSocketConnection(
  socket: WebSocket,
  userId: string,
  initialMessages: (string | Buffer | ArrayBuffer | Buffer[])[] = [],
) {
  connectionManager.addConnection(userId, socket)

  // Send connection ready with initial user profile stats
  try {
    const stats = await statsService.getUserStats(userId)
    if (stats) {
      connectionManager.sendToSocket(socket, {
        type: 'connection.ready',
        payload: {
          userId,
          publicId: stats.publicId,
          tokenBalance: stats.tokenBalance,
        },
      })
    }
  } catch (err) {
    console.error('[WS] Failed to send connection.ready:', err)
  }

  const processIncomingMessage = async (data: string | Buffer | ArrayBuffer | Buffer[]) => {
    let rawText: string
    try {
      rawText = data.toString()
    } catch {
      connectionManager.sendError(socket, 'INVALID_DATA', 'Could not read message frame')
      return
    }

    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawText)
    } catch {
      connectionManager.sendError(socket, 'MALFORMED_JSON', 'Invalid JSON syntax')
      return
    }

    const validation = clientEventSchema.safeParse(parsedJson)
    if (!validation.success) {
      connectionManager.sendError(
        socket,
        'VALIDATION_FAILED',
        validation.error.issues[0]?.message || 'Invalid event shape',
      )
      return
    }

    const event = validation.data

    try {
      switch (event.type) {
        case 'ping': {
          connectionManager.sendToSocket(socket, { type: 'pong' })
          break
        }

        case 'queue.join': {
          const result = await matchmakingService.joinQueue(userId, async (match) => {
            // Callback when delayed match (e.g. AI fallback) is triggered
            const gameData = await gameService.getGameById(match.gameId)
            if (!gameData || !gameData.initialEndsAt) return

            connectionManager.registerGame(match.gameId, [userId])
            connectionManager.sendToUser(userId, {
              type: 'game.matched',
              payload: { gameId: match.gameId },
            })

            const isFirst = gameData.firstSenderPlayerId === userId
            connectionManager.sendToUser(userId, {
              type: 'game.started',
              payload: {
                gameId: match.gameId,
                endsAt: gameData.initialEndsAt.toISOString(),
                isFirstSender: isFirst,
              },
            })

            // If AI is first sender, trigger initial AI greeting message
            if (gameData.opponentType === 'AI' && gameData.firstSenderPlayerId === 'AI') {
              const activeSession = gameData.sessions.find((s) => s.type === 'INITIAL')
              if (activeSession) {
                chatService.triggerAIResponse(
                  gameData.id,
                  activeSession.id,
                  activeSession.endsAt || new Date(Date.now() + 120000),
                  (delta) => {
                    connectionManager.sendToUser(userId, {
                      type: 'chat.ai_delta',
                      payload: { delta },
                    })
                  },
                  (done) => {
                    connectionManager.sendToUser(userId, {
                      type: 'chat.ai_done',
                      payload: {
                        id: done.id,
                        sequenceNumber: done.sequenceNumber,
                        content: done.content,
                      },
                    })
                  },
                )
              }
            }
          })

          if (result.matched) {
            const gameData = await gameService.getGameById(result.gameId)
            if (!gameData || !gameData.initialEndsAt) return

            connectionManager.registerGame(
              result.gameId,
              gameData.players.map((p) => p.userId),
            )

            for (const p of gameData.players) {
              connectionManager.sendToUser(p.userId, {
                type: 'game.matched',
                payload: { gameId: result.gameId },
              })
              const isFirst = gameData.firstSenderPlayerId === p.userId
              connectionManager.sendToUser(p.userId, {
                type: 'game.started',
                payload: {
                  gameId: result.gameId,
                  endsAt: gameData.initialEndsAt.toISOString(),
                  isFirstSender: isFirst,
                },
              })
            }
          } else {
            connectionManager.sendToSocket(socket, { type: 'queue.waiting' })
          }
          break
        }

        case 'queue.cancel': {
          await matchmakingService.leaveQueue(userId)
          break
        }

        case 'chat.send': {
          const { gameId, content } = event.payload
          const msg = await chatService.handleUserMessage(
            { gameId, userId, content },
            (delta) => {
              connectionManager.sendToUser(userId, {
                type: 'chat.ai_delta',
                payload: { delta },
              })
            },
            (done) => {
              connectionManager.sendToUser(userId, {
                type: 'chat.ai_done',
                payload: {
                  id: done.id,
                  sequenceNumber: done.sequenceNumber,
                  content: done.content,
                },
              })
            },
          )

          // Broadcast to sender
          connectionManager.sendToUser(userId, {
            type: 'chat.message',
            payload: {
              id: msg.id,
              isSelf: true,
              sequenceNumber: msg.sequenceNumber,
              content: msg.content,
              createdAt: msg.createdAt.toISOString(),
            },
          })

          // Broadcast to other participants in game
          const gameData = await gameService.getGameById(gameId)
          if (gameData && gameData.opponentType === 'HUMAN') {
            for (const p of gameData.players) {
              if (p.userId !== userId) {
                connectionManager.sendToUser(p.userId, {
                  type: 'chat.message',
                  payload: {
                    id: msg.id,
                    isSelf: false,
                    sequenceNumber: msg.sequenceNumber,
                    content: msg.content,
                    createdAt: msg.createdAt.toISOString(),
                  },
                })
              }
            }
          }
          break
        }

        case 'guess.submit': {
          const { gameId, guess } = event.payload
          const result = await guessService.submitGuess({ gameId, userId, guess })

          connectionManager.sendToSocket(socket, {
            type: 'guess.result',
            payload: {
              guess: result.guess,
              isCorrect: result.isCorrect,
              reward: result.reward,
              actualOpponentType: result.actualOpponentType,
              balanceAfter: result.balanceAfter,
            },
          })

          connectionManager.sendToSocket(socket, {
            type: 'token.balance',
            payload: { balance: result.balanceAfter },
          })

          if (result.allGuessed) {
            await connectionManager.broadcastToGame(gameId, {
              type: 'game.resolved',
              payload: {
                gameId,
                canExtend: result.actualOpponentType === 'HUMAN',
              },
            })
          }
          break
        }

        case 'extension.request': {
          const { gameId } = event.payload
          const req = await extensionService.requestExtension(gameId, userId)

          connectionManager.sendToUser(req.targetUserId, {
            type: 'extension.requested',
            payload: {
              requestId: req.requestId,
              cost: req.cost,
              expiresAt: req.expiresAt.toISOString(),
            },
          })
          break
        }

        case 'extension.respond': {
          const { requestId, accept } = event.payload
          const res = await extensionService.respondExtension(requestId, userId, accept)

          if (res.accepted) {
            for (const pId of res.players || []) {
              connectionManager.sendToUser(pId, {
                type: 'extension.started',
                payload: {
                  gameId: res.gameId,
                  endsAt: res.endsAt ? res.endsAt.toISOString() : '',
                },
              })
            }
          } else {
            await connectionManager.broadcastToGame(res.gameId, {
              type: 'extension.declined',
              payload: { requestId },
            })
          }
          break
        }

        case 'game.leave': {
          // Graceful leave
          break
        }
      }
    } catch (err) {
      connectionManager.sendError(
        socket,
        'ACTION_ERROR',
        (err as Error).message || 'An error occurred processing action',
      )
    }
  }

  socket.on('message', processIncomingMessage)

  // Flush any initial messages received during connection authentication
  for (const earlyMsg of initialMessages) {
    processIncomingMessage(earlyMsg)
  }

  socket.on('close', () => {
    connectionManager.removeConnection(userId, socket)
    matchmakingService.leaveQueue(userId).catch(() => {})
  })

  socket.on('error', (err: Error) => {
    console.error(`[WS Error for ${userId}]:`, err.message)
  })
}
