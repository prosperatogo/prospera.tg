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
  console.log('=== DEBUT FONCTION EMAIL ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    const { name, phone, email, message, cvFileName } = JSON.parse(requestBody);
    console.log('Parsed data:', { name, phone, email, message, cvFileName });

    // Validate required fields
    if (!name || !phone || !email) {
      console.log('Validation failed: missing required fields');
      return new Response(
        JSON.stringify({ error: 'Nom, téléphone et email sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Getting environment variables...');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('RESEND_ADMIN_EMAIL') || 'prosperatogo@gmail.com';
    
    console.log('Admin email:', adminEmail);
    console.log('Resend API key exists:', !!resendApiKey);

    if (!resendApiKey) {
      console.log('ERROR: No Resend API key found');
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
    const fromEmail = getFromEmail();
    console.log('From email:', fromEmail);
    
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

    const emailPayload = {
      from: fromEmail,
      to: [adminEmail],
      subject: emailSubject,
      html: emailBody,
      text: emailBody.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));

    // Send email via Resend API
    console.log('Sending email via Resend API...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('Resend API response status:', response.status);
    console.log('Resend API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Resend API response body:', responseText);

    if (!response.ok) {
      console.error('Resend API error:', response.status, responseText);
      throw new Error(`Erreur d'envoi email: ${response.status} ${responseText}`);
    }

    const result = JSON.parse(responseText);
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Candidature envoyée avec succès !',
        messageId: result.id,
        debug: {
          fromEmail,
          toEmail: adminEmail,
          subject: emailSubject
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== ERREUR DANS LA FONCTION ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'envoi de la candidature',
        details: error.message,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});