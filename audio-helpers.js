// Convert a signed integer distance from A in half steps
// to a Hz value suitable for an oscillator
var StepsToHzNote = function(halfSteps){
  var value = Math.pow(1.059460646483, halfSteps) * 440;
  return value;
}

// Calculate how far a note is from A4 (440Hz)
var halfStepsFromA = function(noteIndex,octave){
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
var charToNoteIndex = function(s, offset){
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
var stringToStepsFromA = function(s,octave){
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
  console.log("getting wrapped " + index + " in " + max);
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
