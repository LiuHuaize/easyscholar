import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query } = body

    const response = await fetch('http://localhost:8000/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch papers')
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    )
  }
} 