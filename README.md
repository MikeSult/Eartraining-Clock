# Eartraining-Clock

This is an extension of the canvas clock code from w3school.com canvas tutorial.

Added sound to the clock so that it chimes on the hour and also plays an interval
every 5 minutes.  The interval is the number of half steps of the number that the minute 
hand is pointing to.  i.e. At 5 after the hour the minute hand is pointing to the number
1 so an interval of 1 half step is played (min2).  The following intervals are played
during the hour

:05 = min2  
:10 = maj2  
:15 = min3  
:20 = maj3  
:25 = P5  
:30 = TT  
:35 = P5  
:40 = min6  
:45 = maj6  
;50 = min7  
:55 = maj7  

The Tone.js library is used for the sound creation.  
The javascript code is canvasClock.js
The html page is Clock.html
