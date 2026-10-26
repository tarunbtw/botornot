/**
 * Lua script for atomic matchmaking queue claiming.
 * Pops a waiting user from the queue who is NOT the current user and returns their userId.
 * If queue is empty or only contains current user, adds current user to the queue and returns nil.
 * KEYS[1] = queue key (e.g. 'matchmaking:queue')
 * ARGV[1] = current user ID
 * ARGV[2] = current timestamp
 */
export const ATOMIC_MATCH_LUA = `
local queueKey = KEYS[1]
local currentUserId = ARGV[1]
local now = ARGV[2]

-- Clean expired users older than 30 seconds
redis.call('ZREMRANGEBYSCORE', queueKey, '-inf', now - 30000)

-- Check if current user is already in queue
local rank = redis.call('ZRANK', queueKey, currentUserId)

-- Get the oldest waiting user
local candidates = redis.call('ZRANGE', queueKey, 0, 10)
for i, userId in ipairs(candidates) do
    if userId ~= currentUserId then
        -- Atomically remove this matched user from the queue
        redis.call('ZREM', queueKey, userId)
        -- Also remove current user if they were in the queue
        redis.call('ZREM', queueKey, currentUserId)
        return userId
    end
end

-- No compatible waiting user found; add current user to queue with current score
redis.call('ZADD', queueKey, now, currentUserId)
return nil
`

/**
 * Lua script to remove a user from the queue on cancel/disconnect.
 */
export const REMOVE_FROM_QUEUE_LUA = `
local queueKey = KEYS[1]
local userId = ARGV[1]
return redis.call('ZREM', queueKey, userId)
`
