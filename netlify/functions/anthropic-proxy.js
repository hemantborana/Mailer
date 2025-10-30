// This is your new serverless function that will securely call the Anthropic API.
// It reads the API key from an environment variable you will set in the Netlify UI.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in Netlify environment variables.' }) };
  }

  try {
    const { prompt, task } = JSON.parse(event.body || '{}');

    if (!prompt || !task) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing "prompt" or "task" in request body.' }) };
    }
    
    let systemPrompt = "";
    let userPrompt = "";

    switch (task) {
        case 'generate':
            systemPrompt = `You are an AI assistant for a professional email composition app. Your task is to generate a professional email based on a user's prompt.
Your response MUST be a single, valid JSON object with the following structure:
{
  "subjectVariations": ["<subject 1>", "<subject 2>", "<subject 3>"],
  "body": "<HTML content for the email body>"
}
The 'subjectVariations' key must contain an array of 3 to 5 concise and professional subject line variations.
The 'body' key must contain the full body of the email, written in a professional and clear tone, using HTML paragraphs (<p>...</p>) for line breaks. Do not include any other text or explanation outside of the JSON object.`;
            userPrompt = `PROMPT: "${prompt}"`;
            break;

        case 'refine':
            systemPrompt = `You are an AI assistant that refines email content. Rewrite the provided email body based on the user's instruction. Keep the core message intact.
Your response MUST be a single, valid JSON object with the following structure:
{
  "body": "<HTML content for the rewritten email body>"
}
Do not include any other text, explanation, or markdown formatting outside of the JSON object.`;
            userPrompt = `INSTRUCTION: "${prompt.instruction}"\n\nORIGINAL BODY: "${prompt.body}"`;
            break;
            
        case 'smart-reply':
            systemPrompt = `You are an AI assistant that generates smart replies to emails. Read the original email and generate a professional and helpful reply.
Your response MUST be a single, valid JSON object with the following structure:
{
  "body": "<HTML content for the reply email body>"
}
The 'body' key must contain the full body of the reply email, written in a professional and clear tone, using HTML paragraphs (<p>...</p>) for line breaks. Do not include any other text or explanation outside of the JSON object.`;
            userPrompt = `ORIGINAL EMAIL SUBJECT: "${prompt.subject}"\n\nORIGINAL EMAIL BODY: "${prompt.body}"`;
            break;
        
        default:
             return { statusCode: 400, body: JSON.stringify({ error: 'Invalid task specified.' }) };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // Using the fast and capable Haiku model
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Anthropic API Error:", errorBody);
        return { statusCode: response.status, body: JSON.stringify({ error: `Anthropic API error: ${errorBody}` }) };
    }

    const responseData = await response.json();
    // The text from Claude should be a JSON string as requested in the system prompt.
    // We pass this JSON string directly as the body of our function's response.
    const generatedText = responseData.content[0]?.text || '{}';
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: generatedText,
    };

  } catch (error) {
    console.error('Error in proxy function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
