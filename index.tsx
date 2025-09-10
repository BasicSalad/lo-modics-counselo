declare var Tone: any; // Declare Tone.js as a global variable

const counselorForm = document.getElementById('counselor-form') as HTMLFormElement;
const userInput = document.getElementById('user-question') as HTMLTextAreaElement;
const answerDisplay = document.getElementById('counselor-answer') as HTMLParagraphElement;
const submitButton = counselorForm.querySelector('button[type="submit"]') as HTMLButtonElement;

let whyCounter = 0;
const dotColors = ['red', 'green', 'blue', 'yellow'];

// --- Tone.js Music Setup ---
// This creates a gentle, ambient synth sound.
const synth = new Tone.AMSynth({
    harmonicity: 1.5, // Creates a richer, bell-like tone
    envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 2.0, // Long release for a spacious feel
    },
    oscillator: {
        type: "sine" // A pure, calm sound wave
    }
});

// Add a reverb effect for a sense of space.
const reverb = new Tone.Reverb({
    decay: 8, // Long reverb tail
    wet: 0.5  // Mix of original sound and reverb
}).toDestination(); // Connect the effect to the speakers

// Connect the synth to the reverb effect.
synth.connect(reverb);

// Define the musical notes for a seamless loop.
const melody = [
    { time: '0:0:0', note: 'C3', duration: '2n' },
    { time: '0:2:0', note: 'G3', duration: '2n' },
    { time: '1:0:0', note: 'E3', duration: '1n' },
    { time: '2:0:0', note: 'A3', duration: '2n' },
    { time: '2:2:0', note: 'G3', duration: '2n' },
    { time: '3:0:0', note: 'F3', duration: '1n' },
    { time: '4:0:0', note: 'D3', duration: '2n' },
    { time: '4:2:0', note: 'G3', duration: '2n' },
    { time: '5:0:0', note: 'C3', duration: '1n' }
];

// Create the part to play the melody.
const musicPart = new Tone.Part(function(time, value) {
    synth.triggerAttackRelease(value.note, value.duration, time);
}, melody);

// Loop the part forever.
musicPart.loop = true;
musicPart.loopEnd = '6m'; // Loop is 6 measures long.

// Set a calm tempo.
Tone.Transport.bpm.value = 72;

// Add static noise generator for angry mode
const noise = new Tone.Noise("pink").toDestination();
noise.volume.value = -20; // Set to a lower, less jarring volume
// --- End Tone.js Music Setup ---

const responses: string[] = [
  "Why?",
  "But why is that?",
  "Why do you say that?",
  "Why do you feel that way?",
  "Could you elaborate on why that is?",
  "Why do you think that is the reason?",
  "And why is that important to you?",
  "Why do you believe that leads to your conclusion?",
  "Why that specific word choice?",
  "Tell me more about the 'why' of it.",
  "Interesting. Why do you believe that to be true?",
  "And why does that matter so much?",
  "Why do you think that's the underlying reason?",
  "Why has this come up for you now?",
  "Why do you think that is the source of this feeling?",
  "Why does that particular detail stand out?",
  "And what's behind that 'why' for you?",
];

const getRandomResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

// --- Music Handling ---
// This function will start the generative music on the first user interaction.
const playMusicOnInteraction = async () => {
  // Audio context needs to be started by a user gesture.
  if (Tone.context.state !== 'running') {
      await Tone.start();
  }

  // Start the music if it's not already playing.
  if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      musicPart.start(0);
  }
  
  // Once it has run, remove the listeners to avoid re-triggering.
  document.removeEventListener('click', playMusicOnInteraction);
  document.removeEventListener('keydown', playMusicOnInteraction);
};

// Add listeners for the first user interaction.
document.addEventListener('click', playMusicOnInteraction);
document.addEventListener('keydown', playMusicOnInteraction);
// --- End Music Handling ---


counselorForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();

  const question = userInput.value.trim().toLowerCase();

  if (!question || submitButton.disabled) {
    return;
  }

  let response = '';

  if (question === 'why') {
    whyCounter++;
    if (whyCounter === 3) {
      // Trigger angry state
      noise.start();
      document.body.classList.add('angry-mode');
      answerDisplay.classList.remove('loading');
      answerDisplay.classList.add('angry-text');
      answerDisplay.textContent = "WHY DO YOU KEEP ASKING ME THAT?!";
      submitButton.disabled = true;
      userInput.value = '';

      setTimeout(() => {
        noise.stop();
        document.body.classList.remove('angry-mode');
        answerDisplay.classList.remove('angry-text');
        answerDisplay.textContent = 'ok, why dont we start again';
        submitButton.disabled = false;
        whyCounter = 0; // Reset counter
        userInput.focus();
      }, 5000);
      return; // Exit the normal flow
    }
    response = "Why not?";
  } else {
    whyCounter = 0; // Reset counter if it's not "why"
    response = getRandomResponse();
  }

  // Standard response flow
  answerDisplay.innerHTML = '<div class="loader"></div>';
  answerDisplay.classList.add('loading');
  submitButton.disabled = true;

  setTimeout(() => {
    answerDisplay.classList.remove('loading');

    // Select a random color and style the word "why"
    const randomColor = dotColors[Math.floor(Math.random() * dotColors.length)];
    const styledResponse = response.replace(
      /why/gi,
      (match) => `<span class="why-color ${randomColor}">${match}</span>`
    );
    answerDisplay.innerHTML = styledResponse;
    
    submitButton.disabled = false;
    userInput.focus();
  }, 3000);

  userInput.value = '';
});