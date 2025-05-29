const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const trackClickContainer = document.getElementById('track-click');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');
let touchStartX = 0;
let touchEndX = 0;

const songs = [
  'The Ghosts',
];

let trackIndex = 0;
let playTimer;
const THIRTY_SECONDS = 30 * 1000;

// Set play/pause UI state
function setPlayState(isPlaying) {
  musicContainer.classList.toggle('play', isPlaying);
  const playIcon = playBtn.querySelector('img');
  playIcon.src = isPlaying ? '../img/icon/pause.svg' : '../img/icon/play.svg';
  playIcon.alt = isPlaying ? 'pause' : 'play';
}

// Load track into player
function loadTrack(trackIndex) {
  title.innerText = songs[trackIndex];
  audio.src = `../mus/${songs[trackIndex]}.mp3`;
  cover.src = `..img/art/theghosts.jpg`;
}

// Play track
function playTrack() {
  musicContainer.classList.add('play');
  playBtn.querySelector('img').src = '../img/icon/pause.svg';
  playBtn.querySelector('img').alt = 'pause';
  audio.play();
}

// Pause track
function pauseTrack() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('img').src = '../img/icon/play.svg';
  playBtn.querySelector('img').alt = 'play';
  audio.pause();
}

// Toggle play/pause
function togglePlayback() {
  const isPlaying = musicContainer.classList.contains('play');
  isPlaying ? pauseTrack() : playTrack();
}

// Previous track
function prevTrack() {
  trackIndex = (trackIndex - 1 + songs.length) % songs.length;
  loadTrack(trackIndex);
  playTrack();
}

// Next track
function nextTrack() {
  trackIndex = (trackIndex + 1) % songs.length;
  loadTrack(trackIndex);
  playTrack();
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
  
  // Update time displays
  currTime.textContent = formatTime(currentTime);
  if (duration) {
    durTime.textContent = formatTime(duration);
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Click to seek
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Event listeners
playBtn.addEventListener('click', togglePlayback);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
progressContainer.addEventListener('click', setProgress);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);

// Spacebar play/pause
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    togglePlayback();
  }
});

// Load initial track
loadTrack(trackIndex);

musicPlayer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

musicPlayer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);

function handleSwipe() {
  const swipeThreshold = 50; // Minimum swipe distance (px)
  const swipeDiff = touchStartX - touchEndX;

  // Swipe left (next song)
  if (swipeDiff > swipeThreshold) {
    changeTrack(1); // Existing next-track function
  } 
  // Swipe right (previous song)
  else if (swipeDiff < -swipeThreshold) {
    changeTrack(-1); // Existing prev-track function
  }
}
