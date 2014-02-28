$( document ).ready(function() {
    var context = new webkitAudioContext(),
    oscillator = context.createOscillator();
    oscillator.connect(context.destination); // Connect to speakers
    var PITCH = 0;

	$(".start-tone").click(function(){
    oscillator.start(0); // Start generating sound immediately
    oscillator.frequency.value = StringToHzNote("D"); // in hertz
	});

	  $(".inc-tone").click(function(){
	    PITCH +=1;
	    oscillator.frequency.value = StringToHzNote("C"); // in hertz
	  });
	  $(".dec-tone").click(function(){
	    PITCH -=1;
	    oscillator.frequency.value = StepsToHzNote(PITCH); // in hertz
	  });

  $(".stop").click(function(){
    oscillator.stop(0); // Start generating sound immediately
  });

  console.log(StepsToHzNote(1));
});