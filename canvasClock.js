//
// Extending the canvas clock from w3schools.com
// 
// canvasClock.js
// enhancements with sound and color
// Mike Sult 2017
//
// 1. background color changes every minute
// 2. an interval plays at 5 minute intervals after the hour
// 3. on the hour: bell toll plays: number of gongs = hour
// 4. Alarm: a wholetone scale figure plays repeatedly for 1 minute at the alarm time.
// 5. mute checkbox for hour chime
// 6. mute checkbox for five minute chime
//
//-----------------------------------------------------------------
// BEGIN w3schools Clock  Code ------------------------------------
//-----------------------------------------------------------------
var canvas = document.getElementById("clockCanvas");
var ctx = canvas.getContext("2d");
var radius = (canvas.height / 2)*0.90;
ctx.translate(radius, radius);
radius = radius * 0.90

var secondHandLength = radius*0.9;
var secondHandWidth = radius*0.01;
var minuteHandLength = radius*0.8;
var minuteHandWidth = radius*0.04;
var hourHandLength = radius*0.5;
var hourHandWidth = radius*0.07;

setInterval(drawClock, 1000);
createAlarmField();
createVolumeMenu();

function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
  drawDigitalTime(ctx, radius); // MS enhancement
}

function drawFace(ctx, radius) {
  var grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius*0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  var ang;
  var num;
  ctx.font = radius*0.25 + "px arial";
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  ctx.fillStyle = myColor;
  for(num = 1; num < 13; num++){
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.82);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.82);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius){
//    var now = new Date(debugDates[debugIndex]);
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    //hour
    hour=hour%12;
    
    hour=(hour*Math.PI/6)+
    (minute*Math.PI/(6*60))+
    (second*Math.PI/(360*60));
    drawHand(ctx, hour, hourHandLength, hourHandWidth);
    //minute
    minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, minuteHandLength, minuteHandWidth);
    // second
    second=(second*Math.PI/30);
    drawHand(ctx, second, secondHandLength, secondHandWidth);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}
//-----------------------------------------------------------------
//   END w3schools Clock  Code ------------------------------------
//-----------------------------------------------------------------


//--------------------------------------------------------
//--------------------- MS enhancements ------------------
//--------------------------------------------------------
var digitalColors = ["#50dd00","green","blue","purple","red","orange"];
var myColor;
var lastHour = 0;
var lastQuarterHour = 0;
var lastFiveMinutes = 0;
var ticksSinceChime = 0;
var safeDelayTime = 30; // seconds after chimes when stopIt() is called.
var isStopped = true;
var firstNoteMidiArray = [54,60,56,64,65,62,55,61,59,63,57,58];
var firstNoteMidi = 60;
var newNoteMidi = 60;
var notes = ["C4"];
var alarmHour = null;
var alarmMinute = null;
var alarmAmPm = null;
var alarmTimeDisplayON = false;
var alarmDate = null;
var debugIndex = 2;
var debugDates = ["October 13, 2014 11:00:00","October 13, 2014 11:05:00","October 13, 2014 11:10:00",
                  "October 13, 2014 11:15:00","October 13, 2014 11:20:00","October 13, 2014 11:25:00",
                  "October 13, 2014 11:30:00","October 13, 2014 11:35:00","October 13, 2014 11:40:00",
                  "October 13, 2014 11:45:00","October 13, 2014 11:50:00","October 13, 2014 11:55:00"];


//the synth ---------------------------
var clockSynth = null;
var chorus = null;
var cheby = null;
var reverb = null;
var chorusSend = null;
var chebySend = null;
var reverbSend = null;
//------------------------------

/*-----------------------------------

var clockSynth = new Tone.PolySynth(4, Tone.Synth).toMaster().set("envelope.attack", 0.04);

//send audio to each of the effect channels
var chorusSend = clockSynth.send("chorus", -10);
var chebySend = clockSynth.send("cheby", -21);
//var autowahSend = clockSynth.send("autowah", -Infinity);
var reverbSend = clockSynth.send("reverb", -5);

//make some effects
var chorus = new Tone.Chorus()
	.receive("chorus")
	.toMaster();

var cheby = new Tone.Chebyshev(50)
	.receive("cheby")
	.toMaster();

var reverb = new Tone.Freeverb(0.9, 4000)
	.receive("reverb")
	.toMaster();
//-------------------------------------------*/

function createClockSynth() {
//    console.log('createClockSynth()')
    clockSynth = new Tone.PolySynth(4, Tone.Synth).toMaster().set("envelope.attack", 0.04);
    chorusSend = clockSynth.send("chorus", -10);
    chebySend = clockSynth.send("cheby", -21);
    reverbSend = clockSynth.send("reverb", -5);
    chorus = new Tone.Chorus().receive("chorus").toMaster();
    cheby = new Tone.Chebyshev(50).receive("cheby").toMaster();
    reverb = new Tone.Freeverb(0.9, 4000).receive("reverb").toMaster();
    updateVolume();    
}

function disposeClockSynth() {
//    console.log('disposeClockSynth()')
	if (clockSynth){
		clockSynth.dispose();
		clockSynth = null;
	}
	if (chorusSend){
		chorusSend.dispose();
		chorusSend = null;
	}
	if (chebySend){
		chebySend.dispose();
		chebySend = null;
	}
	if (reverbSend){
		reverbSend.dispose();
		reverbSend = null;
	}
	if (chorus){
		chorus.dispose();
		chorus = null;
	}
	if (cheby){
		cheby.dispose();
		cheby = null;
	}
	if (reverb){
		reverb.dispose();
		reverb = null;
	}
}


//------------------------------------------

// hourly clock chime
var three = ["G4","G3"];
var one = ["Eb4","Eb3"];
var two = ["F4","F3"];
var five = ["Bb3","Bb2"];
var gong = ["A3","C#3"];

// alarm chime
var qh_1 = ["C4","E4"];
var qh_2 = ["D4","F#4"];
var qh_3 = ["E4","G#4"];
var qh_4 = ["F#4","A#4"];
var qh_5 = ["G#4","C5"];

// For translating MIDI number into pitch names, MIDI numbers are used as index into this array.
// i.e. MIDI_NUM_NAMES[60] == "C4"
MIDI_NUM_NAMES = ["C_1", "C#_1", "D_1", "D#_1", "E_1", "F_1", "F#_1", "G_1", "G#_1", "A_1", "A#_1", "B_1",
                "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
                "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
                "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
                "C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9"];
                

function drawDigitalTime(ctx, radius) {
//    var now = new Date(debugDates[debugIndex]);
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var AmPm = ""; 
    var muteFiveMinuteChime;
    var muteHourChime;
    AmPm = (hour < 12) ? "am": "pm";
    
    ticksSinceChime++; // keep track of seconds since the last toll so we don't stop the transport too soon.        
    hour=hour%12;
    // create digital clock version
    var zeroFiller = ""
    var zeroFiller2 = ""
    if(minute < 10) 
        zeroFiller = "0";
    if(second < 10) 
        zeroFiller2 = "0";
    if(hour === 0)
        hour = "12";
    var timeString = "" + hour + ":" + zeroFiller + minute + ":" + zeroFiller2 + second  + " " + AmPm ;

    ctx.font = radius*0.2 + "px arial";
//    ctx.fontWeight = normal;
    ctx.fillStyle = myColor;
    ctx.clearRect(0-(radius/2), radius+(radius/12), radius+(radius/6), radius/4);

// for debugging the size of digital clock display area
//    ctx.fillRect(0-(radius/2), radius+(radius/12), radius+(radius/6), radius/4);

// look for checkbox status
    muteFiveMinuteChime = document.getElementById("idFiveMinuteChime").checked;
    muteHourChime = document.getElementById("idHourChime").checked;
    
    ctx.beginPath();
    ctx.fillText(timeString, 0+(radius/10), radius+(radius/5));
    // TODO: display count down until alarm time
    if(alarmTimeDisplayON) {
         var countDownString = createTimeDivString(alarmDate);
         document.getElementById('alarmCountdownDiv').innerHTML = countDownString;
//         ctx.fillText(countDownString, 0+(radius/10), radius+(radius/2));
    } else {
         document.getElementById('alarmCountdownDiv').innerHTML = '';
//         ctx.fillText('            ', 0+(radius/10), radius+(radius/2));
    
    }

    // change color on the minute
    myColor = digitalColors[minute % digitalColors.length];

/*---------------------------------------
	//create an audio context
	window.AudioContext = window.AudioContext || window.webkitAudioContext
	var audioContext = new AudioContext()
	//set the context
//	StartAudioContext(audioContext, ".starterButton").then(function(){
//		document.querySelector("#isStarted").textContent = "Started"
//	})
//-------------------------------------------*/

    // Chimes 
    // (1) on the hour - hourly chime plus hour number of gongs
    // (2) every five minutes - interval
    // (3) setable alarm
    
    // alarm
    if( hour == Number(alarmHour) && minute == Number(alarmMinute) && AmPm == alarmAmPm && isStopped) {
//        stopIt();
        safeDelayTime = 5;
        isStopped = false;
        ticksSinceChime = 0;
        ClockBellsAlarm();
        if(alarmTimeDisplayON) {
			var alarmDetailsDiv = document.getElementById("alarmDetailsDiv");
			alarmDetailsDiv.innerHTML = '';
		}
        alarmTimeDisplayON = false;


//        console.log("time = "+timeString+":"+second+"\nisStopped="+isStopped);        
    } else if( !muteHourChime && hour != lastHour && isStopped) { // every hour
//        console.log("------- start playing Clock Chime sequence ---------------\ntime = "+timeString+":"+second+"\nisStopped = "+isStopped);
//        stopIt();
        safeDelayTime = 33;
        lastHour = hour;
        lastQuarterHour = Math.floor(minute/15);
        lastFiveMinutes = Math.floor(minute/5);
        isStopped = false;
        ticksSinceChime = 0;
        ClockBells(hour);
//        console.log("time = "+timeString+":"+second+"\nisStopped="+isStopped);        
    }

/*------------------------ not using quarter hour toll --------------------------------------
    else if( Math.floor(minute/15) != lastQuarterHour  && isStopped) { // every 15 minutes
        console.log("------- start playing QH sequence ---------------\ntime = "+timeString+":"+second+"\nisStopped = "+isStopped);
        stopIt();
        safeDelayTime = 10;
        lastQuarterHour = Math.floor(minute/15);
        lastFiveMinutes = Math.floor(minute/5);
        isStopped = false;
        ticksSinceChime = 0;
        ClockBellsQH();
        console.log("time = "+timeString+":"+second+"\nisStopped="+isStopped);        
    }
//----------------------------------------------------------------------------------------*/

    else if( !muteFiveMinuteChime && Math.floor(minute/5) != lastFiveMinutes  && isStopped) { // every 5 minutes
//        console.log("------- start playing Five minute sequence ---------------\ntime = "+timeString+":"+second+"\nisStopped = "+isStopped);
//        stopIt();
        safeDelayTime = 10;
        lastFiveMinutes = Math.floor(minute/5);
        var offset = lastFiveMinutes;
        // get a new first note from firstNoteMidiArray[] every 5 minutes 
        // and each hour start the array at a different place
        firstNoteMidi = firstNoteMidiArray[(offset + hour) % firstNoteMidiArray.length];    

        offset = offset == 0 ? 12 : offset;
        // if a descending interval make offset negative
        offset = (offset % 2)? offset*-1 : offset;
        offset = (hour % 2)? offset*-1 : offset;
        firstNoteMidi = (offset < -5)? firstNoteMidi+12 : firstNoteMidi;
        newNoteMidi = firstNoteMidi + offset;
        var newTone = MIDI_NUM_NAMES[newNoteMidi];
        notes = [];
        notes.push(MIDI_NUM_NAMES[firstNoteMidi]);
        notes.push(newTone);
        notes.push(MIDI_NUM_NAMES[firstNoteMidi]);
        isStopped = false;
        var msg = "firstNoteMidi="+firstNoteMidi+" newNoteMidi="+newNoteMidi+"\nnotes=";
        for(var i=0; i<notes.length; i++) {
            if(i>0)
                msg+=",";
            msg += notes[i];
        }
        msg += "\n"+now;
//        console.log(msg);
        ticksSinceChime = 0;
        playInterval(notes);
//        console.log("time = "+timeString+":"+second+"\nisStopped="+isStopped);        
    }
    else if(!isStopped && ticksSinceChime > safeDelayTime) {
        stopIt();
        isStopped = true;
//        console.log("time = "+timeString+"\nisStopped="+isStopped+"\n------------- end play sequence --------------");
//        console.log("lastHour="+lastHour+" lastQuarterHour="+lastQuarterHour+" lastFiveMinutes"+lastFiveMinutes+ " ticksSinceChime="+ticksSinceChime);
    }
}


function playInterval(notes) {
    // for unknown reason I had to start the measureStamp at measure 2 in the zero indexed
    // notation ["measure:beat", notes] (.i.e. ["1:0", notes[i]] instead of ["0:0", notes[i]]
    // because the notes were sometimes being mashed together like a chord.
//    console.log("playInterval()")
    var measureStamp;
    var intervalNotes = [];
    for(var i=0; i<notes.length; i++) {
        measureStamp = "1:"+(i);
        intervalNotes.push([measureStamp, notes[i]]);
    }
    console.log(intervalNotes);
    createClockSynth();
	var interval = new Tone.Part(function(time, chord){
		clockSynth.triggerAttackRelease(chord, "4n", time);
	}, intervalNotes ).start(0); 

    Tone.Transport.bpm.value = 120;   
    Tone.Transport.start("+0.1");
//    console.log("Tone.Transport.start()");
}

function stopIt(){
//    console.log("stopIt()");    
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    if (clockSynth){
		disposeClockSynth();
	}
}

function updateVolume() {
    if(clockSynth) {
        clockSynth.volume.value = document.getElementById('volume').value
    }
}


function ClockBellsQH() {
    // for unknown reason I had to start at measure 3 in the zero indexed
    // notation ["measure:beat", notes] (.i.e. ["2:0", notes] instead of ["0:0", notes]
    // because the first two notes were sometimes being cut off
    
    var wholeTones = [["2:0", qh_1], ["2:1", qh_2], ["2:2", qh_3], ["2:3", qh_4], ["3:0", qh_5]];
    createClockSynth();
	var ClockBellsPart = new Tone.Part(function(time, chord){
		clockSynth.triggerAttackRelease(chord, "4n", time);
	}, wholeTones ).start(0); 

	Tone.Transport.bpm.value = 400;   
	Tone.Transport.start("+0.1");

}

function ClockBellsAlarm() {
    // for unknown reason I had to start at measure 3 in the zero indexed
    // notation ["measure:beat", notes] (.i.e. ["2:0", notes] instead of ["0:0", notes]
    // because the first two notes were sometimes being cut off
    var wholeTones = [["2:0", qh_1], ["2:1", qh_2], ["2:2", qh_3], ["2:3", qh_4], ["3:0", qh_5]];
    createClockSynth();
	var ClockBellsPart = new Tone.Part(function(time, chord){
		clockSynth.triggerAttackRelease(chord, "4n", time);
	}, wholeTones ).start(0); 

	Tone.Transport.bpm.value = 400;   
	Tone.Transport.start("+0.1");
}


function ClockBells(hour) {
    // for unknown reason I had to start at measure 2 in the zero indexed
    // notation ["measure:beat", notes] (.i.e. ["1:0", three] instead of ["0:0", three]
    // because the first two notes were being cut off
    var measureStamp;
    var bellToll = [["1:0", three], ["1:1", one], ["1:2", two], ["1:3", five], ["2:2", five], 
		["2:3", two], ["3:0", three], ["3:1", one]];
	var offset = hour;
    for(var i=1; i<=offset; i++) {
        measureStamp = ""+(i+3)+":2";
        bellToll.push([measureStamp, gong]);
    }
    createClockSynth();
	var ClockBellsPart = new Tone.Part(function(time, chord){
		clockSynth.triggerAttackRelease(chord, "4n", time);
	}, bellToll ).start(0); 

	Tone.Transport.bpm.value = 130;   
	Tone.Transport.start("+0.1");
}

function createVolumeMenu() {
    var idVolume = "volume";
    var inputVolume = document.createElement("SELECT");
	inputVolume.setAttribute("id", idVolume);
    var optionV0 = document.createElement("OPTION");
    var optionV1 = document.createElement("OPTION");
    var optionV2 = document.createElement("OPTION");
    var optionV3 = document.createElement("OPTION");
    var optionV4 = document.createElement("OPTION");
    var optionV5 = document.createElement("OPTION");

	optionV5.setAttribute("value", "0");
	optionV5.setAttribute("label", "0");
	optionV4.setAttribute("value", "-5");
	optionV4.setAttribute("label", "-5");
	optionV3.setAttribute("value", "-10");
	optionV3.setAttribute("label", "-10");
	optionV2.setAttribute("value", "-15");
	optionV2.setAttribute("label", "-15");
	optionV1.setAttribute("value", "-20");
	optionV1.setAttribute("label", "-20");
	optionV0.setAttribute("value", "-30");
	optionV0.setAttribute("label", "-30");
    inputVolume.appendChild(optionV0);
    inputVolume.appendChild(optionV1);
    inputVolume.appendChild(optionV2);
    inputVolume.appendChild(optionV3);
    inputVolume.appendChild(optionV4);
    inputVolume.appendChild(optionV5);

    inputVolume.addEventListener("change", function(e){
		updateVolume();
	}, true);

    var alarmDiv = document.getElementById("alarmDiv");
    alarmDiv.appendChild(inputVolume);

}


function createAlarmField() {
    var idHour = "alarmTimeHour";
    var inputHour = document.createElement("SELECT");
	inputHour.setAttribute("id", idHour);
    var optionH1 = document.createElement("OPTION");
    var optionH2 = document.createElement("OPTION");
    var optionH3 = document.createElement("OPTION");
    var optionH4 = document.createElement("OPTION");
    var optionH5 = document.createElement("OPTION");
    var optionH6 = document.createElement("OPTION");
    var optionH7 = document.createElement("OPTION");
    var optionH8 = document.createElement("OPTION");
    var optionH9 = document.createElement("OPTION");
    var optionH10 = document.createElement("OPTION");
    var optionH11 = document.createElement("OPTION");
    var optionH12 = document.createElement("OPTION");
	
	optionH12.setAttribute("value", "12");
	optionH12.setAttribute("label", "12");
	optionH1.setAttribute("value", "1");
	optionH1.setAttribute("label", "1");
	optionH2.setAttribute("value", "2");
	optionH2.setAttribute("label", "2");
	optionH3.setAttribute("value", "3");
	optionH3.setAttribute("label", "3");
	optionH4.setAttribute("value", "4");
	optionH4.setAttribute("label", "4");
	optionH5.setAttribute("value", "5");
	optionH5.setAttribute("label", "5");
	optionH6.setAttribute("value", "6");
	optionH6.setAttribute("label", "6");
	optionH7.setAttribute("value", "7");
	optionH7.setAttribute("label", "7");
	optionH8.setAttribute("value", "8");
	optionH8.setAttribute("label", "8");
	optionH9.setAttribute("value", "9");
	optionH9.setAttribute("label", "9");
	optionH10.setAttribute("value", "10");
	optionH10.setAttribute("label", "10");
	optionH11.setAttribute("value", "11");
	optionH11.setAttribute("label", "11");
    inputHour.appendChild(optionH12);
    inputHour.appendChild(optionH1);
    inputHour.appendChild(optionH2);
    inputHour.appendChild(optionH3);
    inputHour.appendChild(optionH4);
    inputHour.appendChild(optionH5);
    inputHour.appendChild(optionH6);
    inputHour.appendChild(optionH7);
    inputHour.appendChild(optionH8);
    inputHour.appendChild(optionH9);
    inputHour.appendChild(optionH10);
    inputHour.appendChild(optionH11);

    var idMinute = "alarmTimeMinute";
    var inputMinute = document.createElement("SELECT");
	inputMinute.setAttribute("id", idMinute);
    var optionM00 = document.createElement("OPTION");
    var optionM05 = document.createElement("OPTION");
    var optionM10 = document.createElement("OPTION");
    var optionM15 = document.createElement("OPTION");
    var optionM20 = document.createElement("OPTION");
    var optionM25 = document.createElement("OPTION");
    var optionM30 = document.createElement("OPTION");
    var optionM35 = document.createElement("OPTION");
    var optionM40 = document.createElement("OPTION");
    var optionM45 = document.createElement("OPTION");
    var optionM50 = document.createElement("OPTION");
    var optionM55 = document.createElement("OPTION");
	optionM00.setAttribute("value", "00");
	optionM00.setAttribute("label", "00");
	optionM05.setAttribute("value", "05");
	optionM05.setAttribute("label", "05");
	optionM10.setAttribute("value", "10");
	optionM10.setAttribute("label", "10");
	optionM15.setAttribute("value", "15");
	optionM15.setAttribute("label", "15");
	optionM20.setAttribute("value", "20");
	optionM20.setAttribute("label", "20");
	optionM25.setAttribute("value", "25");
	optionM25.setAttribute("label", "25");
	optionM30.setAttribute("value", "30");
	optionM30.setAttribute("label", "30");
	optionM35.setAttribute("value", "35");
	optionM35.setAttribute("label", "35");
	optionM40.setAttribute("value", "40");
	optionM40.setAttribute("label", "40");
	optionM45.setAttribute("value", "45");
	optionM45.setAttribute("label", "45");
	optionM50.setAttribute("value", "50");
	optionM50.setAttribute("label", "50");
	optionM55.setAttribute("value", "55");
	optionM55.setAttribute("label", "55");
    inputMinute.appendChild(optionM00);
    inputMinute.appendChild(optionM05);
    inputMinute.appendChild(optionM10);
    inputMinute.appendChild(optionM15);
    inputMinute.appendChild(optionM20);
    inputMinute.appendChild(optionM25);
    inputMinute.appendChild(optionM30);
    inputMinute.appendChild(optionM35);
    inputMinute.appendChild(optionM40);
    inputMinute.appendChild(optionM45);
    inputMinute.appendChild(optionM50);
    inputMinute.appendChild(optionM55);

    var idAmPm = "alarmAmPm";
    var AM_PM = document.createElement("SELECT");
	AM_PM.setAttribute("id", idAmPm);
    var optionAM = document.createElement("OPTION");
    var optionPM = document.createElement("OPTION");
	optionAM.setAttribute("value", "am");
	optionAM.setAttribute("label", "am");
	optionPM.setAttribute("value", "pm");
	optionPM.setAttribute("label", "pm");
    AM_PM.appendChild(optionAM);
    AM_PM.appendChild(optionPM);

    var idButton = "setAlarm";
    var button = document.createElement("BUTTON");
    button.setAttribute("id", idButton);
//    button.setAttribute("onclick", "setAlarmTime");
    var buttonText = document.createTextNode("set alarm");    
    button.addEventListener("click", function(e){
		setAlarmTime();
	}, true);
    button.appendChild(buttonText);
    
    var idButton2 = "cancelAlarm";
    var button2 = document.createElement("BUTTON");
    button2.setAttribute("id", idButton2);
//    button2.setAttribute("onclick", "cancelAlarmTime");
    var buttonText2 = document.createTextNode("cancel alarm");
    button2.addEventListener("click", function(e){
		cancelAlarmTime();
	}, true);
    button2.appendChild(buttonText2);
    
    var lineBreak = document.createElement("BR");

    var alarmDiv = document.getElementById("alarmDiv");
    var alarmButtons = document.getElementById("alarmButtons");
    alarmDiv.appendChild(inputHour);
    alarmDiv.appendChild(inputMinute);
    alarmDiv.appendChild(AM_PM);
    alarmButtons.appendChild(button);
    alarmButtons.appendChild(button2);
    
//------------------------------------------------------    
    var onOffHourChime = document.createElement("INPUT");
    onOffHourChime.setAttribute('type', 'checkbox');
    onOffHourChime.setAttribute('type', 'checkbox');
    onOffHourChime.setAttribute('id', 'idHourChime');
    var muteHourText = document.createTextNode("mute Hour Chime");

    var onOffFiveMinuteChime = document.createElement("INPUT");
    onOffFiveMinuteChime.setAttribute('type', 'checkbox');
    onOffFiveMinuteChime.setAttribute('id', 'idFiveMinuteChime');
    var muteFiveMinuteText = document.createTextNode("mute Five Minute Chime");

    var onOffDiv = document.getElementById("on_off_checkboxes");
    onOffDiv.appendChild(onOffHourChime);
    onOffDiv.appendChild(muteHourText);
    onOffDiv.appendChild(lineBreak);
    onOffDiv.appendChild(onOffFiveMinuteChime);
    onOffDiv.appendChild(muteFiveMinuteText);
//----------------------------------------------------*/
    
}

function setAlarmTime() {
    var hourMenu = document.getElementById("alarmTimeHour");
    var minuteMenu = document.getElementById("alarmTimeMinute");
    var AmPmMenu = document.getElementById("alarmAmPm");
    alarmHour = hourMenu.options[hourMenu.selectedIndex].value;
    alarmMinute = minuteMenu.options[minuteMenu.selectedIndex].value;
    alarmAmPm = AmPmMenu.options[AmPmMenu.selectedIndex].value;
    console.log("alarmHour="+alarmHour+" alarmMinute="+alarmMinute+" alarmAmPm="+alarmAmPm);
    var alarmDetailsDiv = document.getElementById("alarmDetailsDiv");
    alarmDetailsDiv.innerHTML = '<p>Alarm is set for '+alarmHour+':'+alarmMinute+' '+alarmAmPm+'</p>';
    alarmTimeDisplayON = true;

    now = new Date();
    var alarmHourMilitary;
    if(alarmAmPm == 'am' && alarmHour == '12') {
        alarmHourMilitary = 0;
    } else if(alarmAmPm == 'pm' && alarmHour != '12') {
        alarmHourMilitary = Number(alarmHour) + 12;
    } else {
        alarmHourMilitary = Number(alarmHour);
    }
    alarmDate = new Date(now.getFullYear(),now.getMonth(),now.getDate(),alarmHourMilitary,Number(alarmMinute),1);
    // determine if the alarmDate is in the wee hours of tomorrow compared to now
    if (now.getTime() > alarmDate.getTime()) {
        // increment the day of the month, the date object handles possible rollover to new month.
        alarmDate.setDate(alarmDate.getDate() + 1 ); 
    }
}

function cancelAlarmTime() {
    alarmHour = null;
    alarmMinute = null;
    alarmAmPm = null;
    alarmTimeDisplayON = false;
    alarmDate = null;
    document.getElementById("alarmDetailsDiv").innerHTML = '';
//    console.log('cancelAlarmTime(): alarmTimeDisplayON'+alarmTimeDisplayON);
}

function createTimeDivString(date) {
    var time1ms = date.getTime();
    var now = new Date()
    var time2ms = now.getTime();
    var msPerHalfDay = 1000 * 60 * 60 * 12; // ms/sec * sec/min * min/hr * hr/1/2day
    var diff = time1ms - time2ms;
    
    var hours = Math.floor(diff / (1000 * 60 * 60 ));
    var remainder = diff % (1000 * 60 * 60 );
    var minutes = Math.floor(remainder / (1000 * 60));
    remainder = remainder % (1000 * 60)
    var seconds = Math.floor(remainder / 1000);
    var timeString = '<p>Alarm countdown:<br> ';
    // hour
    if(hours == 0) { 
        timeString += '00' 
    } else if(hours < 10) {
       timeString += '0' + hours.toString();
    } else {
       timeString += hours.toString();    
    }
    timeString += ':';
    // minute 
    if(minutes == 0) { 
        timeString += '00' 
    } else if(minutes < 10) {
       timeString += '0' + minutes.toString();
    } else {
       timeString += minutes.toString();    
    }
    timeString += ':';
    if(seconds == 0) { 
        timeString += '00' 
    } else if(seconds < 10) {
       timeString += '0' + seconds.toString();
    } else {
       timeString += seconds.toString();    
    }
    timeString += '</p>';
    return timeString;
    
}

// ------- end MS enhancement -----------------------------

//------------------ end clock -----------------------------------------------
