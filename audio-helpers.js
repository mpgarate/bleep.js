var StepsToHzNote = function(halfSteps){
	var value = Math.pow(1.059460646483, halfSteps) * 440;
	console.log(value);
	return value;
}

var halfStepsFromA = function(note,octave){
	// Default to octave 4
	if (typeof octave === 'undefined'){
		octave = 0;
	}
	return note + (octave * 12);
}

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
	// refer to notes as in range 0-6 
	i -= 65;

	// space out to # of half steps from A
	switch(i){
		case 0: i = 0; break; //A
		case 1: i = 2; break; //B
		case 2: i = 3; break; //C
		case 3: i = 5; break; //D
		case 4: i = 7; break; //E
		case 5: i = 8; break; //F
		case 6: i = 10; break; //G
	}

	// adjust for sharp or flat note
	i += offset;

	return halfStepsFromA(i);
}

// offset handles sharp or flat
var StringToNoteIndex = function(s,offset){
	if(s === undefined){
		return null;
	}
	if(typeof offset === undefined){
		offset = 0;
	}
	else if(s === ""){
		return null;
	}
	else if(s.length === 1){
		return charToNoteIndex(s,offset);
	}

}


  var stringToSteps = function(s,octave){
		var offset = 0; // handle sharp or flat
		if (typeof s === 'undefined' || s === ''){
			s = 'A';
		}
		// set default or get octave from note string
		if (octave === 'undefined'){
			if (isNaN(s.charAt(s.length))){
				octave = 4;	
			}
			else{
				octave = s.charAt(s.length);
				s = s.split(s.length - 1);
			}
		}

		if(s.length > 1){
			var char1 = s.charAt(1);
			if(char1 === '#'){
				offset = 1;
			}
			else if (char1 === 'b'){
				offset = -1;
			}
		}

		console.log("s: " + s + " offset: " + offset + "oct: " + octave);

		var noteIndex = charToNoteIndex(s,offset);
		var steps = halfStepsFromA(noteIndex, octave);

		return steps;
  }