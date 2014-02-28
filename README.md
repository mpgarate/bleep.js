Bleep.js
========

Retro tones in js, one note at a time. 

When calling Bloop, notes are appended to an asynchronous playback queue. This allows composing scores directly in javascript. 

Basic usage
-----------

Calling `bloop()` generates a short, pleasing retro arp sound.
~~~ js
Bleep.bloop();
~~~


Generate your own arpeggio with `arp`
~~~ js
Bleep.arp("C", "Minor", 32, 120); 
~~~
defaults: ```Bleep.arp(key = "Eb", scale = major, duration = 16 notes, tempo = 120, octave = 4)```

Silence all sounds with `stop()`
~~~ js
Bleep.stop();
~~~

Clear the queue with `clear()`
~~~ js
Bleep.clear();
~~~

Add a pause to the queue with `rest()`
~~~ js
Bleep.rest();
~~~

Generate a simple tone with `tone()`
~~~ js
Bleep.tone("C4"); //Bleep.tone(note, duration);
Bleep.tone("A#2",16); //Bleep.tone(note, duration);
Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);
~~~

~~~ js
Bleep.bloopScoopDaWoop(); // Here be dragons
~~~

// Configure your Bleep
// Adjust these before calling arp, bloop, tone
Bleep.waveform = "sine"; // indicate sine, sqaure, etc. Custom waveforms on the wishlist.

https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#dfn-OscillatorNode
