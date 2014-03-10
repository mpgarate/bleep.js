Bleep.js
========

Retro tones in js, one note at a time. 

With Bleep, notes are appended to an asynchronous playback queue to allow composing scores directly in javascript. 

Demo: http://michaelgarate.com/bleep/examples/

Bleep depends on AudioContext or webkitAudioContext, currently only available in Chrome and (untested) Safari. Some FireFox support thanks to [cwilso's MonkeyPatch](https://github.com/cwilso/AudioContext-MonkeyPatch). 


Basic usage
-----------


Calling `bloop()` generates a short, pleasing retro arp sound.
~~~ js
Bleep.bloop();
~~~
You can also call `bloop()` with a hash of parameters.
~~~ js
var params = {
  key: "C",           // default: "A"
  scale: "major",     // default: "minor"
  notes: 32,          // default: 8
  duration: 8,        // default: 16
  tempo: 90,          // default: 120
  octave: 4,          // default: 4
  octave_range: 2     // default: 1
}

Bleep.bloop(params);
~~~

Composing Tunes
-----------

Generate your own arpeggio with `arp` by passing a hash with optional parameters as above, with additional `direction` setting.
~~~ js
var params = {
  direction: "down",  // default: "up"
}
              
Bleep.arp(params); 
Bleep.start();
~~~


Add a simple tone to the queue with `tone()`
~~~ js
Bleep.tone("C4"); //Bleep.tone(note); // default duration: 16th note
Bleep.tone("A#2",16); //Bleep.tone(note, duration);
Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);
Bleep.start();
~~~


#### Valid Input Strings
~~~ js
// Notes

"A","B","C","D","E","F","G" // by default in octave 4
"A#","Ab","Bb","C#","Db","D#","Eb","F#","Gb","G#","Ab"

// Valid octaves: 0 - 7

"A3"    // octave 3. 
"Ab3"   // octave 3.

// Note durations

"A", 1  // whole note
"A", 2  // half note
"A", 4  // quarter note
"A", 8  // eigth note
"A", 16 // sixteenth note
"A", 32 // thirty-second note

"A", 3  // dotted quarter note
"A", 6  // dotted eigth note
"A", 12 // dotted sixteenth note
"A", 24 // dotted thirty-second note


~~~


Add a pause to the queue with `rest()`
~~~ js
Bleep.rest(8); // will rest for length of 8th note
Bleep.rest(1); // will rest for length of whole note
Bleep.rest("R8"); // alternate syntax for 8th note
Bleep.rest("R1"); // alternate syntax for whole note
Bleep.tone("R8"); // also legal
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


~~~ js
Bleep.bloopScoopDaWoop(); // Here be dragons
~~~

Configure Bleep
--------
Adjust these before calling arp, bloop, tone. 
~~~ js
Bleep.setWaveform("sine");  // indicate sine, sqaure, sawtooth, triangle
Bleep.setbpm(120);          // tempo in beats per minute
Bleep.setMasterVolume(0.8); // scale from 0 to 1
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

The master volume can also be set instantly with `Bleep.liveSetMasterVolume()`
~~~ js
Bleep.liveSetMasterVolume(value);
~~~

Advanced Usage
--------
Supply callback functions to run on note playback end or when a note is added to the queue. This is used in the demo to redraw the visual queue.

~~~ js
Bleep.onNoteEnd(function(){
  showQueue();
});
Bleep.onListChange(function(){
  showQueue();
});
~~~

View events in the queue with the `events` property
~~~ js
Bleep.getEvents(); // returns array of NoteEvent objects
~~~

You can modify events before calling `play()`. For example:
~~~ js
Bleep.tone("A4"); //default duration
Bleep.pendingEvents[0].duration = 1; //change duration to measure length
Bleep.start(); // Tone 'A4' is played for the new duration
~~~

After `start()` has been called, `Bleep.pendingEvents` is copied to `Bleep.liveEvents` and then cleared. 

