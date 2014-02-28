$( document ).ready(function() { /*
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
  */

/*
    Bleep.tone("A4");
    Bleep.tone("A4");
    Bleep.setbpm(60);
    Bleep.tone("A4");
    Bleep.tone("A4");
    Bleep.setbpm(120);
    Bleep.tone("C4");
    Bleep.tone("D4");
    Bleep.setbpm(60);
    Bleep.tone("F4");
    Bleep.tone("C4");
    Bleep.setbpm(120);
    Bleep.tone("G4");
    Bleep.tone("E4");
    Bleep.setbpm(60);
    Bleep.tone("B4");
    Bleep.tone("C4");
    Bleep.tone("A4");
*/

  $('.start-tone').click(function(){
    Bleep.setbpm(120);
    Bleep.setWaveform("sine");
    Bleep.tone("A4");
    Bleep.tone("A4");
    Bleep.setWaveform("square");
    Bleep.setbpm(60);
    Bleep.tone("A4");
    Bleep.tone("A4");
    Bleep.setWaveform("sawtooth");
    Bleep.setbpm(120);
    Bleep.tone("C4");
    Bleep.tone("D4");
    Bleep.setWaveform("triangle");
    Bleep.setbpm(60);
    Bleep.tone("F4");
    Bleep.tone("C4");
    Bleep.setWaveform("sawtooth");
    Bleep.setbpm(120);
    Bleep.tone("G4");
    Bleep.tone("E4");
    Bleep.setWaveform("square");
    Bleep.setbpm(60);
    Bleep.tone("B4");
    Bleep.tone("C4");
    Bleep.tone("A4");
    Bleep.start();

  });

  $('.note-link').click(function(){
    var note = $(this).text();

    console.log(note);
    Bleep.tone(note);
    Bleep.start();
  });
});