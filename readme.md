Bleep.js
############

Retro tones in js, one note at a time. 

When calling Bloop, notes are appended to an asynchronous playback queue. 

Bleep.bloop(); // generates a short, pleasing retro arp sound

// Generate your own arpeggio
// defaults: Bleep.arp(key = Eb, scale = major, duration = 16 notes, tempo = 120, octave = 4)
Bleep.arp("C", "Minor", 32, 120); 

// Silence all sounds and clear the queue
Bleep.stop();

// Add a pause to the queue
Bleep.rest();

// Generate a simple tone
Bleep.tone("C4"); //Bleep.tone(note, duration);
Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);

Bleep.bloopScoopDaWoop(); // Here be dragons

// Configure your Bleep
// Adjust these before calling arp, bloop, tone
Bleep.waveform = "sine"; // indicate sine, sqaure, etc. Custom waveforms on the wishlist.

https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#dfn-OscillatorNode