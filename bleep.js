window.Bleep = (function() {

  function Bleep(){};
  Bleep.version = "0.0.1";

  // AudioContext instance used for sound generation
  context = new window.AudioContext;

  // Event parent object
  function Event(){
    this.duration;
    this.volume;
  }
  
  // Event Object for rests, pauses in music playback
  function RestEvent(duration){
    this.duration = duration;
    this.volume = 0;
  }

  // Event Object for notes in music playback
  function NoteEvent(HzNote,duration){
    this.HzNote = HzNote;
    this.duration = duration;
    this.volume = 1;
  }

  // Event Object for setting adjustment
  function SettingEvent(name,val){
    this.settingName = name;
    this.settingVal = val;
  }

  // Define inheritance and constructors
  RestEvent.prototype = new Event();
  NoteEvent.prototype = new Event();
  SettingEvent.prototype = new Event();
  RestEvent.prototype.constructor = RestEvent;
  NoteEvent.prototype.constructor = NoteEvent;
  SettingEvent.prototype.constructor = SettingEvent;

  var Settings = Bleep.settings = {
    bpm: 90,
    default_note_length: 16,
    waveform: "sine",
    master_volume: 1
  };


  // Queue for handling events
  var events = Bleep.events = [];
  var timeoutFunctions = [];

  var clearTimeoutFunctions = function(){
    for (var i = 0; i < timeoutFunctions.length; i++){
      clearTimeout(timeoutFunctions[i]);
    }
  }


  // Play a tone
  // note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  // octave is in MIDI standard, 0-8
  Bleep.tone = function(note, duration, octave){
    if (typeof duration === 'undefined'){
      duration = Settings["default_note_length"];
    }
    // Handle rest
    if (note.charAt(0) === 'R'){
      Bleep.rest(note.charAt(1));
      return;
    }
    var HzNote = stringToHzNote(note, octave);
    
    var note = new NoteEvent(HzNote,duration);
    events.push(note);

    console.log("Pushed note to queue: ");
    console.log(note);
  }

  // Play silence for a given duration.
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(arg){
    duration = Bleep.__restArgToDuration(arg);
    var rest = new RestEvent(duration);
    events.push(rest);

    console.log("Pushed rest to queue: ");
    console.log(rest);
  }

  // Begin processing event queue. Schedule notes and rests. 
  Bleep.start = function(){
    // Stop any pending sounds from last call to start()
    clearTimeoutFunctions();

    var playTime = 0;
    var e;

    while(events.length > 0){
      e = events.shift();
      console.log("event:");
      console.log(e);
      if (e.isClass("SettingEvent")){
        Settings[e.settingName] = e.settingVal;
        continue;
      }

      var duration = Bleep.__durationToMs(e.duration);
      var o = context.createOscillator();
      var g = context.createGain();
      o.type = Settings["waveform"];
      e.volume = Bleep.__setVolumeForWaveformType(o,e);
      o.connect(g);
      g.connect(context.destination);
      g.gain.value = 0;
      o.frequency.value = parseFloat(e.HzNote); 
      o.start(0);

      console.log(g);
      Bleep.__playNote(e,playTime,o,g,duration);

      playTime += duration;
    }
  }

  // Play a note from the event queue
  Bleep.__playNote = function(note, startTime, o, g, duration, master_volume){
    var t1 = setTimeout(function(){
      console.log(duration);
      g.gain.value = note.volume;
    }, startTime);

    // end note early to prevent pop
    setTimeout(function(){
      g.gain.value = 0;
      g = null;
      o = null;
    }, startTime + duration - 10);

    // store setTimeout functions to allow clearing
    timeoutFunctions.push(t1);
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

  Bleep.__restArgToDuration = function(arg){
    if (typeof arg === 'undefined'){
      return Settings["default_note_length"];
    }
    else if (typeof arg === "number"){
      return Number(arg);
    }
    else if (arg.charAt(0) === 'R'){
      return Number(arg.charAt(1));
    }
    else {
      throw "Invalid rest parameter"
    }
  }

  Bleep.setbpm = function(val){
    
    var e = new SettingEvent("bpm",val);

    events.push(e);
    console.log("Pushed bpm event to queue:");
    console.log(e);
  }

  Bleep.setWaveform = function(s){
    var e = new SettingEvent("waveform",s);
    events.push(e);
    console.log("Pushed waveform event to queue:");
    console.log(e);
  }

  Bleep.bloop = function(notes){
    var notes_remaining, root_note,scale,note_val, note;
    if (typeof notes === 'undefined'){
      notes = 6;
    }
    notes_remaining = notes;
    root_note = getRandomArbitrary(0,12);
    scale = getMinorScale(root_note);

  while(notes_remaining > 0){
    note = new NoteEvent();
    if ((notes_remaining > 1) && notes_remaining !== notes){
      note_val = scale[getRandomArbitrary(0,scale.length)];
      note.HzNote = StepsToHzNote(halfStepsFromA(note_val,4));
    }
    else{
      note.HzNote = StepsToHzNote(halfStepsFromA(root_note,4));
    }
      note.duration = 32;
      note.volume = 1;

      events.push(note);
      console.log("Pushed bloop event to queue:");
      console.log(note);

      notes_remaining--;
    }
  }



  return Bleep;
}());
