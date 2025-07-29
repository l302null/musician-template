const musicContainer = document.getElementById('music-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');
let touchStartX = 0;
let touchEndX = 0;

// Add mp3 files to /mus. 
// Add their titles with mirrored title capitalization and spacing.
const songs = [
  'Like That',
  'Beat Goes',
  'XLR8',
];

const artists = [
  'Nuphory',
  'Krischvn',
  'Ypliet Denour',
];

const albumArt = [
  'like_that.jpg',
  'beat_goes.jpg',
  'sync_purge.jpg',
];

// Load state from localStorage or initialize
let trackIndex = parseInt(localStorage.getItem('trackIndex')) || 0;
let isPlaying = localStorage.getItem('isPlaying') === 'true';
let currentTime = parseFloat(localStorage.getItem('currentTime')) || 0;

function loadTrack(trackIndex, resetPosition = false) {
  // Show loading state
  playBtn.querySelector('img').src = '/img/icon/loading.svg';
  playBtn.querySelector('img').alt = 'loading';

  title.innerText = songs[trackIndex];
  artist.innerText = artists[trackIndex];
  audio.src = `/mus/${songs[trackIndex]}.mp3`;
  cover.src = `/img/art/${albumArt[trackIndex]}`;

  const img = new Image();
  img.onload = function() {
    cover.src = `/img/art/${albumArt[trackIndex]}`;
  };
  img.onerror = function() {
    cover.src = '/img/icon/default-album.jpg';
    console.warn(`Album art not found: ${albumArt[trackIndex]}`);
  };
  img.src = `/img/art/${albumArt[trackIndex]}`;

  // Save current track to localStorage
  localStorage.setItem('lastTrack', songs[trackIndex]);
  localStorage.setItem('trackIndex', trackIndex);

  // Set up event listeners for audio readiness
  const onCanPlay = () => {
    audio.removeEventListener('canplay', onCanPlay);
    
    // Reset position if skipping or different track, otherwise restore position
    if (resetPosition || localStorage.getItem('lastTrack') !== songs[trackIndex]) {
      audio.currentTime = 0;
      localStorage.setItem('currentTime', 0);
    } else {
      audio.currentTime = currentTime;
    }
    
    if (isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            musicContainer.classList.add('play');
            playBtn.querySelector('img').src = '/img/icon/pause.svg';
            playBtn.querySelector('img').alt = 'pause';
          })
          .catch(error => {
            console.error('Auto-play failed:', error);
            pauseTrack();
          });
      }
    } else {
      musicContainer.classList.remove('play');
      playBtn.querySelector('img').src = '/img/icon/play.svg';
      playBtn.querySelector('img').alt = 'play';
    }
  };

  audio.addEventListener('canplay', onCanPlay);
}

function playTrack() {
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        musicContainer.classList.add('play');
        playBtn.querySelector('img').src = '/img/icon/pause.svg';
        playBtn.querySelector('img').alt = 'pause';
        isPlaying = true;
        localStorage.setItem('isPlaying', 'true');
      })
      .catch(error => {
        console.error('Playback failed:', error);
        pauseTrack();
      });
  }
}

function pauseTrack() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('img').src = '/img/icon/play.svg';
  playBtn.querySelector('img').alt = 'play';
  audio.pause();
  isPlaying = false;
  localStorage.setItem('isPlaying', 'false');
}

function togglePlayback() {
  if (musicContainer.classList.contains('play')) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function prevTrack() {
  trackIndex = (trackIndex - 1 + songs.length) % songs.length;
  localStorage.setItem('trackIndex', trackIndex);
  loadTrack(trackIndex, true); // Reset position when skipping
}

function nextTrack() {
  trackIndex = (trackIndex + 1) % songs.length;
  localStorage.setItem('trackIndex', trackIndex);
  loadTrack(trackIndex, true); // Reset position when skipping
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
  
  currTime.textContent = formatTime(currentTime);
  if (duration) {
    durTime.textContent = formatTime(duration);
  }
  
  localStorage.setItem('currentTime', currentTime);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
  localStorage.setItem('currentTime', audio.currentTime);
}

// Event listeners
playBtn.addEventListener('click', togglePlayback);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
progressContainer.addEventListener('click', setProgress);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', nextTrack);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    togglePlayback();
  }
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem('trackIndex', trackIndex);
  localStorage.setItem('isPlaying', isPlaying);
  localStorage.setItem('currentTime', audio.currentTime);
});

musicContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

musicContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);

function handleSwipe() {
  const swipeThreshold = 50;
  const swipeDiff = touchStartX - touchEndX;

  if (swipeDiff > swipeThreshold) {
    nextTrack();
  } else if (swipeDiff < -swipeThreshold) {
    prevTrack();
  }
}

// Load initial track (don't reset position)
loadTrack(trackIndex);

// Handle browser autoplay restrictions
document.addEventListener('click', function initialPlay() {
  if (isPlaying && audio.paused) {
    audio.play()
      .then(() => {
        musicContainer.classList.add('play');
        playBtn.querySelector('img').src = '/img/icon/pause.svg';
        playBtn.querySelector('img').alt = 'pause';
      })
      .catch(error => {
        console.error('Resume playback failed:', error);
        pauseTrack();
      });
  }
  // Remove after first interaction
  document.removeEventListener('click', initialPlay);
}, { once: true });
