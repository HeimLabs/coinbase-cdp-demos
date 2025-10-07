import { NextResponse } from 'next/server'

// In-memory store for demo (use database in production)
const subscriptionsStore: Array<{ 
  id: string
  signature: string
  spendPermissionData: any
  metadata: any
  createdAt: string
}> = []

/**
 * Save spend permission signatures for subscriptions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || !body.signature || !body.spendPermissionData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      signature: body.signature,
      spendPermissionData: body.spendPermissionData,
      metadata: body.metadata || {},
      createdAt: new Date().toISOString()
    }

    subscriptionsStore.push(subscription)

    console.log('Saved subscription:', subscription.id)
    
    return NextResponse.json({ 
      ok: true, 
      subscriptionId: subscription.id,
      message: 'Subscription saved successfully'
    })
  } catch (e) {
    console.error('Subscription save error:', e)
    return NextResponse.json({ error: 'Invalid JSON or processing error' }, { status: 400 })
  }
}

/**
 * Get all subscriptions (for demo purposes)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get('address')

  let filteredSubscriptions = subscriptionsStore

  if (userAddress) {
    filteredSubscriptions = subscriptionsStore.filter(sub => 
      sub.spendPermissionData.account?.toLowerCase() === userAddress.toLowerCase()
    )
  }

  return NextResponse.json({ 
    subscriptions: filteredSubscriptions,
    total: filteredSubscriptions.length
  })
}

/**
 * Execute a subscription (for backend use)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { subscriptionId, amount } = body

    if (!subscriptionId || !amount) {
      return NextResponse.json({ error: 'Missing subscriptionId or amount' }, { status: 400 })
    }

    const subscription = subscriptionsStore.find(sub => sub.id === subscriptionId)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // In production, this would:
    // 1. Validate the spend permission
    // 2. Execute the transaction on-chain
    // 3. Update subscription usage
    // 4. Return transaction hash

    console.log('Executed subscription:', subscriptionId, 'for amount:', amount)

    return NextResponse.json({
      ok: true,
      transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      amount,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    console.error('Subscription execution error:', e)
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 })
  }
}
