// This function acts as a secure proxy to the Google Gemini API.
// It reads the API key from an environment variable set in the Netlify UI.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY is not set in Netlify environment variables.' }) };
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const { prompt, task } = JSON.parse(event.body || '{}');

    if (!prompt || !task) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing "prompt" or "task" in request body.' }) };
    }
    
    let systemInstruction = "";
    let userPrompt = "";

    // Define the expected JSON structure for each task type.
    const jsonSchema = {
        'generate': {
            type: "OBJECT",
            properties: {
                subjectVariations: { 
                    type: "ARRAY",
                    items: { type: "STRING" }
                },
                body: { type: "STRING" }
            },
            required: ["subjectVariations", "body"]
        },
        'refine': {
            type: "OBJECT",
            properties: {
                body: { type: "STRING" }
            },
            required: ["body"]
        },
        'smart-reply': {
            type: "OBJECT",
            properties: {
                body: { type: "STRING" }
            },
            required: ["body"]
        }
    };

    switch (task) {
        case 'generate':
            systemInstruction = `You are an AI assistant for a professional email composition app. Your task is to generate a professional email based on a user's prompt. Your response MUST be a single, valid JSON object that adheres to the provided schema. The 'subjectVariations' key must contain an array of 3 to 5 concise and professional subject line variations. The 'body' key must contain the full body of the email, written in a professional and clear tone, using HTML paragraphs (<p>...</p>) for line breaks. Do not include any other text or explanation outside of the JSON object.`;
            userPrompt = `PROMPT: "${prompt}"`;
            break;

        case 'refine':
            systemInstruction = `You are an AI assistant that refines email content. Rewrite the provided email body based on the user's instruction. Keep the core message intact. Your response MUST be a single, valid JSON object that adheres to the provided schema. Do not include any other text, explanation, or markdown formatting outside of the JSON object.`;
            userPrompt = `INSTRUCTION: "${prompt.instruction}"\n\nORIGINAL BODY: "${prompt.body}"`;
            break;
            
        case 'smart-reply':
            systemInstruction = `You are an AI assistant that generates smart replies to emails. Read the original email and generate a professional and helpful reply. Your response MUST be a single, valid JSON object that adheres to the provided schema. The 'body' key must contain the full body of the reply email, written in a professional and clear tone, using HTML paragraphs (<p>...</p>) for line breaks. Do not include any other text or explanation outside of the JSON object.`;
            userPrompt = `ORIGINAL EMAIL SUBJECT: "${prompt.subject}"\n\nORIGINAL EMAIL BODY: "${prompt.body}"`;
            break;
        
        default:
             return { statusCode: 400, body: JSON.stringify({ error: 'Invalid task specified.' }) };
    }

    const requestBody = {
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema[task]
      }
    };
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API Error:", errorBody);
        return { statusCode: response.status, body: JSON.stringify({ error: `Gemini API error: ${errorBody.error?.message || 'Unknown error'}` }) };
    }

    const responseData = await response.json();
    
    // Extract the JSON string from Gemini's response.
    const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: generatedText, // The model is instructed to return a valid JSON string.
    };

  } catch (error) {
    console.error('Error in proxy function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};