// Netlify serverless function to fetch FPL Draft data
// This runs on the server, so no CORS issues!

exports.handler = async (event, context) => {
  // Enable CORS for your frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { endpoint } = event.queryStringParameters || {};
    
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint parameter' }),
      };
    }

    // Fetch from the FPL Draft API
    const apiUrl = `https://draft.premierleague.com${endpoint}`;
    console.log('Fetching:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `FPL API returned ${response.status}`,
          endpoint: apiUrl 
        }),
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: 'Server error while fetching FPL data'
      }),
    };
  }
};
