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

  $('.bloop').click(function(){
    Bleep.bloop();
    Bleep.start();
  });
  $('.bloop-8').click(function(){
    Bleep.bloop(8);
    Bleep.start();
  });
  $('.arp').click(function(){
    //Bleep.arp("C", "Minor", 32, 120); 
    //Bleep.start();
  });
  $('.tone-rest').click(function(){
    Bleep.tone("C4"); //Bleep.tone(note); // default duration: 16th noteBleep.rest(8); // will rest for length of 8th note
    Bleep.rest(1); // will rest for length of whole note
    Bleep.rest("R16"); // alternate syntax for 8th note
    Bleep.tone("A#2",16); //Bleep.tone(note, duration);
    Bleep.rest("R32"); // alternate syntax for whole note
    Bleep.tone("C", 2, 4); //Bleep.tone(note, duration, octave);
    Bleep.start();
  });

});