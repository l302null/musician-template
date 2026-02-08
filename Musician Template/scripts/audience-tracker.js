// Replace with actual API calls (these are mock functions)
async function fetchInstagramFollowers() {
  // Mock: Replace with Instagram API call
  return 15000; 
}

async function fetchYouTubeSubscribers() {
  // Mock: Replace with YouTube API call
  return 5000; 
}

async function fetchTwitterFollowers() {
  // Mock: Replace with Twitter API call
  return 3000; 
}

async function updateCounters() {
  const instagramCount = await fetchInstagramFollowers();
  const youtubeCount = await fetchYouTubeSubscribers();
  const twitterCount = await fetchTwitterFollowers();
  const total = instagramCount + youtubeCount + twitterCount;

  document.getElementById("instagram").textContent = instagramCount.toLocaleString();
  document.getElementById("youtube").textContent = youtubeCount.toLocaleString();
  document.getElementById("twitter").textContent = twitterCount.toLocaleString();
  document.getElementById("total").textContent = total.toLocaleString();
}

// Update every 5 minutes
updateCounters();
setInterval(updateCounters, 300000);