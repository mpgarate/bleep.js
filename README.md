Bleep.js
========

Retro tones in js, one note at a time. 

With Bleep, notes are appended to an asynchronous playback queue. This allows composing scores directly in javascript. 

Basic usage
-----------

Calling `bloop()` generates a short, pleasing retro arp sound.
~~~ js
Bleep.bloop();
~~~
You can also call `bloop()` with a fixed value of notes to play.
~~~ js
Bleep.bloop(16);
~~~


Generate your own arpeggio with `arp`
~~~ js
Bleep.arp("C", "Minor", 32, 120); 
Bleep.start();
~~~
defaults: ```Bleep.arp(key = "Eb", scale = major, duration = 16 notes, tempo = 120, octave = 4)```

Silence all sounds and clear the queue with `stop()`
~~~ js
Bleep.stop();
~~~

Add a pause to the queue with `rest()`
~~~ js
Bleep.rest();
~~~

Add a simple tone to the queue with `tone()`
~~~ js
Bleep.tone("C4"); //Bleep.tone(note, duration);
Bleep.tone("A#2",16); //Bleep.tone(note, duration);
Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);
Bleep.start();
~~~

~~~ js
Bleep.bloopScoopDaWoop(); // Here be dragons
~~~

Configure your Bleep
--------
Adjust these before calling arp, bloop, tone. 
~~~ js
Bleep.setWaveform("sine"); // indicate sine, sqaure, sawtooth, triangle
Bleep.bpm(120); // tempo in beats per minute
~~~

These setting helpers are handled as events in the queue so you can change them throughout your composition:
~~~ js
Bleep.bpm(120); // standard tempo
Bleep.tone("A4");
Bleep.tone("C4");
Bleep.tone("D4");
Bleep.tone("F4");
Bleep.bpm(240); // double time!
Bleep.tone("C4");
Bleep.tone("G4");
Bleep.tone("E4");
Bleep.tone("B4");
Bleep.tone("C4");
Bleep.tone("A4");
Bleep.tone("E4");
Bleep.tone("A4");
~~~

