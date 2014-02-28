context = new (window.AudioContext || window.webkitAudioContext);

window.Bleep = (function() {
	var Bleep = {};
	var Queue = {};

	Bleep.version = "0.0.1";

	var Settings = Bleep.settings = {
		waveform: "sine",
		bpm: 120
	};

	// note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
	// duration is in 32nd notes. 32 = 1 beat. 
	// octave is in MIDI standard, 0-8
	Bleep.tone = function(note, duration, octave){
		if (typeof duration === 'undefined'){
			duration = 32;
		}
		var HzNote = stringToHzNote(note, octave);
		
		var o = context.createOscillator();
		var g = context.createGainNode();
		currentTime = context.currentTime;

    o.frequency.value = parseFloat(HzNote); 
		o.connect(g);
    o.start(0);
		g.connect(context.destination);

		var waitTime =  duration * (Settings.bpm / 32);

		// fade note to prevent pop
    setTimeout(function(){
			g.gain.setTargetAtTime(0, 0, 0.01);
    }, waitTime);

    // kill oscillator shortly after
    setTimeout(function(){
    o.stop(0);
    }, waitTime * 1.5);

  }

  Bleep.start = function(){
  	playTime = 0;
  	while(this.queue.length > 0){
  		
  	}
  }

  Queue.prototype.playNote(){
		var waitTime =  duration * (Settings.bpm / 32);
  	setTimeout(function()){

  	}, time();
  }



	return Bleep;
})();
