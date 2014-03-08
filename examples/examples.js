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

  var slider = $('#slider');
  slider.slider({
    range:"min",
    value: 60,
    slide: function(event, ui) {   
      var value = slider.slider('value');
      value = parseFloat(value/100);
      Bleep.liveSetMasterVolume(value);
    }
  });


    $( "#slider" ).slider();  

  function show_queue(){
    var list = $('.list-group');

    list.html("");

    var events = Bleep.pendingEvents;

    for (var i = 0; i < events.length; i++){
      list.append('<li class="list-group-item">' + (Number(events[i].HzNote)).toFixed(2) + '</li>');
    }
  }

  $('.bloop-fn').click(function(){
    Bleep.bloop();
    show_queue();
    Bleep.start();
  });

  $('.bloop-saw').click(function(){
    Bleep.setWaveform("sawtooth"); // indicate sine, sqaure, sawtooth, or triangle
    Bleep.bloop();
    Bleep.start();
  });

  $('.stop').click(function(){
    Bleep.stop();
  });

  $('.bloop-params-fn').click(function(){
    var params = {
      rootNote: "C",
      scaleType: "blues",     // options: "minor" (default), "major", "pentatonic", "blues"
      notes: 32,          // default: 8
      noteLength: 8,        // default: 32
      bpm: 90,          // default: 120
      octave: 3,          // default: 4
      octaveRange: 2     // default: 1
    }

    Bleep.bloop(params);
    Bleep.start();
  });

  $('.arp-fn').click(function(){
    var params = {
      direction: "down"  // default: "up"
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


  $('.seq-fn').click(function(){
    // Formatted to one quarter measure per line
    var mySequence = [
      "A4", "A5", "A4", "A5", // Four 16th notes
      "R4",                   // rest for a quarter measure
      "R8",       ["C4", 8],  // 8th rest and an eighth note
      ["E4", 4]               // One quarter note
    ]
    Bleep.sequence(mySequence);
    Bleep.start();
  });

  $('.mary-lamb').click(function(){
    var lambSeq = [
      "E", "D", "C", "D",
      "E", "E", "E", "R16",
      "D", "D", "D", "R16",
      "E", "G", "G"
      ]
    Bleep.sequence(lambSeq);
    Bleep.start();
  });


});