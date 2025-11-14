import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  console.log('=== FONCTION EMAIL SIMPLIFIEE ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, phone, email, message, cvFileName } = await req.json();
    console.log('Données reçues:', { name, phone, email, cvFileName });

    // Validation
    if (!name || !phone || !email) {
      return new Response(
        JSON.stringify({ error: 'Champs requis manquants' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Clé API Resend disponible:', !!resendApiKey);
    
    if (!resendApiKey) {
      console.log('ERREUR: Pas de clé API Resend');
      return new Response(
        JSON.stringify({ error: 'Clé API manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email simple et direct
    const emailData = {
      from: 'onboarding@resend.dev',
      to: ['prosperatogo@gmail.com'],
      subject: `Candidature: ${name}`,
      html: `
        <h2>Nouvelle candidature</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Téléphone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${cvFileName ? `<p><strong>CV:</strong> ${cvFileName}</p>` : ''}
        ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
      `
    };

    console.log('Envoi vers Resend API...');
    console.log('Données email:', emailData);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const responseText = await response.text();
    console.log('Statut Resend:', response.status);
    console.log('Réponse Resend:', responseText);

    if (!response.ok) {
      // Essayer de parser l'erreur Resend
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.message || errorJson.error || responseText;
      } catch (e) {
        // Garder le texte brut si pas JSON
      }
      
      console.error('Erreur Resend:', response.status, errorDetails);
      
      return new Response(
        JSON.stringify({ 
          error: 'Erreur envoi email',
          details: `Resend API: ${response.status} - ${errorDetails}`,
          resendStatus: response.status,
          resendResponse: responseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(responseText);
    console.log('Succès Resend:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès!',
        messageId: result.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur générale:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erreur système',
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});