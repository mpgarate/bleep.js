context = new window.AudioContext;

window.Bleep = (function() {
	var Bleep = function(){};
	var Note = function(){};
	var noteQueue = [];

	Bleep.version = "0.0.1";

	var Settings = Bleep.settings = {
		waveform: "sine",
		bpm: 120
	};

	Note.prototype.HzNote;		// note in Hertz, ready for oscillator
	Note.prototype.durationMs;	// duration in ms
	Note.prototype.isNote;

	// Play a tone
	// note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
	// duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
	// octave is in MIDI standard, 0-8
	Bleep.tone = function(note, duration, octave){
		if (typeof duration === 'undefined'){
			duration = 16;
		}
		var HzNote = stringToHzNote(note, octave);
		
		var note = new Note();
		note.HzNote = HzNote;
		//note.durationMs = ((duration * 32) / (Settings.bpm / 60));
		note.durationMs = Bleep.__durationToMs(duration);
		console.log("duration: " + note.durationMs);
		note.isNote = 1; // will generate at gain = 1
		noteQueue.push(note);
  }

	// Play silence for a given duration.
	// duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(duration){
  	var note = new Note();
  	note.HzNote = 0;
  	note.durationMs = Bleep.__durationToMs(duration);
  	note.isNote = 0; // will generate at gain = 0
		noteQueue.push(note);
  }

  // Begin processing event queue. Schedule notes and rests. 
  Bleep.start = function(){
  	var playTime = 0;
  	var note;

  	while(noteQueue.length > 0){
  		note = noteQueue.shift();

			var o = context.createOscillator();
			var g = context.createGain();

			o.connect(g);
			g.connect(context.destination);
			g.gain.value = 0;
    	o.frequency.value = parseFloat(note.HzNote); 
			o.start(0);

  		Bleep.__playNote(note,playTime,o,g);

  		playTime += note.durationMs;
  	}
  }

  // Play a note from the event queue
  Bleep.__playNote = function(note, playTime, o, g){
  	setTimeout(function(){
	    g.gain.value = note.isNote; // 0 or 1
  	}, playTime);

		// fade note to prevent pop
    setTimeout(function(){
			g.gain.value = 0;
    }, playTime + note.durationMs - 10);

    // kill oscillator shortly after
    setTimeout(function(){
    	o.stop(0);
	    o = null;
	    g = null;
    }, playTime + note.durationMs * 1.5);
  }

  // Convert a duration to ms using current BPM
	// duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.__durationToMs = function(d){
  	return ((60000) / (Settings.bpm * (d/4)));
  }



	return Bleep;
})();
