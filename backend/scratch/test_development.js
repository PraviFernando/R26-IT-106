const dotenv = require('dotenv');
dotenv.config();

const { fetchAndRankVideos } = require('../services/youtubeService');

async function testDevelopment() {
  console.log('--- Testing Baby Development / Understanding Baby ---');
  try {
    const results = await fetchAndRankVideos('understanding_baby', 'happy', 'low', true);
    console.log('Result Count:', results.length);
    console.log('Videos:', results.map(r => ({ title: r.title, id: r.id, source: r.source })));
    
    const containsNew1 = results.some(r => r.id === '6rx_-__NsjU');
    const containsNew2 = results.some(r => r.id === 'dEQOWf-NuKs');
    const containsBlack1 = results.some(r => r.id === 'LjdtfeVxRm0');
    const containsBlack2 = results.some(r => r.id === 'pbKy4RPq6gI');
    
    console.log('New Cognitive Development Video present:', containsNew1 ? '✅' : '❌');
    console.log('New Myths Debunked Video present:', containsNew2 ? '✅' : '❌');
    console.log('Blacklisted Body Language Tricks video absent:', !containsBlack1 ? '✅' : '❌');
    console.log('Removed Signs Babies Use video absent:', !containsBlack2 ? '✅' : '❌');
    console.log('Passed Cap Check (<= 5):', results.length <= 5 ? '✅' : '❌');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testDevelopment();
