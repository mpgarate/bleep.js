context = new window.AudioContext;

window.Bleep = (function() {
  var Bleep = function(){};
  var Event = function(){};
  var eventQueue = [];

  Bleep.version = "0.0.1";

  var Settings = Bleep.settings = {
    waveform: "sine",
    bpm: 120
  };

  Event.prototype.HzNote;   // note in Hertz, ready for oscillator
  Event.prototype.duration; // duration
  Event.prototype.isNote;
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
    var HzNote = stringToHzNote(note, octave);
    
    var note = new Event();
    note.HzNote = HzNote;
    //note.durationMs = ((duration * 32) / (Settings.bpm / 60));
    note.duration = duration;
    console.log("duration: " + note.duration);
    note.isNote = 1; // will generate at gain = 1
    eventQueue.push(note);
  }

  // Play silence for a given duration.
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(duration){
    var rest = new Event();
    rest.HzNote = 0;
    rest.duration = duration;
    rest.isNote = 0; // will generate at gain = 0
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
        //Bleep.__updateSetting(e,playTime);
        Settings[e.settingName] = e.settingVal;
        continue;
      }

      var duration = Bleep.__durationToMs(e.duration);

      var o = context.createOscillator();
      var g = context.createGain();
      o.type = Settings["waveform"];
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
  Bleep.__playNote = function(note, startTime, o, g, duration){
    setTimeout(function(){
      g.gain.value = note.isNote; // 0 or 1
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

  // Update a setting from a scheduled event
  Bleep.__updateSetting = function(e,time){
    setTimeout(function(){
      Settings[e.settingName] = e.settingVal;
      console.log("updated setting");
      console.log(Settings);
    },0);
  }

  Bleep.setbpm = function(val){
    var e = new Event();
    e.isSetting = true;
    e.isNote = 0;
    e.duration = 0;
    e.settingName = "bpm";
    e.settingVal = val;
    eventQueue.push(e);
  }

  Bleep.setWaveform = function(s){
    var e = new Event();
    e.isSetting = true;
    e.isNote = 0;
    e.duration = 0;
    e.settingName = "waveform";
    e.settingVal = s;
    eventQueue.push(e);
  }



  return Bleep;
})();
