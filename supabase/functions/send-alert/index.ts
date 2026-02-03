import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, opportunityId, alertType, message } = await req.json()

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user profile for notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_alerts, discord_webhook_url, email')
      .eq('user_id', userId)
      .single()

    const sentVia: string[] = []

    // Send Discord notification if webhook is configured
    if (profile?.discord_webhook_url) {
      try {
        await sendDiscordNotification(profile.discord_webhook_url, message, alertType)
        sentVia.push('discord')
      } catch (err) {
        console.error('Discord notification failed:', err)
      }
    }

    // Send email notification if enabled
    // TODO: Implement email sending with your preferred provider
    // Options: Resend, SendGrid, Postmark, etc.
    if (profile?.email_alerts && profile?.email) {
      // await sendEmailNotification(profile.email, message, alertType)
      // sentVia.push('email')
      console.log('Email notifications not yet configured')
    }

    // Store alert in database
    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        alert_type: alertType || 'opportunity',
        message,
        sent_via: sentVia,
      })
      .select()
      .single()

    if (alertError) {
      throw alertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert,
        sentVia,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error in send-alert:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendDiscordNotification(webhookUrl: string, message: string, alertType: string) {
  const color = alertType === 'opportunity' ? 0x00ff00 : 
                alertType === 'trade_executed' ? 0x0099ff :
                alertType === 'trade_failed' ? 0xff0000 : 0xffaa00

  const embed = {
    title: `🔔 ArbSense Pro Alert`,
    description: message,
    color,
    timestamp: new Date().toISOString(),
    footer: {
      text: 'ArbSense Pro - Arbitrage Bot',
    },
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [embed],
    }),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`)
  }
}
