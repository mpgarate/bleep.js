$( document ).ready(function() {

  var slider = $('#slider');
  slider.slider({
    range:"min",
    value: 35,
    slide: function(event, ui) {   
      var value = slider.slider('value');
      value = parseFloat(value/100);
      Bleep.liveSetMasterVolume(value);
    },
  });


  Bleep.liveSetMasterVolume(slider.slider('value') / 100);

    $( "#slider" ).slider();  

  function showQueue(){
    var list = $('.list-group');

    list.html("");

    var events = Bleep.getEvents();

    for (var i = 0; i < events.length; i++){
      list.append('<li class="list-group-item">' + events[i].toString() + '</li>');
    }
    if(events.length === 0){
      list.append('<li class="list-group-item">Event queue is empty. </li>');
    }
  }


  Bleep.onListChange(function(){
    showQueue();
  });
  Bleep.onNoteEnd(function(){
    showQueue();
  });

  $('.bloop-fn').click(function(){
    Bleep.bloop();
    Bleep.start();
  });

  $('.bloop-saw').click(function(){
    Bleep.setWaveform("sawtooth"); // indicate sine, sqaure, sawtooth, or triangle
    Bleep.bloop();
    Bleep.setWaveform("sine");     // reset the waveform for future use of Bleep 
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


  $('.roll').click(function(){
    Bleep.roll();
    Bleep.start();
  });

  $('.enqueue-note').click(function(){
    var note = $('.note-select').val();
    var length = $('.length-select').val();
    var octave = $('.octave-select').val();

    if (typeof note == 'undefined'){
      return;
    }

    if (typeof length == 'undefined'){
      return;
    }

    length = Number(length);
    //length = 1 / length

    console.log("note:" + note + " length:" + length);

    if (note == 'R'){
      Bleep.rest(length);
    }
    else{
      Bleep.tone(note,length,octave);
    }

  });

  $('.start').click(function(){
    Bleep.start();
  });

});