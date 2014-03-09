var Bleep = (function() {
  "use strict";

  function Bleep(){};

  Bleep.version = "0.0.1";

  var Settings = Bleep.settings = {
    bpm: 90,
    defaultNoteLength: 16,
    waveform: "sine",
    masterVolume: 1
  };

  /***** Event Queue *****/

  function EventQueue(){};

  EventQueue.prototype = [];

  EventQueue.prototype.doPush = function(o){
    var val = this.push(o);
    runCallbacks(OnListChangeFunctions);
    return val;
  };

  Bleep.liveEvents = new EventQueue();     // Queue in active playback
  Bleep.pendingEvents = new EventQueue();  // Queue to be built for playback




  /***** Event Classes *****/

  // Event parent object
  function Event(){};
  
  // Event Object for rests, pauses in music playback
  function RestEvent(noteLength){
    this.noteLength = noteLength;
    this.volume = 0;
    this.o = null; // will contain an oscillator
    this.g = null; // will contain a gain node
  }

  // Event Object for notes in music playback
  function NoteEvent(HzNote,noteLength){
    this.HzNote = HzNote;
    this.noteLength = noteLength;
    this.volume = 1;
    this.o = null; // will contain an oscillator
    this.g = null; // will contain a gain node
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


  // Customize toString() methods
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


  /***** Initialize Audio Context *****/


  // AudioContext instance used for sound generation
  var AC = new window.AudioContext;
  // Create and set master volume node
  var MasterGain = AC.createGain();
  MasterGain.connect(AC.destination);
  MasterGain.gain.value = Settings.masterVolume;

  // Are any notes currently playing?
  var ACTIVE_NOTES = false;


  /***** Callback Functions *****/

  var OnNoteFunctions = Bleep.onNoteFunctions = [];
  var OnListChangeFunctions = Bleep.onNoteFunctions = [];


  /**************************************/
  /***** Bleep Primary User Methods *****/
  /**************************************/

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
    var restNoteLength = restArgToDuration(restString);
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
    e.g.connect(MasterGain);
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
  function noteLengthToMs(d){
    return ((60000) / (Settings.bpm * (d/4)));
  }

  // Adjust the volume for wave type variations
  function setVolumeForWaveformType(o,e){
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

  function restArgToDuration(arg){
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
    MasterGain.gain.value = v;
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
    var noteVal, note, octave, HzNote, directionVal, scale, lastNoteInOctave;

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



  /********************************/
  /***** Audio Helper Methods *****/
  /********************************/

  // Convert a signed integer distance from A in half steps
// to a Hz value suitable for an oscillator
function StepsToHzNote(halfSteps){
  var value = Math.pow(1.059460646483, halfSteps) * 440;
  return value;
}

// Calculate how far a note is from A4 (440Hz)
function halfStepsFromA(noteIndex,octave){
  // Convert octave value
  // MIDI octave 4 is octave 0
  octave = octave - 4;

  // Default to octave 0 (where you find middle C)
  if (typeof octave === 'undefined'){
    octave = 0;
  }
  return noteIndex + (octave * 12);
}

// Convert an ASCII character and # or b into
// a 0-11 note value. This note does not specify
// an octave.
function charToNoteIndex(s, offset){
  // Get ASCII value of char
  var i = s.charCodeAt(0);

  // make musical letters uppercase
  if (i < 104 && i > 96){
    i -= 32;
  }
  // not a musical letter
  else if(i < 65 || i > 71){
    return null;
  }
  // refer to letter notes as in range 0-6 
  i -= 65;

  // space out to # of half steps from A
  switch(i){
    case 0: i = 0; break;  // A
    // skip                   A#
    case 1: i = 2; break;  // B
    case 2: i = 3; break;  // C
    // skip                   C#
    case 3: i = 5; break;  // D
    // skip                   D#
    case 4: i = 7; break;  // E
    case 5: i = 8; break;  // F
    // skip                   F#
    case 6: i = 10; break; // G
    // skip                   G#
  }

  // adjust for sharp or flat note
  i += offset;

  return i;
}

// Parse an input string like 'A' or 'B0'
// or 'C#4' or 'Db6' into a distance from A in half steps
function stringToStepsFromA(s,octave){
  var offset = 0, steps, HzNote; // handle sharp or flat
  if (typeof s === 'undefined' || s === ''){
    s = 'A';
  }
  // set default or get octave from note string
  if (typeof octave === 'undefined'){
    if (isNaN(s.charAt(s.length-1))){
      octave = 4; 
    }
    else{
      octave = s.charAt(s.length -1);
      s = s.substr(0,s.length - 1);
    }
  }

  if(s.length > 1){
    var char1 = s.charAt(1);
    if(char1 === '#'){
      offset = 1;
      s = s.substr(0,1);
    }
    else if (char1 === 'b'){
      offset = -1;
      s = s.substr(0,1);
    }
  }

  var noteIndex = charToNoteIndex(s,offset);
  var steps = halfStepsFromA(noteIndex, octave);
  return steps;
}
// into a HzNote suitable
// for an oscillator object
function stringToHzNote(s,octave){
  return StepsToHzNote(stringToStepsFromA(s,octave));
}

// Returns a random number between min and max
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getWrapped(index,max){
  if(index > max){
    index -= max;
  }
  else if (index < 0){
    index = max % index;
  }
  return index;
}

function getScale(type,root){
  var types = {
    "minor": [0,2,3,5,7,8,10],
    "major": [0,2,4,5,7,9,10],
    "pentatonic": [0,3,5,7,10],
    "blues": [0,3,5,6,7,10]
  }
  console.log(type);
  var scale = types[type];

  for(var i = 0; i < scale.length; i++){
    scale[i] = getWrapped((scale[i] + root), 11);
  }

  return scale;
}


  return Bleep;
}());
