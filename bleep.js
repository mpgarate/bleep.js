context = new (window.AudioContext || window.webkitAudioContext);

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

	// note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
	// duration is in 32nd notes. 32 = 1 beat. 16 = 1/2 note. 8 = 1/4 note.
	// octave is in MIDI standard, 0-8
	Bleep.tone = function(note, duration, octave){
		if (typeof duration === 'undefined'){
			duration = 8;
		}
		var HzNote = stringToHzNote(note, octave);
		
		var note = new Note();
		note.HzNote = HzNote;
		//note.durationMs = ((duration * 32) / (Settings.bpm / 60));
		note.durationMs = ((60000) / (Settings.bpm * (duration/4)));
		console.log("duration: " + note.durationMs);

		noteQueue.push(note);
  }

  Bleep.start = function(){
  	var playTime = 0;
  	var note;

  	while(noteQueue.length > 0){
  		note = noteQueue.shift();

			var o = context.createOscillator();
			var g = context.createGainNode();

			o.connect(g);
			g.connect(context.destination);
			g.gain.value = 0;
    	o.frequency.value = parseFloat(note.HzNote); 
			o.start(0);

  		Bleep.__playNote(note,playTime,o,g);

  		playTime += note.durationMs;
  	}
  }

  Bleep.__playNote = function(note, playTime, o, g){
  	setTimeout(function(){
	    g.gain.value = 1;
  	}, playTime);

		// fade note to prevent pop
    setTimeout(function(){
			//g.gain.setTargetAtTime(0, 0, 0.01);
			g.gain.value = 0;
    }, playTime + note.durationMs - 10);

    // kill oscillator shortly after
    setTimeout(function(){
    	o.stop(0);
	    o = null;
	    g = null;
    }, playTime + note.durationMs * 1.5);
  }



	return Bleep;
})();
