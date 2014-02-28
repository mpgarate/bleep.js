context = new webkitAudioContext(),

window.Bleep = (function() {
	var Bleep = {};

	Bleep.version = "0.0.1";

	var Settings = Bleep.settings = {
		waveform: "sine",
		bpm: 120
	};

	context = new webkitAudioContext(),
		o = context.createOscillator();
		o.connect(context.destination); // Connect to speakers
	//oscillator = context.createOscillator();
	//oscillator.connect(context.destination); // Connect to speakers
  //oscillator.frequency.value = 0; // in hertz
  //oscillator.noteOn(0);

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

		
		oscillator = context.createOscillator();
		oscillator.connect(context.destination); // Connect to speakers
    oscillator.frequency.value = parseFloat(StepsToHzNote(steps)); // in hertz
    oscillator.start(0); // Start generating sound immediately

    setTimeout(function(){
    	oscillator.stop(0);
    }, duration * (Settings.bpm / 32));
    o.disconnect(0);
  }

	return Bleep;
})();