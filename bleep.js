context = new window.AudioContext;

window.Bleep = (function() {
  var Bleep = function(){};
  var Event = function(){};
  var eventQueue = [];

  Bleep.version = "0.0.1";

  var Settings = Bleep.settings = {
    waveform: "sine",
    bpm: 120,
    master_volume: 1
  };

  Event.prototype.HzNote;   // note in Hertz, ready for oscillator
  Event.prototype.duration; // duration
  Event.prototype.volume;
  Event.prototype.settingName;
  Event.prototype.settingVal;
  Event.prototype.isSetting;

  // Play a tone
  // note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  // octave is in MIDI standard, 0-8
  Bleep.tone = function(note, duration, octave){
    if (typeof duration === 'undefined'){
      duration = 16;
    }
    // Handle rest
    if (note.charAt(0) === 'R'){
      Bleep.rest(note.charAt(1));
      return;
    }
    var HzNote = stringToHzNote(note, octave);
    
    var note = new Event();
    note.HzNote = HzNote;
    //note.durationMs = ((duration * 32) / (Settings.bpm / 60));
    note.duration = duration;
    console.log("duration: " + note.duration);
    note.volume = 1; // will generate at gain = 1
    eventQueue.push(note);
  }

  // Play silence for a given duration.
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(duration){
    var rest = new Event();
    rest.HzNote = 0;
    rest.duration = duration;
    rest.volume = 0; // will generate at gain = 0
    eventQueue.push(rest);
  }

  // Begin processing event queue. Schedule notes and rests. 
  Bleep.start = function(){
    var playTime = 0;
    var e;

    while(eventQueue.length > 0){
      console.log("event:");
      console.log(e);
      e = eventQueue.shift();
      if (e.isSetting){
        Settings[e.settingName] = e.settingVal;
        continue;
      }

      var duration = Bleep.__durationToMs(e.duration);

      var o = context.createOscillator();
      var g = context.createGain();
      o.type = Settings["waveform"];
      e.volume = Bleep.__setVolumeForWaveformType(o,e);
      console.log("made note vol: " + e.volume)
      o.connect(g);
      g.connect(context.destination);
      g.gain.value = 0;
      o.frequency.value = parseFloat(e.HzNote); 
      o.start(0);

      Bleep.__playNote(e,playTime,o,g,duration);

      playTime += duration;
    }
  }

  // Play a note from the event queue
  Bleep.__playNote = function(note, startTime, o, g, duration, master_volume){
    setTimeout(function(){
      g.gain.value = note.volume;
      console.log("played at vol: " + note.volume);
    }, startTime);

    // fade note to prevent pop
    setTimeout(function(){
      g.gain.value = 0;
    }, startTime + duration - 10);

    // kill oscillator shortly after
    setTimeout(function(){
      o.stop(0);
      o = null;
      g = null;
    }, startTime + duration * 1.5);
  }

  // Convert a duration to ms using current BPM
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.__durationToMs = function(d){
    return ((60000) / (Settings.bpm * (d/4)));
  }

  // Adjust the volume for wave type variations
  Bleep.__setVolumeForWaveformType = function(o,e){
    switch(o.type){
      case "sine" : 
        return e.volume * 1;
      break;
      case "square":
        return e.volume * 0.3;
      break;
      case "sawtooth":
        return e.volume * 0.4;
      break;
      case "triangle":
        return e.volume * 0.8;
      break;
    }
  }

  Bleep.setbpm = function(val){
    var e = new Event();
    e.isSetting = true;
    e.volume = 0;
    e.duration = 0;
    e.settingName = "bpm";
    e.settingVal = val;
    eventQueue.push(e);
  }

  Bleep.setWaveform = function(s){
    var e = new Event();
    e.isSetting = true;
    e.volume = 0;
    e.duration = 0;
    e.settingName = "waveform";
    e.settingVal = s;
    eventQueue.push(e);
  }



  return Bleep;
})();
