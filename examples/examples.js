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

  $('.bloop-fn').click(function(){
    Bleep.bloop();
    Bleep.start();
  });

  $('.bloop-params-fn').click(function(){
    var params = {
      key: "C",           // default: "A"
      scale: "major",     // default: "minor"
      notes: 32,          // default: 8
      duration: 8,        // default: 16
      tempo: 90,          // default: 120
      octave: 4,          // default: 4
      octave_range: 2     // default: 1
    }

    Bleep.bloop(params);
  });

  $('.arp-fn').click(function(){
    var params = {
      direction: "down",  // default: "up"
    }

    Bleep.arp(params); 
    Bleep.start();
  });

  $('.tone-fn').click(function(){
    Bleep.tone("C4"); //Bleep.tone(note); // default duration: 16th note
    Bleep.tone("A#5",16); //Bleep.tone(note, duration);
    Bleep.tone("F", 2, 4); //Bleep.tone(note, duration, octave);
    Bleep.start();
  });


});