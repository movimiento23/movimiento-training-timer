// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- COMMON: WEB AUDIO API SETUP ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sounds = {};

    function loadSound(name, url) {
        window.fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                sounds[name] = audioBuffer;
            }).catch(e => console.error(`Error loading sound: ${name}`, e));
    }

    function playSound(name) {
        if (!sounds[name] || audioContext.state === 'suspended') return;
        try {
            const source = audioContext.createBufferSource();
            source.buffer = sounds[name];
            source.connect(audioContext.destination);
            source.start(0);
        } catch (e) {
            console.error(`Error playing sound: ${name}`, e);
        }
    }
    
    // Resume audio context on first user gesture
    document.body.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });


    loadSound('start_work', 'start_work.mp3');
    loadSound('start_rest', 'start_rest.mp3');
    loadSound('countdown', 'countdown.mp3');
    loadSound('finish', 'finish.mp3');

    // --- INTERVAL TIMER ---
    const setupView = document.getElementById('setup-view');
    const timerView = document.getElementById('timer-view');
    const setsValueEl = document.getElementById('sets-value');
    const workValueEl = document.getElementById('work-value');
    const restValueEl = document.getElementById('rest-value');
    const startBtn = document.getElementById('start-btn');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const resetBtn = document.getElementById('reset-btn');
    const currentSetDisplay = document.getElementById('current-set-display');
    const currentPhaseDisplay = document.getElementById('current-phase-display');
    const timerDisplay = document.getElementById('timer-display');
    const phaseDisplayColorWork = '#F44336';
    const phaseDisplayColorRest = '#2196F3';
    const setupTitle = document.getElementById('setup-title');

    let settings = { sets: 8, work: 20, rest: 10 };
    let timerState = { currentSet: 1, isWorkPhase: true, timeLeft: settings.work, isPaused: false, intervalId: null };
    let countdownIntervalId = null;

    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    function updateSetupDisplay() {
        setsValueEl.textContent = settings.sets;
        workValueEl.textContent = formatTime(settings.work);
        restValueEl.textContent = formatTime(settings.rest);
    }

    setupView.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-control')) return;
        const button = e.target.closest('.btn-control');
        const action = button.dataset.action;
        const target = button.dataset.target;
        const step = (target === 'sets') ? 1 : 5;
        
        if (action === 'increase') {
            settings[target] += (target === 'sets') ? step : (settings[target] < 3595 ? step : 0);
        } else {
            settings[target] = Math.max(target === 'sets' ? 1 : step, settings[target] - step);
        }
        updateSetupDisplay();
    });

    function initiateCountdown() {
        setupView.classList.add('hidden');
        timerView.classList.remove('hidden');
        
        pauseResumeBtn.disabled = true;
        
        currentSetDisplay.textContent = 'Prepárate';
        currentPhaseDisplay.textContent = 'COMIENZA EN...';
        currentPhaseDisplay.style.color = '#e0e0e0';
        
        let countdown = 5;
        
        timerDisplay.textContent = formatTime(countdown);
        playSound('countdown');
        
        countdownIntervalId = setInterval(() => {
            countdown--;
            timerDisplay.textContent = formatTime(countdown);

            if (countdown > 0) {
                playSound('countdown');
            } else {
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
                startWorkout();
            }
        }, 1000);
    }

    function startWorkout() {
        pauseResumeBtn.disabled = false;
        timerState = { currentSet: 1, isWorkPhase: true, timeLeft: settings.work, isPaused: false, intervalId: null };
        updateTimerDisplay();
        startTimerInterval();
        playSound('start_work');
    }

    function updateTimerDisplay() {
        currentSetDisplay.textContent = `SET ${timerState.currentSet} / ${settings.sets}`;
        currentPhaseDisplay.textContent = timerState.isWorkPhase ? 'TRABAJO' : 'DESCANSO';
        currentPhaseDisplay.style.color = timerState.isWorkPhase ? phaseDisplayColorWork : phaseDisplayColorRest;
        timerDisplay.textContent = formatTime(timerState.timeLeft);
    }
    
    function tick() {
        timerState.timeLeft--;
        updateTimerDisplay();
        if (timerState.timeLeft <= 3 && timerState.timeLeft > 0) playSound('countdown');
        if (timerState.timeLeft <= 0) nextPhase();
    }

    function nextPhase() {
        clearInterval(timerState.intervalId);
        if (timerState.isWorkPhase) {
            if (timerState.currentSet >= settings.sets) {
                endWorkout();
                return;
            }
            timerState.isWorkPhase = false;
            timerState.timeLeft = settings.rest;
            playSound('start_rest');
        } else {
            timerState.isWorkPhase = true;
            timerState.currentSet++;
            timerState.timeLeft = settings.work;
            playSound('start_work');
        }
        updateTimerDisplay();
        startTimerInterval();
    }

    const startTimerInterval = () => timerState.intervalId = setInterval(tick, 1000);
    
    function pauseResumeTimer() {
        timerState.isPaused = !timerState.isPaused;
        if (timerState.isPaused) {
            clearInterval(timerState.intervalId);
            pauseResumeBtn.textContent = 'Reanudar';
        } else {
            startTimerInterval();
            pauseResumeBtn.textContent = 'Pausar';
        }
    }
    
    function resetWorkout() {
        clearInterval(timerState.intervalId);
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        timerView.classList.add('hidden');
        setupView.classList.remove('hidden');
        pauseResumeBtn.textContent = 'Pausar';
    }

    const endWorkout = () => { playSound('finish'); resetWorkout(); };

    startBtn.addEventListener('click', initiateCountdown);
    pauseResumeBtn.addEventListener('click', pauseResumeTimer);
    resetBtn.addEventListener('click', resetWorkout);

    // --- STOPWATCH ---
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const startStopBtn = document.getElementById('stopwatch-start-stop-btn');
    const lapResetBtn = document.getElementById('stopwatch-lap-reset-btn');
    const lapsList = document.getElementById('laps-list');

    let sw = { isRunning: false, startTime: 0, elapsedTime: 0, intervalId: null, laps: [] };

    function formatStopwatchTime(ms) {
        let total_seconds = Math.floor(ms / 1000);
        let hours = Math.floor(total_seconds / 3600).toString().padStart(2, '0');
        let minutes = Math.floor((total_seconds % 3600) / 60).toString().padStart(2, '0');
        let seconds = (total_seconds % 60).toString().padStart(2, '0');
        let centiseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}.${centiseconds}`;
    }

    const updateStopwatch = () => stopwatchDisplay.textContent = formatStopwatchTime(Date.now() - sw.startTime + sw.elapsedTime);
    
    startStopBtn.addEventListener('click', () => {
        sw.isRunning = !sw.isRunning;
        if (sw.isRunning) {
            sw.startTime = Date.now();
            sw.intervalId = setInterval(updateStopwatch, 10);
            startStopBtn.textContent = 'Parar';
            lapResetBtn.textContent = 'Vuelta';
        } else {
            clearInterval(sw.intervalId);
            sw.elapsedTime += Date.now() - sw.startTime;
            startStopBtn.textContent = 'Iniciar';
            lapResetBtn.textContent = 'Reiniciar';
        }
    });
    
    lapResetBtn.addEventListener('click', () => {
        if (sw.isRunning) {
            const lapTime = Date.now() - sw.startTime + sw.elapsedTime;
            sw.laps.push(lapTime);
            const li = document.createElement('li');
            const lapNumber = document.createElement('span');
            lapNumber.textContent = `Vuelta ${sw.laps.length}`;
            const lapTimeEl = document.createElement('span');
            lapTimeEl.textContent = formatStopwatchTime(lapTime);
            li.appendChild(lapNumber);
            li.appendChild(lapTimeEl);
            lapsList.prepend(li);
        } else {
            sw = { isRunning: false, startTime: 0, elapsedTime: 0, intervalId: null, laps: [] };
            stopwatchDisplay.textContent = '00:00:00.00';
            lapsList.innerHTML = '';
            lapResetBtn.textContent = 'Vuelta';
        }
    });

    // --- WORKOUT PRESETS ---
    const presetsSelect = document.getElementById('presets-select');
    const workoutPresets = {
        amrap10: { sets: 1, work: 10 * 60, rest: 0 },
        amrap12: { sets: 1, work: 12 * 60, rest: 0 },
        amrap15: { sets: 1, work: 15 * 60, rest: 0 },
        emom10: { sets: 10, work: 60, rest: 0 },
        emom12: { sets: 12, work: 60, rest: 0 },
        tabata4: { sets: 8, work: 20, rest: 10 },
        circuito45x15: { sets: 12, work: 45, rest: 15 },
        hiit30x15: { sets: 15, work: 30, rest: 15 },
        hiit25x15: { sets: 12, work: 25, rest: 15 }
    };

    presetsSelect.addEventListener('change', (e) => {
        const selectedPreset = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        
        if (workoutPresets[selectedPreset]) {
            const preset = workoutPresets[selectedPreset];
            settings.sets = preset.sets;
            settings.work = preset.work;
            settings.rest = preset.rest;
            updateSetupDisplay();
            setupTitle.textContent = selectedOption.text;
        } else {
            setupTitle.textContent = 'Ponete En Movimiento';
        }
    });

    updateSetupDisplay();
});