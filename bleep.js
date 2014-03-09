window.Bleep = (function() {

  function Bleep(){};
  function EventQueue(){};
  EventQueue.prototype = new Array();
  EventQueue.prototype.doPush = function(o){
    var val = this.push(o);
    runCallbacks(OnListChangeFunctions);
    return val;
  }

  Bleep.version = "0.0.1";
  Bleep.liveEvents = new EventQueue();     // This queue is in active playback
  Bleep.pendingEvents = new EventQueue();  // This queue can be built during playback

  // Event parent object
  function Event(){};
  
  // Event Object for rests, pauses in music playback
  function RestEvent(noteLength){
    this.noteLength = noteLength;
    this.volume = 0;
    this.o;
    this.g;
  }

  // Event Object for notes in music playback
  function NoteEvent(HzNote,noteLength){
    this.HzNote = HzNote;
    this.noteLength = noteLength;
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

  SettingEvent.prototype.toString = function(){
    return "Setting: " + this.settingName.toString() + " = " +  this.settingVal.toString(); 
  }
  RestEvent.prototype.toString = function(){
    return "Rest: length: " +  this.noteLength.toString(); 
  }
  NoteEvent.prototype.toString = function(){
    var hz = Number(this.HzNote).toFixed(2).toString();
    return "Note: " +  hz + " Hz " + "length: " + this.noteLength.toString();
  }

  var Settings = Bleep.settings = {
    bpm: 90,
    defaultNoteLength: 16,
    waveform: "sine",
    masterVolume: 1
  };


  // AudioContext instance used for sound generation
  AC = new window.AudioContext;
  MASTER_GAIN = AC.createGain();
  MASTER_GAIN.connect(AC.destination);
  MASTER_GAIN.gain.value = Settings.masterVolume;

  // Queue for handling events
  var ACTIVE_NOTES = false;

  // Store callback functions to be triggered after note play
  var OnNoteFunctions = Bleep.onNoteFunctions = new Array();
  var OnListChangeFunctions = Bleep.onNoteFunctions = new Array();


  // Play a tone
  // note is a string like 'A' or 'B0' or 'C#4' or 'Db6'
  // noteLength: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  // octave is in MIDI standard, 0-8
  Bleep.tone = function(noteString, noteLength, octave){
    if (typeof noteLength === 'undefined'){
      noteLength = Settings.defaultNoteLength;
    }
    // Handle rest
    if (noteString.charAt(0) === 'R'){
      Bleep.rest(noteString);
      return;
    }
    var HzNote = stringToHzNote(noteString, octave);
    
    var note = new NoteEvent(HzNote,noteLength);
    Bleep.pendingEvents.doPush(note);

    console.log("Pushed note to queue: " + noteString);
    console.log(note);
  }

  // Play silence for a given duration.
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  Bleep.rest = function(restString){
    restNoteLength = restArgToDuration(restString);
    var rest = new RestEvent(restNoteLength);
    Bleep.pendingEvents.doPush(rest);

    console.log("Pushed rest to queue: " + restString);
    console.log(rest);
  }

  Bleep.onNoteEnd = function(fn){
    OnNoteFunctions.push(fn);
  }
  Bleep.onListChange = function(fn){
    OnListChangeFunctions.push(fn);
  }

  function runCallbacks(fns){
    for(var i = 0; i < fns.length; i++){
      fns[i]();
    }
  }

  function handleEvent(e){
    if (e === null){
      return;
    }
    else if (ACTIVE_NOTES === true){
      setTimeout(function(){
        handleEvent(e);
      },10);
    }
    else{
      handleEvent1(e);
    }
  }

  function handleEvent1(e){
    // play this event
    e.g.gain.value = e.volume;

    if (ACTIVE_NOTES === true){
      throw 'sync error';
    }

    ACTIVE_NOTES = true;

    // schedule its end
    setTimeout(function(){
      e.g.gain.value = 0;
      ACTIVE_NOTES = false;
    }, e.duration);

    var nextEvent = prepareNextEvent();
    if (nextEvent === null){
      setTimeout(function(){
        runCallbacks(OnNoteFunctions);
      }, e.duration - 2);
      return;
    }

    // call self with the next in queue
    setTimeout(function(){
      handleEvent(nextEvent);
    }, e.duration);
  }

  function prepareNextEvent(){
    if(Bleep.liveEvents.length === 0){
      return null;
    }

      runCallbacks(OnNoteFunctions);
    // set up next event
    var e = Bleep.liveEvents.shift();


    if (e.constructor.name === "SettingEvent"){
      // update value
      Settings[e.settingName] = e.settingVal;
      console.log("made setting " + e.settingName + " : " + Settings[e.settingName]);
      // recurse
      if(Bleep.liveEvents.length === 0){
        runCallbacks(OnNoteFunctions);
        return null;
      }
      return prepareNextEvent();
    }


    e.g = AC.createGain();
    e.g.connect(MASTER_GAIN);
    e.g.gain.value = 0;

    e.o = AC.createOscillator();
    e.o.type = Settings.waveform;
    e.o.frequency.value = parseFloat(e.HzNote); 
    e.o.connect(e.g);
    e.o.start(0);

    e.duration = noteLengthToMs(e.noteLength);
    e.volume = setVolumeForWaveformType(e.o,e);

    return e;
  }

  Bleep.stop = function(){
    Bleep.liveEvents = new EventQueue();
  }

  Bleep.start = function(){
    // Stop any pending sounds from last call to start()
    if (ACTIVE_NOTES === true){
      Bleep.stop();
      setTimeout(function(){
        Bleep.start();
      },20);
    }
    else{
      Bleep.liveEvents = Bleep.pendingEvents;
      Bleep.pendingEvents = new EventQueue();

      var e = prepareNextEvent();
      if (e === null){
        return false;
      }
      else{
        handleEvent(e);
      }
    }
  }

  // Convert a duration to ms using current BPM
  // duration: 1 = 1 beat. 1 = 1/2 note. 4 = 1/4 note. 8 = 1/8 note
  noteLengthToMs = function(d){
    return ((60000) / (Settings.bpm * (d/4)));
  }

  // Adjust the volume for wave type variations
  setVolumeForWaveformType = function(o,e){
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

  restArgToDuration = function(arg){
    if (typeof arg === 'undefined'){
      return Settings.defaultNoteLength;
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

    Bleep.pendingEvents.doPush(e);
    console.log("Pushed bpm event to queue:");
    console.log(e);
  }

  Bleep.setWaveform = function(s){
    var e = new SettingEvent("waveform",s);
    Bleep.pendingEvents.doPush(e);
    console.log("Pushed waveform event to queue:");
    console.log(e);
  }

  Bleep.setMasterVolume = function(s){
    var e = new SettingEvent("masterVolume",parseFloat(s));
    Bleep.pendingEvents.doPush(e);
    console.log("Pushed masterVolume event to queue:");
    console.log(e);
  }

  Bleep.liveSetMasterVolume = function(v){
    v = parseFloat(v);
    Settings.masterVolume = v;
    MASTER_GAIN.gain.value = v;
  }

  // interval measured in half steps
  function getRandomInterval(){
    var chance = getRandomArbitrary(0,9);
    var interval;
    if(chance === 0){
      interval = 0;
    }
    // add two scale degrees (usually from root third)
    else if (chance < 3){
      interval = 2;
    }
    // add one scale degree
    else if (chance < 7){
      interval = 1;
    }
    else if (chance < 9){
      interval = 3;
    }
    else{
      interval = 4;
    }

    return interval;
  }

  function generateInterval(prevoiusInterval){
    if (prevoiusInterval === 0){
      prevoiusInterval = getRandomInterval();
    }
    var interval;
    var switchChance = getRandomArbitrary(0,9);
    var newIntervalChance = getRandomArbitrary(0,9);
    var directionChance = getRandomArbitrary(0,9);

    var direction = 1;
    if (prevoiusInterval < 0){
      var direction = -1; // 1 is up, -1 down
    }

    // 40% chance of switching to a different interval
    if (newIntervalChance > 5){
      interval = getRandomInterval();
    }
    else{
      interval = Math.abs(prevoiusInterval);
    }

    // 40% change of changing direction
    if (directionChance > 5){
      direction = (direction * -1);
    }

    console.log("made interval: " + interval + " direction: " + direction )
    return interval * direction;

  }

  Bleep.bloop = function(params){
    var scale, noteVal, note, octave, HzNote, previousNote, prevoiusInterval;
    params = setBloopParams(params);

    Bleep.setbpm(params.bpm);

    scale = getScale(params.scaleType,params.rootNote);

    for (var i = 0; i < params.notes; i++){
      if (i === 0){
        noteVal = scale[getRandomArbitrary(0,scale.length)];
        octave = params.octave + getRandomArbitrary(0,params.octaveRange);
        HzNote = StepsToHzNote(halfStepsFromA(noteVal,octave));

        interval = 0;
      }
      else if (i < params.notes - 1){
        var interval = generateInterval(prevoiusInterval);
        console.log("interval: " + interval + " previousNote: " + previousNote +  " newNote: " + (previousNote + interval));
        var scaleDegree = (previousNote + interval) % (scale.length - 1);
        console.log("scale degree is " + scaleDegree + " of " + scale.length);
        noteVal = scale[scaleDegree];
        octave = params.octave + getRandomArbitrary(0,params.octaveRange);
        HzNote = StepsToHzNote(halfStepsFromA(noteVal,octave));
      }
      // Always end on the root note of the scale
      else{
        console.log("root note")
        noteVal = halfStepsFromA(params.rootNote,4);
        HzNote = StepsToHzNote(noteVal);
      }
      
      note = new NoteEvent(HzNote, params.noteLength);
      Bleep.pendingEvents.doPush(note);


      prevoiusInterval = interval;
      previousNote = noteVal;
      console.log("made prevNote: " + previousNote);
    }
  }

  function setBloopParams(params){
    // default params
    var dp = {
      rootNote: getRandomArbitrary(0,12),
      notes: 6,
      scaleType: "minor",
      noteLength: 32,
      bpm: Settings.bpm,
      octaveRange: 1,
      octave: 4
    }

    return setFooParams(params,dp);
  }

  Bleep.arp = function(params){
    var noteVal, note, octave, HzNote, directionVal, scale;

    params = setArpParams(params);

    Bleep.setbpm(params.bpm);

    params.scale = getScale(params.scaleType,params.rootNote);

    octave = params.octave;
    scale = params.scale;

    if(params.direction === "up"){
      directionVal = 1;
      lastNoteInOctave = 0;
    }
    else{
      directionVal = -1;
      lastNoteInOctave = scale.length -1;
    }

    for (var i = 0; i < params.notes; i++){
      noteVal = scale[getNextNote(i, params)];

      if (noteVal === scale[lastNoteInOctave]){
        if (octave - params.octave > (params.octaveRange - 1)){
          console.log("resetting octave");
          octave = params.octave;
        }
        else{
          octave += directionVal;
        }
      }

      HzNote = StepsToHzNote(halfStepsFromA(noteVal,octave));

      note = new NoteEvent(HzNote, params.noteLength);
      Bleep.pendingEvents.doPush(note);
    }
  }

  function getNextNote(i, params){
    var scaleLength = params.scale.length;

    if(params.direction === "up"){
      return (i + 1) % scaleLength;
    }
    else {
      return (params.notes - i) % scaleLength;
    }
  }

  function setArpParams(params){
    // default params
    var dp = {
      rootNote: "A",
      notes: 20,
      scaleType: "minor",
      noteLength: 32,
      bpm: Settings.bpm,
      octaveRange: 1,
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
    if(typeof dp.rootNote === "string"){
      dp.rootNote = stringToStepsFromA(dp.rootNote)
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

  Bleep.getEvents = function(){
    if (Bleep.liveEvents.length === 0){
      return Bleep.pendingEvents;
    }
    else{
      return Bleep.liveEvents;
    }
  }


  return Bleep;
}());
