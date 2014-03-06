window.Bleep = (function() {

  function Bleep(){};
  Bleep.version = "0.0.1";

  // AudioContext instance used for sound generation
  context = new window.AudioContext;

  // Event parent object
  function Event(){
    this.note_length;
  }
  
  // Event Object for rests, pauses in music playback
  function RestEvent(note_length){
    this.note_length = note_length;
    this.volume = 0;
    this.o;
    this.g;
  }

  // Event Object for notes in music playback
  function NoteEvent(HzNote,note_length){
    this.HzNote = HzNote;
    this.note_length = note_length;
    this.volume = 1;
    this.o;
    this.g;
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
  // note_length: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  // octave is in MIDI standard, 0-8
  Bleep.tone = function(noteString, note_length, octave){
    if (typeof note_length === 'undefined'){
      note_length = Settings.default_note_length;
    }
    // Handle rest
    if (noteString.charAt(0) === 'R'){
      Bleep.rest(noteString);
      return;
    }
    var HzNote = stringToHzNote(noteString, octave);
    
    var note = new NoteEvent(HzNote,note_length);
    events.push(note);

    console.log("Pushed note to queue: " + noteString);
    console.log(note);
  }

  // Play silence for a given duration.
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(restString){
    rest_note_length = Bleep.__restArgToDuration(restString);
    var rest = new RestEvent(rest_note_length);
    events.push(rest);

    console.log("Pushed rest to queue: " + restString);
    console.log(rest);
  }

function handleEvent(e){
  // play this event
  e.g.gain.value = e.volume;

  // schedule its end
  setTimeout(function(){
    e.g.gain.value = 0;
  }, e.duration - 10);


  console.log("handling event:");
  console.log(e);

  // if last event, nothing to do
  if (events.length === 0){
    return;
  }

  // events[0] is the next event in queue


  var next_event = prepareNextEvent();

  // call self with the next in queue
  setTimeout(function(){
    console.log("calling handleEvent on ");
    console.log(next_event);
    handleEvent(next_event);
  }, e.duration);
}

function prepareNextEvent(){
  // set up next event
  var e = events.shift();

  if (e.constructor.name === "SettingEvent"){
    // update value
    Settings[e.settingName] = e.settingVal;
    console.log("made setting " + e.settingName + " : " + Settings[e.settingName]);
    // recurse
    return prepareNextEvent();
  }

  e.g = context.createGain();
  e.g.connect(context.destination);
  e.g.gain.value = 0;

  e.o = context.createOscillator();
  e.o.type = Settings.waveform;
  e.o.frequency.value = parseFloat(e.HzNote); 
  e.o.connect(e.g);
  e.o.start(0);

  e.duration = Bleep.__noteLengthToMs(e.note_length);
  e.volume = Bleep.__setVolumeForWaveformType(e.o,e);


  return e;
}

Bleep.start = function(){
  // Stop any pending sounds from last call to start()
  // Bleep.stop();

  var playTime = 0;
  var e = prepareNextEvent();
  handleEvent(e);
}


/*
  // Begin processing event queue. Schedule notes and rests. 
  Bleep.start = function(){
    // Stop any pending sounds from last call to start()
    Bleep.stop();

    var playTime = 0;
    var e;

    while(events.length > 0){
      e = events.shift();
      console.log("event:");
      console.log(e);
      if (e.constructor.name === "SettingEvent"){
        Settings[e.settingName] = e.settingVal;
        console.log("made setting " + e.settingName + " : " + Settings[e.settingName]);
        continue;
      }

      var duration = Bleep.__noteLengthToMs(e.note_length);
      var o = context.createOscillator();
      var g = context.createGain();
      o.type = Settings.waveform;
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

  Bleep.stop = function(){
    clearTimeoutFunctions();
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
*/
  // Convert a duration to ms using current BPM
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.__noteLengthToMs = function(d){
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
      return Settings.default_note_length;
    }
    else if (typeof arg === "number"){
      return Number(arg);
    }
    else if (arg.charAt(0) === 'R'){
      if (arg.length === 3 ){
        return arg.substring(1,3);
      }
      else{
        return Number(arg.charAt(1));
      }
    }
    else {
      throw "Invalid rest parameter: " + arg
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

  Bleep.bloop = function(params){
    var scale, note_val, note, octave, HzNote;
    params = setBloopParams(params);

    Bleep.setbpm(params.bpm);

    scale = getScale(params.scale_type,params.root_note);

    for (var i = 0; i < params.notes; i++){
      if (i < params.notes - 1){
        note_val = scale[getRandomArbitrary(0,scale.length)];
        octave = params.octave + getRandomArbitrary(0,params.octave_range);
        HzNote = StepsToHzNote(halfStepsFromA(note_val,octave));
      }
      // Always end on the root note of the scale
      else{
        HzNote = StepsToHzNote(halfStepsFromA(params.root_note,4));
      }
      
      note = new NoteEvent(HzNote, params.note_length);

      events.push(note);
    }
  }

  function setBloopParams(params){
    // default params
    var dp = {
      root_note: getRandomArbitrary(0,12),
      notes: 6,
      scale_type: "minor",
      note_length: 32,
      bpm: Settings.bpm,
      octave_range: 1,
      octave: 4
    }

    return setFooParams(params,dp);
  }

  Bleep.arp = function(params){
    var note_val, note, octave, HzNote, direction_val, scale;
    var change_octave_at;

    params = setArpParams(params);

    Bleep.setbpm(params.bpm);

    params.scale = getScale(params.scale_type,params.root_note);

    octave = params.octave;
    scale = params.scale;

    if(params.direction === "up"){
      direction_val = 1;
      last_note_in_octave = 0;
    }
    else{
      direction_val = -1;
      last_note_in_octave = scale.length -1;
    }

    for (var i = 0; i < params.notes; i++){
      note_val = scale[getNextNote(i, params)];

      if (note_val === scale[last_note_in_octave]){
        if (octave - params.octave > (params.octave_range - 1)){
          console.log("resetting octave");
          octave = params.octave;
        }
        else{
          octave += direction_val;
        }
      }

      HzNote = StepsToHzNote(halfStepsFromA(note_val,octave));

      note = new NoteEvent(HzNote, params.note_length);
      events.push(note);
    }
  }

  function getNextNote(i, params){
    var scale_length = params.scale.length;

    if(params.direction === "up"){
      return (i + 1) % scale_length;
    }
    else {
      return (params.notes - i) % scale_length;
    }
  }

  function setArpParams(params){
    // default params
    var dp = {
      root_note: "A",
      notes: 20,
      scale_type: "minor",
      note_length: 32,
      bpm: Settings.bpm,
      octave_range: 1,
      octave: 4,
      direction: "up"
    }

    return setFooParams(params, dp);
  }

  function setFooParams(params,dp){
    if (typeof params === 'undefined'){
      var params;
    }

    // replace default params with any user-defined
    for(var p in params){
      dp[p] = params[p];
    }

    // convert root note from string to steps
    if(typeof dp.root_note === "string"){
      dp.root_note = stringToStepsFromA(dp.root_note)
    }

    return dp;
  }

  Bleep.sequence = function(seq){
    for(var n in seq){
      var note = seq[n];
      if (note.constructor.name === 'Array'){
        Bleep.tone(note[0],note[1],note[2]);
      }
      else{
        Bleep.tone(note);
      }
    }
  }


  return Bleep;
}());
