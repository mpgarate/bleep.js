Bleep.js
========

Retro tones in js, one note at a time. 

With Bleep, notes are appended to an asynchronous playback queue to allow composing scores directly in javascript. 

Bleep depends on AudioContext or webkitAudioContext, currently only available in Chrome and (untested) Safari. Some FireFox support thanks to [cwilso's MonkeyPatch](https://github.com/cwilso/AudioContext-MonkeyPatch). 

Basic usage
-----------

Calling `bloop()` generates a short, pleasing retro arp sound.
~~~ js
Bleep.bloop();
~~~
You can also call `bloop()` with a fixed value of notes to play.
~~~ js
Bleep.bloop(8);
~~~


Generate your own arpeggio with `arp`
~~~ js
Bleep.arp("C", "Minor", 32, 120); 
Bleep.start();
~~~
defaults: ```Bleep.arp(key = "Eb", scale = major, duration = 16 notes, tempo = 120, octave = 4)```

Add a pause to the queue with `rest()`
~~~ js
Bleep.rest(8); // will rest for length of 8th note
Bleep.rest(1); // will rest for length of whole note
Bleep.rest("R8"); // alternate syntax for 8th note
Bleep.rest("R1"); // alternate syntax for whole note
Bleep.tone("R8"); // also legal
~~~

Add a simple tone to the queue with `tone()`
~~~ js
Bleep.tone("C4"); //Bleep.tone(note); // default duration: 16th note
Bleep.tone("A#2",16); //Bleep.tone(note, duration);
Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);
Bleep.start();
~~~

Play a custom sequence with `sequence()`
~~~ js
// Formatted to one quarter measure per line
var mySequence = [
  "A4", "A5", "A4", "A5", // Four 16th notes
  "R4",                   // rest for a quarter measure
  "R8",       ["C4", 8]   // 8th rest and an eighth note
  "E4"                    // One quarter note
]
Bleep.sequence(mySequence);
~~~

View events in the queue with the `events` property
~~~ js
Bleep.events; // returns array of NoteEvent objects
~~~

You can modify events before calling `play()`. For example:
~~~ js
Bleep.tone("A4"); //default duration
Bleep.events[0].duration = 1; //change duration to measure length
Bleep.start(); // Tone 'A4' is played for the new duration
~~~

~~~ js
Bleep.bloopScoopDaWoop(); // Here be dragons
~~~

Configure your Bleep
--------
Adjust these before calling arp, bloop, tone. 
~~~ js
Bleep.setWaveform("sine"); // indicate sine, sqaure, sawtooth, triangle
Bleep.setbpm(120); // tempo in beats per minute
~~~

These setting helpers are handled as events in the queue so you can change them throughout your composition:
~~~ js
Bleep.setbpm(120); // standard tempo
Bleep.tone("A4");
Bleep.tone("C4");
Bleep.tone("D4");
Bleep.tone("F4");
Bleep.setbpm(240); // double time!
Bleep.tone("C4");
Bleep.tone("G4");
Bleep.tone("E4");
Bleep.tone("B4");
Bleep.tone("C4");
Bleep.tone("A4");
Bleep.tone("E4");
Bleep.tone("A4");
~~~

