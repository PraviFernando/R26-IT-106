const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

async function findVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY not found in .env');
    return;
  }
  const query = "how to soothe a crying baby colic sinhala";
  const url = 'https://www.googleapis.com/youtube/v3/search';
  try {
    const response = await axios.get(url, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: apiKey
      }
    });
    const items = response.data?.items || [];
    console.log(`Found ${items.length} videos:`);
    items.forEach(item => {
      console.log({
        id: item.id?.videoId,
        title: item.snippet?.title,
        description: item.snippet?.description,
        channel: item.snippet?.channelTitle
      });
    });
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

findVideos();
