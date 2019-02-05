# Eartraining-Clock

This is an extension of the canvas clock code from [w3school.com canvas tutorial](https://www.w3schools.com/graphics/canvas_clock.asp).

The extensions include 
- digital clock
- 'Big Ben' chimes on the hour
- eartraining interval every 5 minutes
- set alarm

Tone.js is used to create sound for the clock so that it chimes on the hour and also plays an 
interval every 5 minutes.  The interval is the number of half steps of the number that the 
minute hand is pointing to.  i.e. At 5 after the hour the minute hand is pointing to the number
1 so an interval of 1 half step is played (min2).  

The following intervals are played during the hour

:05 = min2 (1 half step)  
:10 = maj2 (2 half steps)  
:15 = min3 (3 half steps)  
:20 = maj3 (4 half steps)  
:25 = P5 (5 half steps)  
:30 = TT (6 half steps)  
:35 = P5 (7 half steps)  
:40 = min6 (8 half steps)  
:45 = maj6 (9 half steps)  
;50 = min7 (10 half steps)  
:55 = maj7 (11 half steps)  

During the hour as the clock chimes the 5 minute interval, the eartraining exercise is to determine the time by recogizing the interval size.  If you hear a Perfect 4th (which has 5 half steps) you should conclude that minute hand is pointing towards '5', therefore it is 25 minutes after the hour.  Check your eartraining accuracy by looking at the clock.

The [Tone.js library](https://github.com/Tonejs/Tone.js) is used for the sound creation.  
The javascript code is canvasClock.js  
The html page is Clock.html
