'use strict';


var app = angular.module('ProbabilityApp');

app.controller('DiceCtrl', function ($scope,$interval,$timeout) {
    var rollingImgs = [
        [
            "styles/die-1.gif",
            "styles/dices-1.gif",
            "styles/die-1.gif",
            "styles/dicet-1.gif"
        ],
        [
            "styles/die-2.gif",
            "styles/dices-2.gif",
            "styles/die-2.gif",
            "styles/dicet-2.gif",
        ],
        [
            "styles/die-3.gif",
            "styles/dices-3.gif",
            "styles/die-3.gif",
            "styles/dicet-3.gif"
        ],
        [
            "styles/die-4.gif",
            "styles/dices-4.gif",
            "styles/die-4.gif",
            "styles/dicet-4.gif"
        ],
        [
            "styles/die-5.gif",
            "styles/dices-5.gif",
            "styles/die-5.gif",
            "styles/dicet-5.gif"
        ],
        [
            "styles/die-6.gif",
            "styles/dices-6.gif",
            "styles/die-6.gif",
            "styles/dicet-6.gif"
        ]
    ],
        faces = [
            { id:1, img:"styles/die-1.gif" },
            { id:2, img:"styles/die-2.gif" },
            { id:3, img:"styles/die-3.gif" },
            { id:4, img:"styles/die-4.gif" },
            { id:5, img:"styles/die-5.gif" },
            { id:6, img:"styles/die-6.gif" }
        ],
        canvas =  document.getElementById("dicecanvas"),
        ctx = canvas.getContext("2d"),
        W = 350,
        H = 350,
        dice, i,
        gravity = 0.2,
        bounceFactor = 0.5,
        updates,timer,numupdates=0,
        stopRoll = false;

    canvas.height = H; canvas.width = W;

    $scope.running = false;
    $scope.diceResults = [];
    $scope.numDice = 1;
    $scope.diceChanged = true;

    $scope.diceValues = [
        {id:1, faces:[ 1, 2, 3, 4, 5, 6 ]}
    ];

    $scope.dice = function(){
        stop();
        setup();
        setDice(drawFunc);

        $scope.diceChanged = false;

        if(timer){
            $timeout.cancel(timer);
            timer = undefined;
        }

        function clearCanvas() {
            ctx.clearRect(0, 0, W, H);
        }

        function stop(){
            $scope.running = false;
            $interval.cancel(updates);
            updates = undefined;
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

        if(!$scope.running){
            $scope.running = true;
            numupdates = 0;
            updates = $interval(update, 1000/60);
        }else{
            stop();
            clearCanvas();
        }

        $timeout(function(){
            stopRoll = true;
        },2500);

        timer = $timeout(stop,3000);
    };

    $scope.numDiceChanged = function(){
        $scope.diceChanged = true;
        $scope.diceResults = [];
        var index = $scope.diceValues.length;
        while( $scope.numDice > $scope.diceValues.length ){
            index++;
            $scope.diceValues.push({id:1, faces:[ 1, 2, 3, 4, 5, 6 ]});
        }
    };

    var setup = function(){
        for(var i = 0;i<$scope.numDice;i++){
            var d = {};
            d.num = i+1;
            d.rolls = [];
            if($scope.diceChanged){
                $scope.diceResults[i] = d;
            }else if(!$scope.diceResults[i]){
                $scope.diceResults.push(d)
            }
        }
    };

    var drawFunc = function() {
        var image = new Image;

        if(!stopRoll){//we're looping through die faces
            var faceImages = [];
            this.faces.forEach(function(face){
                  faceImages = $.merge(faceImages,rollingImgs[face-1]);
            });
            this.index = getDieAnimationImage(this.direction,this.index,faceImages);
            image.src = faceImages[this.index];
            ctx.drawImage(image, this.x, this.y);
        }else{
            if(!this.stopped) {//we're choosing a face to land on
                var resultIndex = Math.floor(Math.random() * this.faces.length);
                var resultObj = faces[ this.faces[resultIndex]-1 ];
                image.src  = resultObj.img;
                this.rolls.push( resultObj.id );
                this.stopped = true;
                this.image = image;
            }
            //we're drawing with the chose face
            ctx.drawImage(this.image, this.x, this.y);
        }
    };

    var setDice = function(pdrawFunc){
        stopRoll = false;
        dice = [];
        for(i=0;i<$scope.diceValues.length;i++){
            var die = {
                x: (W/10)*i + 15,
                y: Math.floor(Math.random()*$scope.numDice),
                height:32,
                stopped:false,
                rolls:$scope.diceResults[i].rolls,
                index:i,
                faces:getAvailableFaces( $scope.diceValues[i].faces ),
                direction:i,
                image:null,
                vx: 0,
                vy: Math.floor(Math.random()*$scope.numDice),
                draw: pdrawFunc
            };
            dice.push(die);
        }
    };

    var getAvailableFaces = function(allfaces){
        var facesToReturn = [];
        allfaces.forEach(function(face){
            if(facesToReturn.indexOf(face) === -1){
                facesToReturn.push(face)
            }

        });
        return facesToReturn;
    };

    var getDieAnimationImage =  function(directionInt,index,faces){
        if(numupdates%6===0){
            if(angular.isNumber(directionInt) && (directionInt % 2 == 0)){
                return ( index === 0 ) ? faces.length-1 : index-1;
            }else{//spin other direction
                return ( index === faces.length-1 ) ? 0 : index+1;
            }
        }else{
            return index;
        }
    };

});

app.controller('CardCtrl', function ($scope){
    var flipped = false,
        NUM_CARDS = 52;

    $scope.back = "styles/cards/b1fv.png";
    $scope.results = [];

    $scope.flip = function(){
        if(!flipped){
            var card = Math.floor(Math.random()*NUM_CARDS)+1;
            $scope.card ="styles/cards/" + card + ".png";
            var resItem = {};
            resItem.name = getCardString(card);
            resItem.img = $scope.card;
            $scope.results.push( resItem );
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

app.controller('MarbleCtrl', function ($scope,$interval,$timeout){
    var canvas = document.getElementById("marblecanvas"),
        ctx = canvas.getContext("2d"),
        W = 350,
        H = 350,
        BALLRADIUS = 15,
        balls,bounceFactor = 0.1,
        updates,timer,numballs= 0;

    canvas.height = H;
    canvas.width = W;

    $scope.running = false;

    $scope.red      = 1;
    $scope.green    = 1;
    $scope.blue     = 1;
    $scope.yellow   = 1;
    $scope.orange   = 1;
    $scope.purple   = 1;

    $scope.binnedBalls = [];

    $scope.choose = function(){
        var ballIndex = Math.floor(Math.random() * balls.length),
            selectedBall = balls[ ballIndex ],
            ballStyles = {};
        ballStyles.color = 'background-color:'+selectedBall.color;
        ballStyles.grad = 'background-image:-webkit-radial-gradient(55% 55%, circle farthest-side,#FFF,'+selectedBall.color+' 100%)';
        $scope.binnedBalls.push(ballStyles);
        selectedBall.radius = 0;
        update();
        balls.splice(ballIndex, 1);
    };

    $scope.marbles = function(){
        var done = function(){
            $scope.stop();
            $scope.choose();
        };

        if($scope.running){
            done()
        }

        setBalls();

        if(timer){
            $timeout.cancel(timer);
            timer = undefined;
        }

        if(!$scope.running){
            $scope.running = true;
            updates = $interval(update, 1000/60);
        }else{
            $scope.stop();
        }
//        timer = $timeout(done,1500);
    };

    $scope.init = function(){
        $scope.clearBalls();
        reset();
    };

    $scope.stop = function(){
        $scope.running = false;
        $interval.cancel(updates);
        updates = undefined;
        reset();
    };

    $scope.clearBalls = function(){
        $scope.binnedBalls = [];
    };

    var update = function() {
        clearCanvas();
        for(var i =0;i<balls.length;i++){
            balls[i].draw();
            if( balls[i].x<0 || balls[i].x>W){
                balls[i].vx *= -bounceFactor;
                balls[i].dx=-balls[i].dx;
            }

            if( balls[i].y<0 || balls[i].y>H){
                balls[i].vy *= -bounceFactor;
                balls[i].dy=-balls[i].dy;
            }
            balls[i].x+=balls[i].dx;
            balls[i].y+=balls[i].dy;
        }
    };
    var drawFunc = function() {
        // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);

        //createRadialGradient(x0, y0, r0, x1, y1, r1);
        var radialGradient = ctx.createRadialGradient(this.x+2, this.y+2, BALLRADIUS, this.x+2, this.y+2, 1);
        radialGradient.addColorStop(1,"#fff" );
        radialGradient.addColorStop(0, this.color);
        ctx.fillStyle = radialGradient;
        ctx.fill();
        ctx.closePath();
    };
    var setBalls = function(){
        var i,
        colors = [];
        balls = [];
        numballs = 0;
        for(i=0;i<$scope.red;i++){
            colors.push("red");
        }
        for(i=0;i<$scope.green;i++){
            colors.push("green");
        }
        for(i=0;i<$scope.blue;i++){
            colors.push("blue");
        }
        for(i=0;i<$scope.yellow;i++){
            colors.push("yellow");
        }
        for(i=0;i<$scope.orange;i++){
            colors.push("orange");
        }
        for(i=0;i<$scope.purple;i++){
            colors.push("purple");
        }

        for(i=0;i<totalBalls();i++){
            balls.push( createBall(colors[i]));
        }
    };
    var ballsPerRow = function(ballwidth,canvasWidth,padding){
        return Math.floor( ( canvasWidth- ( 2 * padding ) )/ballwidth );
    };
    var ballInitPos = function(numballs,width){
        var padding=30,
            row = 1,
            loc = {};

        var ballsInRow = ballsPerRow(30,width,padding);

        for(var i = 0;i<numballs;i++){
            if( i >= ballsInRow * row ){
                row++;
            }
        }
        loc.x = padding + ( numballs-( ballsInRow * (row-1)  ) ) * 30;
        loc.y = padding + 30 * row;
        return loc;
    };
    var createBall = function(color){
        numballs++;
        return {
            x: ballInitPos(numballs,W).x,
            y: ballInitPos(numballs,W).y,
            radius: BALLRADIUS,
            color: color,
            vx: Math.floor(Math.random()*10),
            vy: Math.floor(Math.random()*10),
            dx: Math.floor(Math.random()*10),
            dy: Math.floor(Math.random()*10),
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
    var clearCanvas = function() {
        ctx.clearRect(0, 0, W, H);
    };
    var reset = function(){
        clearCanvas();
        setBalls();
        for(var i =0;i<balls.length;i++) {
            balls[i].draw();
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
        cachedimages = ["heads","tailsma1","tailsma","heads1","dist"],
        odds = 0.5;

    $scope.tailsCount = 0;
    $scope.headsCount = 0;

    $scope.tailsWeight = 50;
    $scope.headsWeight = 50;

    $scope.$watch('tailsWeight', function () {
        $scope.headsWeight = 100-$scope.tailsWeight;
        odds = $scope.headsWeight/100;
    });

    $scope.$watch('headsWeight', function () {
        $scope.tailsWeight = 100-$scope.headsWeight;
        odds = $scope.headsWeight/100;
    });

    $scope.posclicked = function() {
        janimate(true);
        if (flipping === null) {
            if (Math.random() > odds) {
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

    $scope.MAXNUMSLICES = 10;


    var wheel,arcGroup,
        SPINDURATION = 5000,//ms
        NUMROTATIONS = 25;

    $scope.startSpin = function(){
        cycle();
    };

    $scope.values=[
        {"name" : "blue",   "color" : "blue",   "value" : 33},
        {"name" : "red",    "color" : "red",    "value" : 33},
        {"name" : "green",  "color" : "green",  "value" : 34}
    ];
    $scope.numSlices = $scope.values.length;
    $scope.wheelState = 'reset';
    $scope.results = [];

    $scope.removeItem = function(index){
        $scope.values.splice(index, 1);
        $scope.numSlices--;
        $scope.createArcs();
    };

    $scope.slicesChanged = function(){

        if($scope.numSlices>$scope.MAXNUMSLICES){
            $scope.numSlices=$scope.MAXNUMSLICES;
            $scope.$apply();
        }

        while($scope.numSlices > $scope.values.length){
            var sliceobj = {"name" : $scope.values.length+1,   "color" : getRandomColor(),   "value" : 10};
            $scope.values.push(sliceobj);
        }

        while($scope.numSlices < $scope.values.length){
            $scope.values.splice($scope.values.length-1, 1);
        }
        $scope.createArcs();
    };

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var width = 338,
        height = 482,
        angle = 0,
        radius = Math.min(width, height) / 2, path, text;


     var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = d3.select("#wheel").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("svg:image")
        .attr('width', width)
        .attr('height', height)
        .attr("xlink:href","styles/wheel_back.png");

    var wheelg = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .append("g");

    $scope.createArcs = function(){
        if(arcGroup){
            arcGroup.remove()
        }
        arcGroup = wheelg.selectAll(".arc")
            .data(pie( $scope.values ))
            .enter().append("g")
            .attr("class", "arc");

        path = arcGroup.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return d.data.color; })
            .each(function(d) { pieVal(d); })
            .each(function(d) { this._current = d; });

        text = arcGroup.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.name; });
    };


    var radiansToDegrees = function( rads ){
        return rads * (180/Math.PI);
    };

    var degreesToRadians = function(degrees) {
        return degrees * Math.PI / 180;
    };

    function pieVal(pv){
        var slice = $scope.values.filter(function( obj ) {
            return obj.name == pv.data.name;
        })[0];
        slice.startAngleDeg = radiansToDegrees(pv.startAngle);
        slice.endAngleDeg = radiansToDegrees(pv.endAngle);
    }

    $scope.change = function(){
        for(var i = 0 ;i<$scope.values.length;i++){
            if( !( typeof $scope.values[i].value === "number" ) ){
                $scope.values[i].value = 0;
            }
        }

        path = path.data(pie( $scope.values )); // compute the new angles
        path.transition()
            .duration(750)
            .style("fill", function(d) { return d.data.color; })
            .each(function(d) { pieVal(d); })
            .attrTween("d", arcTween); // redraw the arcs

        text.data(pie( $scope.values ));
        text.transition().ease("elastic").duration(750)
            .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
            .text(function(d) { return d.data.name; });
    };

    function cycle() {

        if(angle!==0){//reset the wheel to 0 for spin
            wheelg.transition()
                    .duration(250)
                    .ease("cubic-in")
                    .each("end", doSpin )
                    .attrTween("transform", function() { return d3.interpolateString("rotate(-"+angle+")" , "rotate(0)" );});
        }else{
            doSpin();
        }


        function doSpin(){
            var resultDegree = Math.random() * 360;
            angle = resultDegree * NUMROTATIONS;
            wheelg.transition()
                    .delay(250)
                    .each("end", function(){ getResultSlice( angle % 360 ) } )
                    .duration(SPINDURATION)
                    .attrTween("transform", function() { return d3.interpolateString("rotate(0)", "rotate(-" + angle + ")");});
        }


    }


    var getResultSlice = function(resultDeg){
        $scope.values.some(
            function( slice ) {
                if( slice.startAngleDeg < resultDeg && slice.endAngleDeg > resultDeg ){
                    $scope.results.push(slice.name);
                    $scope.$apply();
                    return true;
                }
            }
        );

    };


    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    $scope.createArcs();
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

app.directive('colorpicker', function(){
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ngModel) {
            elem.spectrum();
            if (!ngModel) return;
            ngModel.$render = function () {
                elem.spectrum('set', ngModel.$viewValue || '#fff');
            };
            elem.on('change', function () {
                scope.$apply(function () {
                    ngModel.$setViewValue( elem.spectrum('get').toRgbString() );
                });
            });
        }
    }
});

