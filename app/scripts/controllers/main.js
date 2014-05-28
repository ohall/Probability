'use strict';


var app = angular.module('ProbabilityApp');

app.controller('DiceCtrl', function ($scope,$interval,$timeout) {
    var rollingImgs = [
        "styles/die-1.gif",
        "styles/dices-1.gif",
        "styles/die-2.gif",
        "styles/dices-2.gif",
        "styles/die-3.gif",
        "styles/dices-3.gif",
        "styles/die-4.gif",
        "styles/dices-4.gif",
        "styles/die-5.gif",
        "styles/dices-5.gif",
        "styles/die-6.gif",
        "styles/dices-6.gif",
        "styles/die-1.gif",
        "styles/dicet-1.gif",
        "styles/die-2.gif",
        "styles/dicet-2.gif",
        "styles/die-3.gif",
        "styles/dicet-3.gif",
        "styles/die-4.gif",
        "styles/dicet-4.gif",
        "styles/die-5.gif",
        "styles/dicet-5.gif",
        "styles/die-6.gif",
        "styles/dicet-6.gif"
    ],
        faces = [
        "styles/die-1.gif",
        "styles/die-2.gif",
        "styles/die-3.gif",
        "styles/die-4.gif",
        "styles/die-5.gif",
        "styles/die-6.gif"
        ],
        canvas = document.getElementById("dicecanvas"),
        ctx = canvas.getContext("2d"),
        W = 350,
        H = 450,
        dice, i,
        NUM_DICE = 4,
        gravity = 0.2,
        bounceFactor = 0.5,
        running = false,
        updates,
        stopRoll = false,
        diceIndices = {one:0,two:0};

    canvas.height = H; canvas.width = W;

    var drawFunc = function() {
        var image = new Image;
        if(!stopRoll){//we're looping through die faces
            faceIndex(diceIndices, rollingImgs);
            image.src = rollingImgs[diceIndices.one];
            ctx.drawImage(image, this.x, this.y);
        }else{
            if(!this.stopped) {//we're choosing a face to land on
                image.src = faces[Math.floor(Math.random() * faces.length)];
                this.stopped = true;
                this.image = image;
            }
            //we're drawing with the chose face
            ctx.drawImage(this.image, this.x, this.y);
        }
    };

    function faceIndex(indObj,array){
        indObj.one = (indObj.one >= array.length )? 0 : indObj.one+1;
        indObj.two = (indObj.two == 0 )? array.length : indObj.two-1;
    }

    function setDice(pdrawFunc){
        stopRoll = false;
        dice = [];
        for(i=0;i<NUM_DICE;i++){
            var iball = {
                x: (W/10)*i + 15,
                y: Math.floor(Math.random()*NUM_DICE),
                height:32,
                stopped:false,
                image:null,
                vx: 0,
                vy: Math.floor(Math.random()*NUM_DICE),
                draw: pdrawFunc
            };
            dice.push(iball);
        }
    }

    $scope.dice = function(){
        setDice(drawFunc);
        function clearCanvas() {
            ctx.clearRect(0, 0, W, H);
        }
        // A function that will update the position of the ball is also needed. Lets create one
        function update() {
            clearCanvas();
            for(var i =0;i<dice.length;i++){
                dice[i].draw();
                dice[i].y += dice[i].vy;
                dice[i].vy += gravity;
                if(dice[i].y + dice[i].height > H) {
                    dice[i].y = H - dice[i].height;
                    dice[i].vy *= -bounceFactor;
                }
            }
        }
        if(!running){
            running = true;
            updates = $interval(update, 1000/60);
        }else{
            running = false;
            $interval.cancel(updates);
            updates = undefined;
            clearCanvas();
        }
        $timeout(function(){
            stopRoll = true
        },2500)
    };



//    $scope.animateDice = function(){
//        if (!angular.isDefined(rolling)) {
//            rolling = $interval(function() {
//
////                $scope.die2 = rollingImgs[diceIndices.two];
//            }, 60);
//
//            $timeout(function(){$scope.stopDice()},4000);
//        }
//
//
//    };
//
//    $scope.stopDice = function(){
//        if (angular.isDefined(rolling)) {
//            $interval.cancel(rolling);
//            rolling = undefined;
//            $scope.die1 = faces[Math.floor(Math.random()*faces.length)];
////            $scope.die2 = faces[Math.floor(Math.random()*faces.length)];
//        }
//    };


});

app.controller('CardCtrl', function ($scope){
    $scope.newCard = function(){
        $scope.card ="styles/cards/" + Math.floor(Math.random()*52) + ".png";
    };
});

app.controller('MarbleCtrl', function ($scope,$interval){
    var canvas = document.getElementById("marblecanvas"),
        ctx = canvas.getContext("2d");

    var W = 350,
        H = 450;

    canvas.height = H; canvas.width = W;

    var balls, i,
        gravity = 0.2,
        bounceFactor = 0.8,
        running = false,
        updates;

    var colors = [
        "red",
        "blue",
        "green",
        "black",
        "purple",
        "orange",
        "yellow",
        "pink",
        "brown",
        "teal"
    ];


    var drawFunc = function() {
        // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    function setBalls(){
        balls = [];
        for(i=0;i<10;i++){
            var iball = {
                x: (W/10)*i + 15,
                y: Math.floor(Math.random()*10),
                radius: 15,
                color: colors[i],
                // Velocity components
                vx: 0,
                vy: Math.floor(Math.random()*10),
                draw: drawFunc
            };
            balls.push(iball);
        }
    }

    $scope.marbles = function(){
        setBalls();
        function clearCanvas() {
            ctx.clearRect(0, 0, W, H);
        }
        // A function that will update the position of the ball is also needed. Lets create one
        function update() {
            clearCanvas();
            for(var i =0;i<balls.length;i++){
                balls[i].draw();
                balls[i].y += balls[i].vy;
                balls[i].vy += gravity;
                if(balls[i].y + balls[i].radius > H) {
                    balls[i].y = H - balls[i].radius;
                    balls[i].vy *= -bounceFactor;
                }
            }
        }
        if(!running){
            running = true;
            // Now, the animation time!
            // in setInterval, 1000/x depicts x fps! So, in this casse, we are aiming for 60fps for smoother animations.
            updates = $interval(update, 1000/60);
        }else{
            running = false;
            $interval.cancel(updates);
            updates = undefined;
            clearCanvas();
        }

    };

});

app.controller("CoinCtrl", function ($scope,$timeout){

    $scope.coinImage = "styles/heads.jpg";

    var framenum = 0,
        framecnt = 0,
        flipping = null,
        choice = 0,
        headcnt = 0,
        tailcnt = 0,
        pict = new Array(3, 4, 1, 4),
        cachedimages = new Array(5);

    cachedimages[0] = new Image();
    cachedimages[0].src = "styles/heads.jpg";
    cachedimages[1] = new Image();
    cachedimages[1].src = "styles/tailsma1.jpg";
    cachedimages[2] = new Image();
    cachedimages[2].src = "styles/tailsma.jpg";
    cachedimages[3] = new Image();
    cachedimages[3].src = "styles/heads1.jpg";
    cachedimages[4] = new Image();
    cachedimages[4].src = "styles/dist.jpg";


    $scope.posclicked = function() {

        if (flipping == null) {
            if (Math.random() < 0.5) {
                choice = 0;
                headcnt++;
            }else{
                choice = 2;
                tailcnt++;
            }
            framecnt = 0;
            animate();
        }
    };

    function animate() {
        framenum = (framecnt) % 4;
        $scope.coinImage = cachedimages[pict[framenum]].src;
        framecnt++;
        if ((framecnt > 8) && (framenum == choice)) {
            $scope.coinImage = cachedimages[framenum].src;
            flipping = null;
        }else{
            flipping = $timeout(animate(), 30);
        }
    }

});




app.directive('backImg', function(){
    return function (scope, element, attrs) {
        attrs.$observe('img', function(pUrl) {
            element.css({
                'background-image': 'url(' + pUrl + ')',
                'background-size': 'cover'
            });
        });
    };
})

var canvasId         = "myDrawingCanvas";   // Id of the canvas element on the page the wheel is to be rendered on.
var wheelImageName   = "styles/prizewheel.png";	// File name of the image for the wheel.
var spinButtonImgOn  = "styles/spin_on.png";		// Name / path to the images for the spin button.
var spinButtonImgOff = "styles/spin_off.png";
var theSpeed         = 20; 		 // Controls how often the spin function is called (is miliseconds value for animation timer).
var pointerAngle     = 0;  	 	 // The angle / location around the wheel where the pointer indicaing the prize is located. Can be any value you like, 0 is top (12 oclock) 180 is bottom (6 o'clock) etc.
var doPrizeDetection = true; 	 // Set to true if you want the code to detect the prize the user has won when the spinning has stopped. Prizes need to be specified in the prizes array.
var spinMode         = "random"; // Values can be: random, determinedAngle, determinedPrize.
var determinedGetUrl = "";  	 // Set to URL of the server-side process to load via ajax when spinMode is determinedAngle or determinedPrize.
/*
 The following files included in the download can be used to test the different modes (you will need an Apache server; I use XAMPP on my local machine).
 determinedPrize: get_determined_prize.php;  // Always returns "2" (so will win prize 3).
 determinedAngle: get_determined_angle.php;	// Always returns "67" degrees (so will win prize 2 using example wheel prize start and end angles).
 */

// --------------------------------
// SPECIFY PRIZES (alter this too)...
// Add items to the array which correspond to the prizes in the segemnts of the wheel.
// The important properties are the startAngle and the endAngle in degrees, the name and anything else you want to add is optional.
// In order to work correctly the the start and end angles need to match the begining and end of the segments for the prizes in your wheel image.
// Thinking about a clock face, 0 is at the 12 o'clock, 90 is at the 3 o'clock, 180 is 6 o'clock, 270 is 9 o'clock.
var prizes = new Array();
prizes[0] = {"name" : "Prize 1", "startAngle" : 0,   "endAngle" : 44};  // Note how prize end angle is 1 less than start angle of next prize so no overlap.
prizes[1] = {"name" : "Prize 2", "startAngle" : 45,  "endAngle" : 89};
prizes[2] = {"name" : "Prize 3", "startAngle" : 90,  "endAngle" : 134};
prizes[3] = {"name" : "Prize 4", "startAngle" : 135, "endAngle" : 179};
prizes[4] = {"name" : "Prize 5", "startAngle" : 180, "endAngle" : 224};
prizes[5] = {"name" : "Prize 6", "startAngle" : 225, "endAngle" : 269};
prizes[6] = {"name" : "Prize 7", "startAngle" : 270, "endAngle" : 314};
prizes[7] = {"name" : "Prize 8", "startAngle" : 315, "endAngle" : 360};

// Idea: an idea I had for this, but not implimented, is that if you wanted some the prizes / segments in your wheel to be "winners" and some to be "loosers"
// you could add a property to the items in the prize array stating if win/loose and then in the doSpin function code that is executed when the spinning has
// stopped display different message / play different sound (or whatever) depending on if the user has won or lost.

// --------------------------------
// VARIABLES THAT YOU DON'T NEED TO / SHOULD NOT CHANGE...
var surface;		   // Set to the drawing canvas object in the begin function.
var wheel;			   // The image of the face of the wheel is loaded in to an image object assigned to this var.
var angle 		 = 0;  // Populated with angle figured out by the threshold code in the spin function. You don't need to set this here.
var targetAngle  = 0;  // Set before spinning of the wheel begins by startSpin function depending on spinMode.
var currentAngle = 0;  // Used during the spin to keep track of current angle.
var power        = 0;  // Set when the power is selected. 1 for low, 2 for med, 3 for high.

// This is used to do ajax when using a determinedSpin mode and the value has not already been passed in via other method.
// Given that HTML canvas is not supported in IE6 or other old school browsers, we don't need to check if
// XMLHttp request is available and fiddle around with creating activeX object etc.
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = ajaxCallback;

// This is set in the startSpin function to a random value within a range so that the last speed of the rotation of the wheel
// does not always happen at the same point before the prize the user will win. See comments in doSpin where this variable is located.
var randomLastThreshold = 150;

// Pointer to the setTimout for the call to the doSpin function. Is global var so can clear the timeout if reset is clicked before wheel has stopped spinning.
var spinTimer;

// Used to track status of the wheel, set to 'spinning' when the wheel is spinning.
// Only used in this code to stop the spin button working again while the wheel is currently spinning, you could use in your project for additional things.
// Note: spin button will only work again after wheel has been reset.
var wheelState = 'reset';

// ==================================================================================================================================================
// This function is called by the code on the page after loading. It gets the canvas and loads the wheel image.
// ==================================================================================================================================================
function begin()
{
    // Get our Canvas element
    surface = document.getElementById(canvasId);

    // If canvas is supported then load the image.
    if (surface.getContext)
    {
        wheel = new Image();
        wheel.onload = initialDraw;		// Once the image is loaded from file this function is called to draw the image in its starting position.
        wheel.src = wheelImageName;
    }
}

// ==================================================================================================================================================
// This function draws the wheel on the canvas in its intial position. Without it only the background would be displayed.
// ==================================================================================================================================================
function initialDraw(e)
{
    var surfaceContext = surface.getContext('2d');
    surfaceContext.drawImage(wheel, 0, 0);
}

// ==================================================================================================================================================
// This function is called when the spin button is clicked, it works out the targetAngle using the specified spin mode, then kicks off the spinning.
// ==================================================================================================================================================
function startSpin(determinedValue)
{
    // This is the angle (0-360) around the wheel that is to be positioned where the pointer is located when the wheel stops.
    // For example if pointer is located at 0 degrees (12 o'clock) and stopAngle is 67 degrees then the prize located at 67
    // degrees will be pointed to when the wheel stops.
    var stopAngle = undefined;

    // Based on spin mode set stopAngle differently.
    if (spinMode == "random")
    {
        // In this mode where the wheel stops is to be random, so get a random whole number between 0 and 360 degrees.
        stopAngle = Math.floor(Math.random() * 360);
    }
    else if (spinMode == "determinedAngle")
    {
        // In this mode the angle (0-360) degrees is pre-determined somehow, such as by a server side process called via AJAX etc.
        // The server side process should return the angle which is a value 0-360 degrees. Ideally this value should be a whole number
        // though decimal numbers (45.5 etc) are possible, but you will need to alter the last threshold in the spin code changing the
        // angle to 0.5 so that there is no possibility that the spinning code will overshoot the target angle.
        // This is only an issue if the specified angle is right on the border between 2 segments / prizes.

        // In order to preserve the ablity of this winwheel code not requiring any other javascript libraries (such as jQuery) we
        // must do our own ajax / XMLRequest stuff. If you like jquery and want to use it, you could bind to the spin button's click event
        // to do a $.get() and then simply pass the value returned by the ajax appropriate for the spinMode in to this function.
        if (typeof(determinedValue) === 'undefined')
        {
            // So determinedValue is has not been passed in, do an request then to the specified determinedGetUrl.
            if (determinedGetUrl)
            {
                xhr.open('GET', determinedGetUrl, true);
                xhr.send('');

                // The request will come back to the ajaxCallback() function below and if all good it will
                // then call this function again passing the determinedValue in.
            }
        }
        else
        {
            // The determinedValue is specified, in this case we know it is an angle (well it should be) so set stopAngle to it.
            stopAngle = determinedValue;
        }
    }
    else if (spinMode == "determinedPrize")
    {
        // Again if determined value is undefined then do the GET to the dertmined url.
        if (typeof(determinedValue) === 'undefined')
        {
            // So determinedValue is has not been passed in, do an request then to the specified determinedGetUrl.
            if (determinedGetUrl)
            {
                xhr.open('GET', determinedGetUrl, true);
                xhr.send('');
            }
        }
        else
        {
            // The determined value is specified. In this case it is the prize the user is to win so it is just a number representing the item in the prize array.
            // For example if the user is to win prize 3 then "2" will be retruned (as arrays start at 0 price 3 is in #2 spot of prizes array).

            // Because the determinedValue is the number of the prize in the prizes array, we cannot simply make the stopAngle this value, so
            // make the stopAngle a random value between the startAngle and endAngle of the prize so when the wheel stops the pointer is pointing to
            // a random place inside the segment displaying the prize (random inside is nicer than always dead center).
            stopAngle = Math.floor(prizes[determinedValue]['startAngle'] + (Math.random() * (prizes[determinedValue]['endAngle'] - prizes[determinedValue]['startAngle'])));
        }
    }

    // ------------------------------------------
    // If stopAngle defined then we have the information we need to work out final things such as the targetAngle and then kick off the spinning of the wheel.
    // Only do this if the wheel is in fresh state (not curently spinning or has stopped after a spin) and the power has been selected.
    if ((typeof(stopAngle) !== 'undefined') && (wheelState == 'reset') && (power))
    {
        // Ok. So we have the stopAngle, but in order to make the prize at that location pointed to by the pointer that indicates the prize we
        // need to adjust the value taking in to account the location of the pointer.
        // This is the location of pointer, minus the stopAngle. 360 is added to ensure that value is not negative.
        stopAngle = (360 + pointerAngle) - stopAngle;

        // Now that is sorted we have to set the targetAngle of the wheel. Once the spinning is started it will keep going until the targetAngle is met.
        // This value needs to be based on the power and have the stopAngle added to it. Basically more power the larger the targetAngle needs to be.
        targetAngle = (360 * (power * 6) + stopAngle);

        // Also set the randomLastThreshold to a value between 90 and 180 so that user cannot always tell what prize they will win before the wheel
        // stops, which is the case if the last threshold is always the same as the user can see the wheel slow to 1 degree of rotation the same
        // distance before it stops each time. See further comments in doSpin function where this is used.
        randomLastThreshold = Math.floor(90 + (Math.random() * 90));

        // Set Spin button image back to disabled one, since can't click again until the wheel is reset.
        document.getElementById('spin_button').src       = spinButtonImgOff;
        document.getElementById('spin_button').className = "";

        // Now kick off the spinning of the wheel by calling the doSpin function.
        wheelState = 'spinning';
        doSpin();
    }
}

// ==================================================================================================================================================
// This function is used when doing a XMLHttpRequest to check the ready state and if got response then process it.
// ==================================================================================================================================================
function ajaxCallback()
{
    if (xhr.readyState < 4)
    {
        return;
    }

    // Note: You might want to add some code to deal with when get error response such as notify the user to try again etc.
    if (xhr.status !== 200)
    {
        return;
    }

    // If code got this far we know all is well, so call startSpin function passing the response to it (which should be angle or prize).
    // If you need to pass multiple parameters back from the server site process I would look in to doing some JSON then decoding it here.
    startSpin(xhr.responseText);
}

// ==================================================================================================================================================
// This function actually rotates the image making it appear to spin, a timer calls it repeatedly to do the animation.
// The wheel rotates until the currentAngle meets the targetAngle, slowing down at certain thresholds to give a nice effect.
// ==================================================================================================================================================
function doSpin()
{
    // Grab the context of the canvas.
    var surfaceContext = surface.getContext('2d');

    // Save the current context - we need this so we can restore it later.
    surfaceContext.save();

    // Translate to the center point of our image.
    surfaceContext.translate(wheel.width * 0.5, wheel.height * 0.5);

    // Perform the rotation by the angle specified in the global variable (will be 0 the first time).
    surfaceContext.rotate(DegToRad(currentAngle));

    // Translate back to the top left of our image.
    surfaceContext.translate(-wheel.width * 0.5, -wheel.height * 0.5);

    // Finally we draw the rotated image on the canvas.
    surfaceContext.drawImage(wheel, 0, 0);

    // And restore the context ready for the next loop.
    surfaceContext.restore();

    // ------------------------------------------
    // Add angle worked out below by thresholds to the current angle as we increment the currentAngle up until the targetAngle is met.
    currentAngle += angle;

    // ------------------------------------------
    // If the currentAngle is less than targetAngle then we need to rotate some more, so figure out what the angle the wheel is to be rotated
    // by next time this function is called, then set timer to call this function again in a few milliseconds.
    if (currentAngle < targetAngle)
    {
        // We can control how fast the wheel spins by setting how much is it to be rotated by each time this function is called.
        // In order to do a slowdown effect, we start with a high value when the currentAngle is further away from the target
        // and as it is with certian thresholds / ranges of the targetAngle reduce the angle rotated by - hence the slowdown effect.

        // The 360 * (power * 6) in the startSpin function will give the following...
        // HIGH power = 360 * (3 * 6) which is 6480
        // MED power = 360 * (2 * 6) which equals 4320
        // LOW power = 360 * (1 * 6) equals 2160.

        // Work out how much is remaining between the current angle and the target angle.
        var angleRemaining = (targetAngle - currentAngle);

        // Now use the angle remaining to set the angle rotated by each loop, reducing the amount of angle rotated by as
        // as the currentAngle gets closer to the targetangle.
        if (angleRemaining > 6480)
            angle = 55;
        else if (angleRemaining > 5000)		// NOTE: you can adjust as desired to alter the slowdown, making the stopping more gradual or more sudden.
            angle = 45;						// If you alter the forumla used to work out the targetAngle you may need to alter these.
        else if (angleRemaining > 4000)
            angle = 30;
        else if (angleRemaining > 2500)
            angle = 25;
        else if (angleRemaining > 1800)
            angle = 15;
        else if (angleRemaining > 900)
            angle = 11.25;
        else if (angleRemaining > 400)
            angle = 7.5;
        else if (angleRemaining > 220)					// You might want to randomize the lower threhold numbers here to be between a range
            angle = 3.80;								// otherwise if always within last 150 when the speed is set to 1 degree the user can
        else if (angleRemaining > randomLastThreshold)	// tell what prize they will win before the wheel stops after playing the wheel a few times.
            angle = 1.90;								// This variable is set in the startSpin function. Up to you if you want to randomise the others.
        else
            angle = 1;		// Last angle should be 1 so no risk of the wheel overshooting target if using preDetermined spin mode
        // (only a problem if pre-Determined location is near edge of a segment).

        // Set timer to call this function again using the miliseconds defined in the speed global variable.
        // This effectivley gets creates the animation / game loop.

        // IMPORTANT NOTE:
        // Since creating this wheel some time ago I have learned than in order to do javascript animation which is not affected by the speed at which
        // a device can exectute javascript, a "frames per second" approach with the javscript function requestAnimationFrame() should be used.
        // I have not had time to learn about and impliment it here, so you might want to look in to it if this method of animation is not
        // smooth enough for you.
        spinTimer = setTimeout("doSpin()", theSpeed);
    }
    else
    {
        // currentAngle must be the same as the targetAngle so we have reached the end of the spinning.

        // Update this to indicate the wheel has finished spinning.
        // Not really used for anything in this example code, but you might find keeping track of the wheel state in a game you create
        // is handy as you can check the state and do different things depending on it (reset, spinning, won, lost etc).
        wheelState = 'stopped';

        // If to do prize dection then work out the prize pointed to.
        if ((doPrizeDetection) && (prizes))
        {
            // Get how many times the wheel has rotated past 360 degrees.
            var times360 = Math.floor(currentAngle / 360);

            // From this compute the angle of where the wheel has stopped - this is the angle of where the line between
            // segment 8 and segment 1 is because this is the 360 degree / 0 degree (12 o'clock) boundary when then wheel first loads.
            var rawAngle = (currentAngle - (360 * times360));

            // The value above is still not quite what we need to work out the prize.
            // The angle relative to the location of the pointer needs to be figured out.
            var relativeAngle =  Math.floor(pointerAngle - rawAngle);

            if (relativeAngle < 0)
                relativeAngle = 360 - Math.abs(relativeAngle);

            // Now we can work out the prize won by seeing what prize segment startAngle and endAngle the relativeAngle is between.
            for (x = 0; x < (prizes.length); x ++)
            {
                if ((relativeAngle >= prizes[x]['startAngle']) && (relativeAngle <= prizes[x]['endAngle']))
                {
                    // Do something with the knowlege. For this example the user is just alerted, but you could play a sound,
                    // change the innerHTML of a div to indicate the prize etc - up to you.
                    alert("You won " + prizes[x]['name'] + "!\nClick 'Play Again' to have another go.");
                    break;
                }
            }
        }

        // ADD YOUR OWN CODE HERE.
        // If no prize detection then up to you to do whatever you want when the spinning has stopped.
    }
}

// ==================================================================================================================================================
// Quick little function that converts the degrees to radians.
// ==================================================================================================================================================
function DegToRad(d)
{
    return d * 0.0174532925199432957;
}

// ==================================================================================================================================================
// This function sets the class name of the power TDs to indicate what power has been selected, and also sets power variable used by startSpin code.
// It is called by the onClick of the power table cells on the page.
// ==================================================================================================================================================
function powerSelected(powerLevel)
{
    // In order to stop the change of power duing the spinning, only do this if the wheel is in a reset state.
    if (wheelState == 'reset')
    {
        // Reset all to grey incase this is not the first time the user has selected the power.
        document.getElementById('pw1').className = "";
        document.getElementById('pw2').className = "";
        document.getElementById('pw3').className = "";

        // Now light up all cells below-and-including the one selected by changing the class.
        if (powerLevel >= 1)
            document.getElementById('pw1').className = "pw1";

        if (powerLevel >= 2)
            document.getElementById('pw2').className = "pw2";

        if (powerLevel >= 3)
            document.getElementById('pw3').className = "pw3";

        // Set internal power variable.
        power = powerLevel;

        // Light up the spin button by changing it's source image and adding a clickable class to it.
        document.getElementById('spin_button').src = spinButtonImgOn;
        document.getElementById('spin_button').className = "clickable";
    }
}

// ==================================================================================================================================================
// This function re-sets all vars as re-draws the wheel at the original position. Also re-sets the power and spin buttons on the example wheel.
// ==================================================================================================================================================
function resetWheel()
{
    // Ensure that if wheel is spining then it is stopped.
    clearTimeout(spinTimer);

    // Re-set all vars to do with spinning angles.
    angle 		 = 0;
    targetAngle  = 0;
    currentAngle = 0;
    power        = 0;

    // Update styels of power buttons so they appear grey again.
    document.getElementById('pw1').className = "";
    document.getElementById('pw2').className = "";
    document.getElementById('pw3').className = "";

    // Make spin button disabled again until power is selected.
    document.getElementById('spin_button').src       = spinButtonImgOff;
    document.getElementById('spin_button').className = "";

    // Set back to reset so that power selection and click of Spin button work again.
    wheelState = 'reset';

    // Call function to draw wheel in start-up poistion.
    initialDraw();
}









//-----------------------------------------------
// Coin Flip
//-----------------------------------------------

var framenum = 0;
var framecnt = 0;
var flipping = null;
var choice = 0;
var headcnt = 0;
var tailcnt = 0;
var pict = new Array(3, 4, 1, 4);
var cachedimages = new Array(5);
cachedimages[0] = new Image();

cachedimages[0].src = "styles//heads.jpg";
cachedimages[1] = new Image();
cachedimages[1].src = "styles/tailsma1.jpg";
cachedimages[2] = new Image();
cachedimages[2].src = "styles/tailsma.jpg";
cachedimages[3] = new Image();
cachedimages[3].src = "styles/heads1.jpg";
cachedimages[4] = new Image();
cachedimages[4].src = "styles/dist.jpg";

function posclicked() {

    if (flipping == null) {
        if (Math.random() < 0.5) {
            choice = 0;
            headcnt++;
        }
        else {
            choice = 2;
            tailcnt++;
        }
        framecnt = 0;
        animate();
    }
}

function animate() {
    framenum = (framecnt) % 4;
    window.document.coin.src = cachedimages[pict[framenum]].src;
    framecnt++;
    if ((framecnt > 8) && (framenum == choice)) {
        window.document.coin.src = cachedimages[framenum].src;
        flipping = null;
        report();
    }
    else
        flipping = setTimeout("animate()", 30);
}













