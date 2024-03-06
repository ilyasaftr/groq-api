import { Hono } from 'hono'
import { updateData, readData} from './utils/groq-token'

const app = new Hono()

// Background task run await updateData(); every 14 minutes
updateData();
setInterval(async () => {
  await updateData();
}, 14 * 60 * 1000);

app.get('/', async (c) => {
  return c.text('Hello Hono!')
})

app.post('/chat', async (c) => {
  const body = await c.req.json()

  if (body['messages'] === undefined) {
    return c.json({
      status: false,
      message: 'No chat found'
    })
  }

  const messages = body['messages'];

  const payload = {
    "model": "mixtral-8x7b-32768",
    "messages": messages,
    "temperature": 0.2,
    "max_tokens": 2048,
    "top_p": 0.8,
    "seed": 10,
    "stream": false
  };

  const responseToken = await readData();

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    'Authorization': 'Bearer ' + responseToken.token,
    'Groq-App': 'chat',
    'Groq-Organization': responseToken.organization,
    'Content-Type': 'application/json'
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers,
  });

  if (!response.ok) {
    c.json({
      status: false,
      message: response.statusText
    });
  }

  const responseBody = await response.json();
  return c.json(responseBody);
})

export default app