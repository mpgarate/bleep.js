var StepsToHzNote = function(half_steps){
	var value = Math.pow(1.059460646483, half_steps) * 440;
	console.log(value);
	return value;
}

var half_steps_from_a = function(note,octave){
	// Default to octave 4
	if (typeof octave === 'undefined'){
		octave = 0;
	}
	return note + (octave * 12);
}

var charToHzNote = function(s){
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

	// space out to #of half steps from A
	switch(i){
		case 0: i = 0; break; //A
		case 1: i = 2; break; //B
		case 2: i = 3; break; //C
		case 3: i = 5; break; //D
		case 4: i = 7; break; //E
		case 5: i = 8; break; //F
		case 6: i = 10; break; //G
	}

	return StepsToHzNote(half_steps_from_a(i));
}

var StringToHzNote = function(s){
	if(s === undefined){
		return null;
	}
	else if(s === ""){
		return null;
	}
	else if(s.length === 1){
		return charToHzNote(s);
	}

}