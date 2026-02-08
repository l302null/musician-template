// Distributed by Ypliet Denour for use under BSD 3-Clause License.
// Modifications are encouraged but sales of my code, whole or modified, are illegal.
// Equity among artists start with you. - artist name | page name

const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const buyBtn = document.getElementById('buy');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const musicContainer = document.getElementById('music-container');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const currTime = document.querySelector('#currTime');
const durTime = document.querySelector('#durTime');

// Tracklist Containers
const trackClickPlaylist = document.getElementById('track-click-playlist');

// Global state variables
let touchStartX = 0;
let touchEndX = 0;
let isShuffled = localStorage.getItem('isShuffled') === 'true';
let isRepeated = localStorage.getItem('isRepeated') === 'true';
let shuffledOrder = JSON.parse(localStorage.getItem('shuffledOrder')) || [];
let trackIndex = parseInt(localStorage.getItem('trackIndex')) || 0;
let isPlaying = localStorage.getItem('isPlaying') === 'true';
let currentTime = parseFloat(localStorage.getItem('currentTime')) || 0;

let playTimer;
const THIRTY_SECONDS = 30 * 1000;

// Add mp3 files to /mus.
// Add images to /img/art.
// Add their titles with exact copycat title capitalization and spacing(exclude ".extension").
const songs = [
  'Like That',
  'Rainbow Chaser',
  'Inferno Drive'
];

const artists = [
  'Nuphory',
  'Oounity',
  'Ypliet Denour'
];

const albumArt = [
  'like_that.jpg',
  'rainbow_chaser.jpg',
  'sync_purge.jpg'
];

// Play tracking events
audio.addEventListener('play', () => {
  clearTimeout(playTimer);
  playTimer = setTimeout(trackPlayCount, THIRTY_SECONDS);
  musicContainer.classList.add('play');
  playBtn.querySelector('img').src = '/img/icon/pause.svg';
  playBtn.querySelector('img').alt = 'pause';
  isPlaying = true;
  localStorage.setItem('isPlaying', 'true');
});

audio.addEventListener('pause', () => {
  clearTimeout(playTimer);
  musicContainer.classList.remove('play');
  playBtn.querySelector('img').src = '/img/icon/play.svg';
  playBtn.querySelector('img').alt = 'play';
  isPlaying = false;
  localStorage.setItem('isPlaying', 'false');
});

audio.addEventListener('ended', () => {
  clearTimeout(playTimer);
  if (isRepeated) {
    audio.currentTime = 0;
    audio.play().catch(error => console.log('Repeat play failed:', error));
  } else {
    nextTrack(true);
  }
});

audio.addEventListener('timeupdate', updateProgress);

// Play count functions
function trackPlayCount() {
  const songTitle = songs[trackIndex];
  fetch("/isrc_tracking.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ song: songTitle })
  }).catch(error => {
    console.error("Server tracking error:", error);
    updateLocalPlayCount(songTitle);
  });
}

function updateLocalPlayCount(songTitle) {
  fetch('/data/play_counts.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response error');
      return response.json();
    })
    .then(data => {
      if (!data[songTitle]) {
        data[songTitle] = 0;
      }
      data[songTitle] += 1;
      return fetch('/update_play_counts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    })
    .catch(error => {
      console.error('Error updating play counts:', error);
      const localCounts = JSON.parse(localStorage.getItem('playCounts') || '{}');
      localCounts[songTitle] = (localCounts[songTitle] || 0) + 1;
      localStorage.setItem('playCounts', JSON.stringify(localCounts));
    });
}

// Shuffle and Repeat functions
function shuffleTracks() {
  shuffledOrder = [...Array(songs.length).keys()];
  for (let i = shuffledOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
  }
  localStorage.setItem('shuffledOrder', JSON.stringify(shuffledOrder));
  localStorage.setItem('isShuffled', 'true');
  isShuffled = true;
}

function unshuffleTracks() {
  localStorage.setItem('isShuffled', 'false');
  isShuffled = false;
}

function toggleShuffle() {
  if (isShuffled) {
    unshuffleTracks();
  } else {
    shuffleTracks();
  }
  updateShuffleButton();
}

function updateShuffleButton() {
  const shuffleBtn = document.getElementById('shuffle');
  if (isShuffled) {
    shuffleBtn.classList.add('active');
  } else {
    shuffleBtn.classList.remove('active');
  }
}

function toggleRepeat() {
  isRepeated = !isRepeated;
  localStorage.setItem('isRepeated', isRepeated.toString());
  updateRepeatButton();
  audio.loop = isRepeated;
}

function updateRepeatButton() {
  const repeatBtn = document.getElementById('repeat');
  if (isRepeated) {
    repeatBtn.classList.add('active');
  } else {
    repeatBtn.classList.remove('active');
  }
}

function getNextShuffledIndex() {
  const currentPos = shuffledOrder.indexOf(trackIndex);
  return (currentPos + 1) % shuffledOrder.length;
}

function getPrevShuffledIndex() {
  const currentPos = shuffledOrder.indexOf(trackIndex);
  return (currentPos - 1 + shuffledOrder.length) % shuffledOrder.length;
}

// Navigation functions
function nextTrack(autoplay = true) {
  clearTimeout(playTimer);

  const shouldPlay = autoplay || !audio.paused || isPlaying;

  if (isShuffled && shuffledOrder.length > 0) {
    trackIndex = shuffledOrder[getNextShuffledIndex()];
  } else {
    trackIndex = (trackIndex + 1) % songs.length;
  }

  localStorage.setItem('trackIndex', trackIndex);
  loadTrack(trackIndex, true);

  if (shouldPlay) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }
}

function prevTrack() {
  clearTimeout(playTimer);
  if (isShuffled && shuffledOrder.length > 0) {
    trackIndex = shuffledOrder[getPrevShuffledIndex()];
  } else {
    trackIndex = (trackIndex - 1 + songs.length) % songs.length;
  }
  localStorage.setItem('trackIndex', trackIndex);
  loadTrack(trackIndex, true);
  if (isPlaying) {
    playTrack();
  }
}

// Player control functions
function loadTrack(trackIndex, resetPosition = false) {
  clearTimeout(playTimer);
  progress.style.width = '0%';
  currTime.textContent = '0:00';
  durTime.textContent = '0:00';

  title.innerText = songs[trackIndex];
  artist.innerText = artists[trackIndex];
  audio.src = `/mus/${songs[trackIndex]}.mp3`;
  cover.src = `/img/art/${albumArt[trackIndex]}`;

  audio.addEventListener('loadedmetadata', function() {
    durTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('canplay', function onCanPlay() {
    audio.removeEventListener('canplay', onCanPlay);

    if (resetPosition) {
      audio.currentTime = 0;
    } else {
      const lastTrack = localStorage.getItem('lastTrack');
      if (lastTrack === songs[trackIndex]) {
        audio.currentTime = currentTime;
      }
    }
    localStorage.setItem('lastTrack', songs[trackIndex]);
  }, { once: true });
}

function playTrack() {
  audio.play().catch(error => {
    console.error('Playback failed:', error);
  });
}

function pauseTrack() {
  audio.pause();
}

function togglePlayback() {
  if (audio.paused) {
    playTrack();
  } else {
    pauseTrack();
  }
}

// UI and progress functions
function syncPlayButton() {
  const isActuallyPlaying = !audio.paused;

  if (isActuallyPlaying) {
    musicContainer.classList.add('play');
    playBtn.querySelector('img').src = '/img/icon/pause.svg';
    playBtn.querySelector('img').alt = 'pause';
  } else {
    musicContainer.classList.remove('play');
    playBtn.querySelector('img').src = '/img/icon/play.svg';
    playBtn.querySelector('img').alt = 'play';
  }
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  currTime.textContent = formatTime(currentTime);
  if (!isNaN(duration)) {
    durTime.textContent = formatTime(duration);
  }
  localStorage.setItem('currentTime', currentTime);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
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

// Keyboard and swipe controls
function handleKeyDown(e) {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    togglePlayback();
    return;
  }
  if (!e.ctrlKey) return;
  e.preventDefault();
  switch (e.code) {
    case 'ArrowRight':
      nextTrack();
      break;
    case 'ArrowLeft':
      prevTrack();
      break;
    case 'KeyS':
      toggleShuffle();
      break;
    case 'KeyR':
      toggleRepeat();
      break;
  }
}

function handleVisibilityChange() {
  if (!document.hidden) {
    syncPlayButton();
  }
}

function handleSwipe() {
  const swipeThreshold = 50;
  const swipeDiff = touchStartX - touchEndX;

  if (swipeDiff > swipeThreshold) {
    nextTrack();
  } else if (swipeDiff < -swipeThreshold) {
    prevTrack();
  }
}

// Tracklist event delegation
function setupTrackClickListeners() {
  const trackLists = [
    document.getElementById('track-click-playlist')
  ];

  trackLists.forEach(trackList => {
    if (trackList) {
      trackList.addEventListener('click', handleTrackClick);
    }
  });
}

function handleTrackClick(e) {
  const listItem = e.target.closest('li[data-index]');
  if (!listItem) return;

  e.preventDefault();
  e.stopPropagation();
  clearTimeout(playTimer);

  trackIndex = parseInt(listItem.getAttribute('data-index'), 10);
  localStorage.setItem('trackIndex', trackIndex);
  loadTrack(trackIndex, true);
  playTrack();
}

// Initialization
function initPlayer() {
  updateShuffleButton();
  updateRepeatButton();
  audio.loop = isRepeated;
  loadTrack(trackIndex);
  if (isPlaying) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
        pauseTrack();
      });
    }
  }
  setupTrackClickListeners();
}

// Main event listeners
document.addEventListener('DOMContentLoaded', initPlayer);
playBtn.addEventListener('click', togglePlayback);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
document.getElementById('shuffle').addEventListener('click', toggleShuffle);
document.getElementById('repeat').addEventListener('click', toggleRepeat);
progressContainer.addEventListener('click', setProgress);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('visibilitychange', handleVisibilityChange);

// Persist state on page unload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('trackIndex', trackIndex);
  localStorage.setItem('isPlaying', isPlaying);
  localStorage.setItem('currentTime', audio.currentTime);
});

// Swipe event listeners
musicContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

musicContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, false);