import { NextRequest, NextResponse } from 'next/server'

// Demo behavior:
// - This route mirrors the agent project: accepts an address and issues a simple session cookie.
// - It intentionally does NOT verify a signed message (no viem.verifyMessage) to keep the demo minimal.
//   To enforce SIWE-style verification in production:
//     1) Request { address, message, signature } from the client.
//     2) Extract & validate a one-time nonce persisted in a shared store (e.g. Redis/DB).
//     3) Verify with viem's public client verifyMessage before issuing a session.
const nonces = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 })
    }

    // Create session token (simplified - in production use proper JWT with SESSION_SECRET)
    // For demo purposes, using simple encoding - in production, use proper JWT:
    // const jwt = require('jsonwebtoken')
    // const sessionToken = jwt.sign({ address, timestamp: Date.now() }, process.env.SESSION_SECRET)
    const sessionToken = Buffer.from(`${address}:${Date.now()}`).toString('base64')
    const response = NextResponse.json({ ok: true, address, sessionToken })
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  const nonce = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
  nonces.add(nonce)
  return NextResponse.json({ nonce })
}


