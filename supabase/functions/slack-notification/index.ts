import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SLACK_BOT_TOKEN = Deno.env.get('SLACK_BOT_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS (Browser pre-flight requests)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, message, type } = await req.json()

    if (!userId || !message) {
      throw new Error('Missing userId or message')
    }

    console.log(`Sending Slack DM to ${userId} [Type: ${type}]`)

    // Call Slack API from the secure backend
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: userId,
        text: message.text,
        blocks: message.blocks,
        attachments: message.attachments,
        username: 'Dev Portal Bot',
        icon_emoji: ':bug:'
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('Slack API Error:', data.error)
      return new Response(JSON.stringify({ error: data.error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})