context = new (window.AudioContext || window.webkitAudioContext);

window.Bleep = (function() {
	var Bleep = {};

	Bleep.version = "0.0.1";

	var Settings = Bleep.settings = {
		waveform: "sine",
		bpm: 120
	};

	// note is a string like 'A' or 'A0'
	// duration is in 32nd notes. 32 = 1 beat. 
	// octave is MIDI standard
	Bleep.tone = function(note, duration, octave){
		var offset = 0; // handle sharp or flat
		if (typeof note === 'undefined'){
			note = 'A';
		}
		if (typeof duration === 'undefined'){
			duration = 32;
		}
		if (octave === 'undefined'){
			// set default or get octave from note
			if (!isNaN(note.charAt(note.length))){
				octave = 4;	
			}
			else{
				octave = note.charAt(note.length);
				note = note.split(note.length -1);
			}
		}

		if(note.length > 1){
			var lastChar = note.charAt(note.length);
			if(lastChar === '#'){
				offset = 1;
				note = note.split(note.length -1);
			}
			else if (lastChar === 'b'){
				offset = -1;
				note = note.split(note.length -1);
			}
		}

		var note_index = StringToNoteIndex(note,offset);
		var steps = half_steps_from_a(note_index, octave);

		
		var oscillator = context.createOscillator();
		var g = context.createGainNode();
		currentTime = context.currentTime;

		//oscillator.connect(context.destination); // Connect to speakers
    oscillator.frequency.value = parseFloat(StepsToHzNote(steps)); // in hertz
		oscillator.connect(g);
    oscillator.start(0); // Start generating sound immediately
		g.connect(context.destination);


		var waitTime =  duration * (Settings.bpm / 32);
    setTimeout(function(){
			g.gain.setTargetAtTime(0, 0, 0.01);
    }, waitTime);
    setTimeout(function(){
    oscillator.stop(0);
    }, waitTime * 1.5);
  }

	return Bleep;
})();