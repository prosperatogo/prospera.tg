import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

// Helper function to determine from email
function getFromEmail() {
  const domain = Deno.env.get('RESEND_DOMAIN');
  if (domain) {
    return `send@${domain}`;
  }
  return 'onboarding@resend.dev'; // Default fallback
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, phone, email, message, cvFileName } = await req.json();

    // Validate required fields
    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ error: 'Nom, téléphone et email sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('RESEND_ADMIN_EMAIL') || 'prosperatogo@gmail.com';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration email manquante' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare email content
    const emailSubject = `Nouvelle candidature - ${name}`;
    const emailBody = `
      <h2>Nouvelle candidature reçue</h2>
      
      <h3>Informations du candidat :</h3>
      <ul>
        <li><strong>Nom complet :</strong> ${name}</li>
        <li><strong>Téléphone :</strong> ${phone}</li>
        <li><strong>Email :</strong> ${email}</li>
        ${cvFileName ? `<li><strong>CV :</strong> ${cvFileName}</li>` : ''}
      </ul>
      
      ${message ? `
      <h3>Message du candidat :</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
      ` : ''}
      
      <hr>
      <p><em>Candidature envoyée depuis le site web PROSPERA Togo</em></p>
    `;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [adminEmail],
        subject: emailSubject,
        html: emailBody,
        text: emailBody.replace(/<[^>]*>/g, '') // Strip HTML for text version
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', response.status, errorText);
      throw new Error(`Erreur d'envoi email: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Candidature envoyée avec succès !',
        messageId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send_application_email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'envoi de la candidature',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});