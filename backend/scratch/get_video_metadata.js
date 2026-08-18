const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

async function getMetadata() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY not found');
    return;
  }
  const url = 'https://www.googleapis.com/youtube/v3/videos';
  try {
    const response = await axios.get(url, {
      params: {
        part: 'snippet',
        id: '6rx_-__NsjU,dEQOWf-NuKs',
        key: apiKey
      }
    });
    const items = response.data?.items || [];
    items.forEach(item => {
      console.log({
        id: item.id,
        title: item.snippet?.title,
        description: item.snippet?.description,
        channel: item.snippet?.channelTitle
      });
    });
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

getMetadata();
