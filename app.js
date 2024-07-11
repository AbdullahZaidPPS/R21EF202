const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const NUMBERS_URL = "http://20.244.56.144/test/";  
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNjgwODAwLCJpYXQiOjE3MjA2ODA1MDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjhjNjIzYzEyLTgzYTQtNDJmNi1iNGMwLWY0YWZkODIxMzQ5NiIsInN1YiI6ImFiZHVsbGF6YWlkNjgwNkBnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJSRVZBVW5pdmVyc2l0eSIsImNsaWVudElEIjoiOGM2MjNjMTItODNhNC00MmY2LWI0YzAtZjRhZmQ4MjEzNDk2IiwiY2xpZW50U2VjcmV0IjoicEdlV3dxT0VtUUZ3V0pqYSIsIm93bmVyTmFtZSI6IkFiZHVsbGFoTW9oYW1tZWRaYWlkIiwib3duZXJFbWFpbCI6ImFiZHVsbGF6YWlkNjgwNkBnbWFpbC5jb20iLCJyb2xsTm8iOiJSMjFFRjIwMiJ9.MjEgYOMNZmNSYP7Z9J7jRh0Chov5-Pb5HNJBW0vqJAY";  

const numberWindows = {
  'p': [],
  'f': [],
  'e': [],
  'r': []
};

const endpoints = {
  'p': 'primes',
  'f': 'fibo',
  'e': 'even',   
  'r': 'random' 
};

async function fetchNumbers(endpoint) {
  try {
    const response = await axios.get(NUMBERS_URL + endpoint, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      timeout: 500
    });
    console.log(`Fetched numbers from ${endpoint}:`, response.data.numbers);
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching numbers from ${endpoint}:`, error.message);
    return [];
  }
}

function updateWindow(numberId, newNumbers) {
  const window = numberWindows[numberId];
  const prevState = [...window];
  
  newNumbers.forEach(num => {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift();
      }
      window.push(num);
    }
  });

  const avg = window.length ? window.reduce((a, b) => a + b, 0) / window.length : 0;
  return { prevState, currState: window, avg };
}

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;

  if (!numberWindows.hasOwnProperty(numberId) || !endpoints[numberId]) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const newNumbers = await fetchNumbers(endpoints[numberId]);
  const { prevState, currState, avg } = updateWindow(numberId, newNumbers);

  console.log({
    numbers: newNumbers,
    windowPrevState: prevState,
    windowCurrState: currState,
    avg: avg
  });

  res.json({
    numbers: newNumbers,
    windowPrevState: prevState,
    windowCurrState: currState,
    avg: avg
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
