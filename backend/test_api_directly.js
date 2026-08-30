const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const token = jwt.sign({ id: 'dummy_user_id', role: 'user' }, process.env.JWT_SECRET || 'fallback_secret');
console.log("Generated token:", token);

axios.get('http://localhost:8073/api/recommendations/videos', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  params: {
    reason: 'baby_crying',
    emotion: 'stressed',
    babyIntent: 'true'
  }
}).then(res => {
  console.log("Response status:", res.status);
  console.log("Response data:", JSON.stringify(res.data, null, 2));
}).catch(err => {
  console.error("Error:", err.response ? err.response.data : err.message);
});
