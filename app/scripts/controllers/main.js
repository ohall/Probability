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
        canvas =  document.getElementById("dicecanvas"),
        ctx = canvas.getContext("2d"),
        W = 350,
        H = 350,
        dice, i,
        NUM_DICE = 4,
        gravity = 0.2,
        bounceFactor = 0.5,
        running = false,
        updates,numupdates=0,
        stopRoll = false;

    canvas.height = H; canvas.width = W;
    $scope.diceResults = [];

    setup();

    function setup(){
        for(var i = 0;i<NUM_DICE;i++){
            var d = {};
            d.num = i+1;
            d.rolls = [];
            $scope.diceResults.push(d);
        }
    }

    var drawFunc = function() {
        var image = new Image;

        if(!stopRoll){//we're looping through die faces
            this.index = getDieAnimationImage(this.direction,this.index);
            image.src = rollingImgs[this.index];
            ctx.drawImage(image, this.x, this.y);
        }else{
            if(!this.stopped) {//we're choosing a face to land on
                var resultIndex = Math.floor(Math.random() * faces.length);
                image.src = faces[resultIndex];
                this.rolls.push(resultIndex+1);
                this.stopped = true;
                this.image = image;
            }
            //we're drawing with the chose face
            ctx.drawImage(this.image, this.x, this.y);
        }
    };

    var getDieAnimationImage =  function(directionInt,index){
        if(numupdates%6===0){
            if(angular.isNumber(directionInt) && (directionInt % 2 == 0)){
                return ( index === 0 ) ? rollingImgs.length-1 : index-1;
            }else{//spin other direction
                return ( index === rollingImgs.length-1 ) ? 0 : index+1;
            }
        }else{
            return index;
        }
    };

    function setDice(pdrawFunc){
        stopRoll = false;
        dice = [];
        for(i=0;i<NUM_DICE;i++){
            var die = {
                x: (W/10)*i + 15,
                y: Math.floor(Math.random()*NUM_DICE),
                height:32,
                stopped:false,
                rolls:$scope.diceResults[i].rolls,
                index:i,
                direction:i,
                image:null,
                vx: 0,
                vy: Math.floor(Math.random()*NUM_DICE),
                draw: pdrawFunc
            };
            dice.push(die);
        }
    }

    $scope.dice = function(){
        setDice(drawFunc);
        function clearCanvas() {
            ctx.clearRect(0, 0, W, H);
        }

        function update() {
            numupdates++;
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
            numupdates = 0;
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
});

app.controller('CardCtrl', function ($scope){
    var flipped = false,
        NUM_CARDS = 52;

    $scope.back = "styles/cards/b1fv.png"
    $scope.results = [];

    $scope.flip = function(){
        if(!flipped){
            var card = Math.floor(Math.random()*NUM_CARDS)+1;
            $scope.card ="styles/cards/" + card + ".png";
            $scope.results.push( getCardString(card) );
            $('.flipper').addClass('flipit');
            flipped = true;
        }else{
            $('.flipper').removeClass('flipit');
            flipped = false;
        }
    };

    var getCardString = function(cardInt){
        var numbers = [ "Ace","King","Queen","Jack",
            "10","9","8","7","6","5","4","3","2"],
            suits   = ["Clubs", "Spades", "Hearts", "Diamonds" ],
            region  = cardInt/suits.length,
            num     = ( region%1===0 ) ? region-1 : Math.floor(region),
            suit    = ( ( cardInt%suits.length ) === 0 ) ? 3 : cardInt%suits.length-1;
        return numbers[num] + " of " + suits[suit];
    };
});

app.controller('MarbleCtrl', function ($scope,$interval){
    var canvas = document.getElementById("marblecanvas"),
        ctx = canvas.getContext("2d");

    var W = 350,
        H = 450;

    canvas.height = H; canvas.width = W;

    var balls,
        gravity = 0.2,
        bounceFactor = 0.8,
        running = false,
        updates,numballs=0;

    $scope.red = 0;
    $scope.green = 0;
    $scope.blue = 0;
    $scope.yellow = 0;
    $scope.orange = 0;
    $scope.purple = 0;


    var drawFunc = function() {
        // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    function setBalls(){
        var i;
        balls = [];
        numballs = 0;
        for(i=0;i<$scope.red;i++){
            balls.push(createBall("red"));
        }
        for(i=0;i<$scope.green;i++){
            balls.push(createBall("green"));
        }
        for(i=0;i<$scope.blue;i++){
            balls.push(createBall("blue"));
        }
        for(i=0;i<$scope.yellow;i++){
            balls.push(createBall("yellow"));
        }
        for(i=0;i<$scope.orange;i++){
            balls.push(createBall("orange"));
        }
        for(i=0;i<$scope.purple;i++){
            balls.push(createBall("purple"));
        }
    }

    var createBall = function(color){
        numballs++;
        return {
            x: (W/totalBalls())*numballs + 15,
            y: Math.floor(Math.random()*10),
            radius: 15,
            color: color,
            // Velocity components
            vx: 0,
            vy: Math.floor(Math.random()*10),
            draw: drawFunc
        };
    };

    var totalBalls = function(){
        return  $scope.red +
                $scope.green +
                $scope.blue +
                $scope.yellow +
                $scope.orange +
                $scope.purple;
    };

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

app.controller("CoinCtrl", function ($scope,$interval) {
    coinImage("heads");

    var framenum = 0,
        framecnt = 0,
        flipping = null,
        choice = 0,
        headcnt = 0,
        tailcnt = 0,
        pict = [3, 4, 1, 4],
        cachedimages = ["heads","tailsma1","tailsma","heads1","dist"];

    $scope.tailsCount = 0;
    $scope.headsCount = 0;

    $scope.posclicked = function() {
        janimate(true);
        if (flipping === null) {
            if (Math.random() < 0.5) {
                choice = 0;
                headcnt++;
            }else {
                choice = 2;
                tailcnt++;
            }
            framecnt = 0;
            flipping = $interval(ani, 30);
        }
    };

    function ani() {
        framenum = (framecnt) % 4;
        coinImage(cachedimages[pict[framenum]]);
        framecnt++;
        if ((framecnt > 8) && (framenum === choice) ) {
            janimate(false);
            coinImage(cachedimages[choice]);
            $interval.cancel(flipping);
            flipping = null;
            $scope.tailsCount = tailcnt;
            $scope.headsCount = headcnt;
        }
    }

    function coinImage(img){
        $scope.coinImage = "styles/"+img+".png";
    }

    function janimate(starting){
        if(starting){
            $('#coin').addClass('flipup');
        }else{
            $('#coin').removeClass('flipup');
        }

    }

});

app.controller("SpinCtrl", function ($scope) {

    var canvasId         = "myDrawingCanvas",
        wheelImageName   = "styles/prizewheel.png",
        theSpeed         = 20,
        pointerAngle     = 0,
        doPrizeDetection = true,
        spinMode         = "random",
        prizes = [
        {"name" : "1", "startAngle" : 0,   "endAngle" : 44},
        {"name" : "2", "startAngle" : 45,  "endAngle" : 89},
        {"name" : "3", "startAngle" : 90,  "endAngle" : 134},
        {"name" : "4", "startAngle" : 135, "endAngle" : 179},
        {"name" : "5", "startAngle" : 180, "endAngle" : 224},
        {"name" : "6", "startAngle" : 225, "endAngle" : 269},
        {"name" : "7", "startAngle" : 270, "endAngle" : 314},
        {"name" : "8", "startAngle" : 315, "endAngle" : 360}
        ],
        surface,wheel,
        angle = 0,
        targetAngle = 0,
        currentAngle = 0,
        randomLastThreshold = 150,
        spinTimer;

    $scope.wheelState = 'reset';

    $scope.results = [];

    $scope.power = 0;
    $scope.begin = function(){
        surface = document.getElementById(canvasId);
        if (surface.getContext){
            wheel = new Image();
            wheel.onload = initialDraw;
            wheel.src = wheelImageName;
        }
    };

    function initialDraw(){
        var surfaceContext = surface.getContext('2d');
        surfaceContext.drawImage(wheel, 0, 0);
    }

    var doSpin = function(){
        var surfaceContext = surface.getContext('2d');
        surfaceContext.save();
        surfaceContext.translate(wheel.width * 0.5, wheel.height * 0.5);
        surfaceContext.rotate(DegToRad(currentAngle));
        surfaceContext.translate(-wheel.width * 0.5, -wheel.height * 0.5);
        surfaceContext.drawImage(wheel, 0, 0);
        surfaceContext.restore();
        currentAngle += angle;
        if (currentAngle < targetAngle){

            var angleRemaining = (targetAngle - currentAngle);

            if (angleRemaining > 6480){
                angle = 55;
            }else if (angleRemaining > 5000){
                angle = 45;
            }else if (angleRemaining > 4000){
                angle = 30;
            }else if (angleRemaining > 2500){
                angle = 25;
            }else if (angleRemaining > 1800){
                angle = 15;
            }else if (angleRemaining > 900){
                angle = 11.25;
            }else if (angleRemaining > 400){
                angle = 7.5;
            }else if (angleRemaining > 220){
                angle = 3.80;
            }else if (angleRemaining > randomLastThreshold){
                angle = 1.90;
            }else{
                angle = 1;
            }
            spinTimer = setTimeout(doSpin, theSpeed);
        }else{
            $scope.wheelState = 'stopped';
            if ((doPrizeDetection) && (prizes)){
                var times360 = Math.floor(currentAngle / 360);
                var rawAngle = (currentAngle - (360 * times360));
                var relativeAngle =  Math.floor(pointerAngle - rawAngle);

                if (relativeAngle < 0){
                    relativeAngle = 360 - Math.abs(relativeAngle);
                }
                for (var x = 0; x < (prizes.length); x ++){
                    if ((relativeAngle >= prizes[x]['startAngle']) && (relativeAngle <= prizes[x]['endAngle'])){
                        $scope.results.push( prizes[x]['name'] );
                        $scope.$apply();
                        break;
                    }
                }
            }
        }
    };


    $scope.startSpin = function(determinedValue){
        var stopAngle = undefined;
        if (spinMode == "random"){
            stopAngle = Math.floor(Math.random() * 360);
        }else if (spinMode == "determinedAngle"){
            stopAngle = determinedValue;
        }else if (spinMode == "determinedPrize"){
            stopAngle = Math.floor(prizes[determinedValue]['startAngle'] + (Math.random() * (prizes[determinedValue]['endAngle'] - prizes[determinedValue]['startAngle'])));
        }

        if ((typeof(stopAngle) !== 'undefined') && ($scope.wheelState == 'reset') && ($scope.power)){
            stopAngle = (360 + pointerAngle) - stopAngle;
            targetAngle = (360 * ($scope.power * 6) + stopAngle);
            randomLastThreshold = Math.floor(90 + (Math.random() * 90));
            $scope.wheelState = 'spinning';
            doSpin();
        }
    };

    function DegToRad(d){
        return d * 0.0174532925199432957;
    }

    $scope.resetWheel = function(){
        clearTimeout(spinTimer);
        angle 		 = 0;
        targetAngle  = 0;
        currentAngle = 0;
        $scope.power = 0;
        $scope.wheelState = 'reset';
        initialDraw();
    }


});

app.directive('backImg', function(){
    return function (scope, element, attrs) {
        attrs.$observe('img', function(pUrl) {
            element.css({
                'background-image': 'url(' + pUrl + ')',
                'background-repeat': 'no-repeat'
            });
        });
    };
});







