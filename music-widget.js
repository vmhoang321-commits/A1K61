// ==========================================
// FILE: music-widget.js
// ==========================================

// 1. Tự động chèn HTML của Widget nhạc vào trang web để không phải copy thủ công
const musicWidgetHTML = `
    <div id="music-widget">
        <button class="music-toggle-btn" id="musicToggleBtn" title="Chill">
            <span class="vinyl-icon">🎵</span>
        </button>

        <div class="music-panel">
            <div class="music-header">
                <h4>🎧 Chill</h4>
                <button class="close-panel-btn" id="closePanelBtn">×</button>
            </div>

            <div class="now-playing">
                <p id="current-song-title">Đang chọn bài...</p>
            </div>

            <div class="progress-container">
                <input type="range" id="progressBar" class="progress-bar" value="0" min="0" max="100" step="0.1">
                <div class="time-info">
                    <span id="currentTime">00:00</span>
                    <span id="durationTime">00:00</span>
                </div>
            </div>

            <audio id="audio-player"></audio>

            <div class="music-controls">
                <button class="ctrl-btn" id="prevBtn" title="Bài trước">⏮</button>
                <button class="ctrl-btn play-pause-btn" id="playPauseBtn" title="Phát/Dừng">▶</button>
                <button class="ctrl-btn" id="nextBtn" title="Bài tiếp">⏭</button>
            </div>

            <div class="playlist" id="playlistContainer"></div>
        </div>
    </div>
`;

// Chèn widget vào cuối body tự động
document.body.insertAdjacentHTML('beforeend', musicWidgetHTML);

// 2. Logic xử lý trình phát nhạc & sessionStorage
document.addEventListener("DOMContentLoaded", () => {
    // Xử lý Tooltip Thủ Quỹ (nếu có ở trang đó)
    const treasurerCard = document.querySelector('.treasurer-card');
    if (treasurerCard) {
        treasurerCard.addEventListener('click', function(e) {
            this.classList.toggle('active-tooltip');
            e.stopPropagation();
        });
        document.addEventListener('click', function(e) {
            if (!treasurerCard.contains(e.target)) {
                treasurerCard.classList.remove('active-tooltip');
            }
        });
    }

    const musicWidget = document.getElementById('music-widget');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSongTitle = document.getElementById('current-song-title');
    const playlistContainer = document.getElementById('playlistContainer');
    
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationTimeEl = document.getElementById('durationTime');

    const playlist = [
        { title: "Tim Em - Hngle", src: "music/Tim Em.mp3" },
        { title: "Vet Thuong - fishy", src: "music/Vet thuong.mp3" },
        { title: "Cyberpunk Vibe", src: "music/cyber.mp3" }
    ];

    let currentTrackIndex = parseInt(sessionStorage.getItem('music_index')) || 0;
    let savedTime = parseFloat(sessionStorage.getItem('music_time')) || 0;
    let isPlaying = sessionStorage.getItem('music_playing') === 'true';
    audioPlayer.volume = 0.4;

    musicToggleBtn.addEventListener('click', () => {
        musicWidget.classList.add('active');
    });

    closePanelBtn.addEventListener('click', () => {
        musicWidget.classList.remove('active');
    });

    function renderPlaylist() {
        playlistContainer.innerHTML = '';
        playlist.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
            item.innerText = `${index + 1}. ${song.title}`;
            item.addEventListener('click', () => {
                loadTrack(index, 0, true);
            });
            playlistContainer.appendChild(item);
        });
    }

    function loadTrack(index, startAt = 0, autoPlay = false) {
        currentTrackIndex = index;
        audioPlayer.src = playlist[index].src;
        currentSongTitle.innerText = playlist[index].title;
        
        audioPlayer.addEventListener('loadedmetadata', function() {
            audioPlayer.currentTime = startAt;
            if (autoPlay) playAudio();
        }, { once: true });

        renderPlaylist();
        sessionStorage.setItem('music_index', currentTrackIndex);
    }

    function playAudio() {
        audioPlayer.play().then(() => {
            musicWidget.classList.add('playing');
            playPauseBtn.innerText = "⏸";
            sessionStorage.setItem('music_playing', 'true');
        }).catch(err => console.log("Chờ tương tác", err));
    }

    function pauseAudio() {
        audioPlayer.pause();
        musicWidget.classList.remove('playing');
        playPauseBtn.innerText = "▶";
        sessionStorage.setItem('music_playing', 'false');
    }

    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) playAudio();
        else pauseAudio();
    });

    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex, 0, true);
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex, 0, true);
    });

    audioPlayer.addEventListener('ended', () => {
        nextBtn.click();
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progressPercent;
            currentTimeEl.innerText = formatTime(audioPlayer.currentTime);
            if (!audioPlayer.paused) {
                sessionStorage.setItem('music_time', audioPlayer.currentTime);
            }
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationTimeEl.innerText = formatTime(audioPlayer.duration);
    });

    progressBar.addEventListener('input', () => {
        if (audioPlayer.duration) {
            const seekTime = (progressBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
            sessionStorage.setItem('music_time', seekTime);
        }
    });

    loadTrack(currentTrackIndex, savedTime, isPlaying);

    let hasInteracted = false;
    function triggerAutoplayOnFirstInteraction() {
        if (!hasInteracted && isPlaying) {
            hasInteracted = true;
            playAudio();
            window.removeEventListener('click', triggerAutoplayOnFirstInteraction);
            window.removeEventListener('keydown', triggerAutoplayOnFirstInteraction);
            window.removeEventListener('touchstart', triggerAutoplayOnFirstInteraction);
        }
    }
    window.addEventListener('click', triggerAutoplayOnFirstInteraction);
    window.addEventListener('keydown', triggerAutoplayOnFirstInteraction);
    window.addEventListener('touchstart', triggerAutoplayOnFirstInteraction);
});
