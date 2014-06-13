'use strict';


var app = angular.module('ProbabilityApp');

app.service('ProbabilityService', function(){

    return{
        getRandomColor:function() {
            var letters = '0123456789ABCDEF'.split(""),
                color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        getImageURL:function(img){
            return "images/"+img+".png";
        }
    };
});

app.controller('DiceCtrl', function ($scope,$interval,$timeout,ProbabilityService) {
    var rollingImgs = [
        ["die-1","dices-1","die-1","dicet-1"],
        ["die-2","dices-2","die-2","dicet-2"],
        ["die-3","dices-3","die-3","dicet-3"],
        ["die-4","dices-4","die-4","dicet-4"],
        ["die-5","dices-5","die-5","dicet-5"],
        ["die-6","dices-6","die-6","dicet-6"]
    ],
        faces = [
            { id:1, img:ProbabilityService.getImageURL("die-1") },
            { id:2, img:ProbabilityService.getImageURL("die-2") },
            { id:3, img:ProbabilityService.getImageURL("die-3") },
            { id:4, img:ProbabilityService.getImageURL("die-4") },
            { id:5, img:ProbabilityService.getImageURL("die-5") },
            { id:6, img:ProbabilityService.getImageURL("die-6") }
        ],
        canvas =  document.getElementById("dicecanvas"),
        ctx = canvas.getContext("2d"),
        dice, i,
        gravity = 0.2,
        bounceFactor = 0.5,
        updates,timer,numupdates=0,
        stopRoll = false;

    canvas.height = $scope.canvasHeight;
    canvas.width = $scope.canvasWidth;

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
            ctx.clearRect(0, 0, $scope.canvasWidth, $scope.canvasHeight);
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
                if(dice[i].y + dice[i].height > $scope.canvasHeight) {
                    dice[i].y = $scope.canvasHeight - dice[i].height;
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
                $scope.diceResults.push(d);
            }
        }
    };

    var drawFunc = function() {
        var image = new Image();

        if(!stopRoll){//we're looping through die faces
            var faceImages = [];
            this.faces.forEach(function(face){
                  faceImages = $.merge(faceImages,  rollingImgs[face-1] );
            });
            this.index = getDieAnimationImage(this.direction,this.index,faceImages);
            image.src = ProbabilityService.getImageURL( faceImages[this.index] );
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
                x: ($scope.canvasWidth/10)*i + 15,
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
                facesToReturn.push(face);
            }

        });
        return facesToReturn;
    };

    var getDieAnimationImage =  function(directionInt,index,faces){
        if(numupdates%6===0){
            if(angular.isNumber(directionInt) && (directionInt % 2 === 0)){
                return ( index === 0 ) ? faces.length-1 : index-1;
            }else{//spin other direction
                return ( index === faces.length-1 ) ? 0 : index+1;
            }
        }else{
            return index;
        }
    };

});
app.controller('CardCtrl', function ($scope,ProbabilityService){
    var flipped = false,
        NUM_CARDS = 52;

    $scope.back = ProbabilityService.getImageURL("cardback");
    $scope.results = [];

    $scope.flip = function(){
        if(!flipped){
            var card = Math.floor(Math.random()*NUM_CARDS)+1;
            $scope.card = ProbabilityService.getImageURL(card);
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
app.controller('MarbleCtrl', function ($scope,$interval,$timeout,ProbabilityService){
    var canvas = document.getElementById("marblecanvas"),
        ctx = canvas.getContext("2d"),
        BALL_RADIUS = 15,
        balls,bounceFactor = 0.1,
        updates,numBallsCreated;

    canvas.height = $scope.canvasHeight;
    canvas.width = $scope.canvasWidth;

    $scope.running = false;

    $scope.MAXDIFFBALLS = 10;

    $scope.ballObjects = [
        {name:'blue',   number:1,   color:'blue'   },
        {name:'orange', number:1,   color:'orange' },
        {name:'green',  number:1,   color:'green'  }
    ];

    $scope.ballTypeCount = $scope.ballObjects.length;

    $scope.ballsChanged = function(){

        if($scope.ballTypeCount>$scope.MAXDIFFBALLS){
            $scope.ballTypeCount=$scope.MAXDIFFBALLS;
            $scope.$apply();
        }

        while($scope.ballTypeCount > $scope.ballObjects.length){
            var sliceobj = {"name" : $scope.ballObjects.length+1,   "color" : ProbabilityService.getRandomColor(),   "number" : 1};
            $scope.ballObjects.push(sliceobj);
        }

        while($scope.ballTypeCount < $scope.ballObjects.length){
            $scope.ballObjects.splice($scope.ballObjects.length-1, 1);
        }
        $scope.init();
    };

    $scope.removeItem = function(index){
        $scope.values.splice(index, 1);
        $scope.ballTypeCount--;
        $scope.createArcs();
    };

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

    $scope.runMarbleAni = function(){
        $( "#marblejar" ).effect( "shake" );
        $timeout(function(){//pause a beat before releasing balls
            $scope.running = true;
            updates = $interval(update, 1000/60);
            setBalls();
        },50);
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
            if( balls[i].x<0 || balls[i].x>$scope.canvasWidth){
                balls[i].vx *= -bounceFactor;
                balls[i].dx=-balls[i].dx;
            }

            if( balls[i].y<0 || balls[i].y>$scope.canvasHeight){
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
        var radialGradient = ctx.createRadialGradient(this.x+2, this.y+2, BALL_RADIUS, this.x+2, this.y+2, 1);
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
        numBallsCreated = 0;

        $scope.ballObjects.forEach(function(ball){
            for(i=0;i<ball.number;i++){
                colors.push(ball.color);
            }
        });

        for(i=0;i<totalBalls();i++){
            balls.push( createBall(colors[i]));
        }
    };

    var ballsPerRow = function(ballwidth,canvasWidth,padding){
        return Math.floor( ( canvasWidth- ( 2 * padding ) )/ballwidth );
    };

    var ballInitPos = function(numballs,width){
        var padding=30, row = 1, loc = {},
            ballsInRow = ballsPerRow(30,width,padding);

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
        numBallsCreated++;
        return {
            x: ballInitPos(numBallsCreated,$scope.canvasWidth).x,
            y: ballInitPos(numBallsCreated,$scope.canvasWidth).y,
            radius: BALL_RADIUS,
            color: color,
            vx: Math.floor(Math.random()*10),
            vy: Math.floor(Math.random()*10),
            dx: Math.floor(Math.random()*10),
            dy: Math.floor(Math.random()*10),
            draw: drawFunc
        };
    };

    var totalBalls = function(){
        var totalBalls = 0;
        $scope.ballObjects.forEach(
            function(ball){
                totalBalls+=ball.number;
            }
        );
        return totalBalls;
    };

    var clearCanvas = function() {
        ctx.clearRect(0, 0, $scope.canvasWidth, $scope.canvasHeight);
    };
    var reset = function(){
        clearCanvas();
        setBalls();
        for(var i =0;i<balls.length;i++) {
            balls[i].draw();
        }
    };
});
app.controller('CoinCtrl', function ($scope,$interval,ProbabilityService) {
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
        $scope.coinImage = ProbabilityService.getImageURL(img);
    }

    function janimate(starting){
        if(starting){
            $('#coin').addClass('flipup');
        }else{
            $('#coin').removeClass('flipup');
        }

    }

});
app.controller('SpinCtrl', function ($scope, ProbabilityService) {

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
        $scope.ballObjects.splice(index, 1);
        $scope.numSlices--;
        $scope.init();
    };

    $scope.slicesChanged = function(){

        if($scope.numSlices>$scope.MAXNUMSLICES){
            $scope.numSlices=$scope.MAXNUMSLICES;
            $scope.$apply();
        }

        while($scope.numSlices > $scope.values.length){
            var sliceobj = {"name" : $scope.values.length+1,   "color" : ProbabilityService.getRandomColor(),   "value" : 10};
            $scope.values.push(sliceobj);
        }

        while($scope.numSlices < $scope.values.length){
            $scope.values.splice($scope.values.length-1, 1);
        }
        $scope.createArcs();
    };

    var width = 338,
        height = 482,
        angle = 0,
        radius = Math.min(width, height) / 2,
        path,
        text;


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
        .attr("xlink:href", ProbabilityService.getImageURL("spinback") );

    var wheelg = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .append("g");

    $scope.createArcs = function(){
        if(arcGroup){
            arcGroup.remove();
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

    function pieVal(pv){
        var slice = $scope.values.filter(function( obj ) {
            return obj.name === pv.data.name;
        })[0];
        slice.startAngleDeg = radiansToDegrees(pv.startAngle);
        slice.endAngleDeg = radiansToDegrees(pv.endAngle);
    }

    $scope.change = function(){
        for(var i = 0 ;i<$scope.values.length;i++){
            if( typeof $scope.values[i].value !== "number" ){
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
                    .each("end", function(){ getResultSlice( angle % 360 ); } )
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

app.directive('probDice', function(){
    return{
        scope: {
            canvasHeight: '@canvasHeight',
            canvasWidth:  '@canvasWidth'
        },
        template:   '<div class="col" ng-controller="DiceCtrl">' +
                        '<div class="leftCol">' +
                            '<p><label>Dice:</label>' +
                            '<input min="0" max="10" ng-disabled="running" type="number" ng-model="numDice" ng-change="numDiceChanged()" /></p>' +
                            '<button ng-click="dice()" style="margin-bottom:10px">Roll</button>' +
                            '<canvas id="dicecanvas" class="throwingCanvas"></canvas>' +
                        '</div>' +
                        '<div class="rightCol">' +
                            '<p>Die Faces:</p>' +
                            '<div class="itemconfig" ng-repeat="die in diceValues">{{die.id}}' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[0]"/>' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[1]"/>' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[2]"/>' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[3]"/>' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[4]"/>' +
                                '<input class="singleinput" type="number" min="1" max="6" ng-model="die.faces[5]"/>' +
                            '</div>' +
                            '<p>Results:</p>' +
                            '<hr>' +
                                '<p ng-repeat="result in diceResults"> Die {{result.num}} |   {{result.rolls.join(", ")}} </p>' +
                        '</div>' +
                    '</div>',
        controller:'DiceCtrl',
        restrict: 'E'
    };
});
app.directive('probCards', function(){
   return{
       scope: {
           height: '@height',
           width:  '@width'
       },
       template:    '<div class="col" ng-controller="CardCtrl">' +
                       '<div class="leftCol">' +
                           '<div class="flip-container" >' +
                               '<div class="flipper" ng-click="flip()">' +
                                   '<div class="front" img="{{back}}"></div>' +
                                   '<div class="back" back-img img="{{card}}"></div>' +
                               '</div>' +
                           '</div>' +
                       '</div>' +
                       '<div class="rightCol" style="width: 250px;float: right">' +
                           '<p>Cards Drawn:</p>' +
                           '<p ng-repeat="card in results track by $index">' +
                               '<img ng-src="{{card.img}}" style="width: 28px;height: 41px">{{card.name}}' +
                           '</p>' +
                       '</div>' +
                   '</div>',
       controller:'CardCtrl',
       restrict: 'E'
   };
});
app.directive('probMarbles', function(){
    return{
        scope: {
            canvasHeight: '@canvasHeight',
            canvasWidth:  '@canvasWidth'
        },
        template:   '<div class="col" ng-controller="MarbleCtrl" ng-init="init()">' +
                        '<div class="leftCol" style="width: 450px;">' +
                            '<label>Number of slices</label>' +
                            '<input class="smallinput" type="number" max="{{MAXDIFFBALLS}}" min="0" ng-model="ballTypeCount" ng-change="ballsChanged()"/>' +
                            '<form ng-submit="runMarbleAni()">' +
                                '<div class="itemconfig" ng-repeat="balltype in ballObjects">' +
                                    '<input class="smallinput" type="text"   ng-model="balltype.name"  ng-change="init()"  />' +
                                    '<input class="smallinput" type="number" ng-model="balltype.number" ng-change="init()" />' +
                                    '<input class="colorpicker" colorpicker  ng-model="balltype.color" ng-change="init()"  />' +
                                    '<a class="removeitem" ng-click="removeItem($index)" >X</a>' +
                                '</div>' +
                                '<input type="submit" value="Run" ng-disabled="running">' +
                                '<input type="button" ng-if="running"  value="Choose"  ng-click="choose()">' +
                                '<input type="button" ng-if="running"  value="Stop"    ng-click="stop()">' +
                            '</form>' +
                       '</div>' +
                        '<div id="marblejar" class="rightCol" style="width: 350px">' +
                            '<canvas id="marblecanvas" class="throwingCanvas"></canvas>' +
                            '<div class="binarea">' +
                                '<label>Bin   <a ng-click="clearBalls()">clear</a></label>' +
                                '<div class="bindiv">' +
                                    '<span class="ballholder" ng-repeat="ball in binnedBalls track by $index" >' +
                                        '<div class="circle" style="{{ball.color+\';\'+ball.grad}}"/>' +
                                    '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
        controller:'MarbleCtrl',
        restrict: 'E'
    };
});
app.directive('probCoin', function(){
    return{
        scope: {
            height: '@height',
            width:  '@width'
        },
        template:   '<div class="col" >' +
                        '<div class="leftCol">' +
                            '<form>' +
                                '<p><label> WEIGHT </label></p>' +
                                '<p><label>Heads:</label><input min="0" max="100" type="number" ng-model="tailsWeight" />%</p>' +
                                '<p><label>Tails:</label><input min="0" max="100" type="number" ng-model="headsWeight" />%</p>' +
                            '</form>' +
                            '<div id="coin" class="coin" ng-click="posclicked()">' +
                                '<img style="height: 100%; width: 100%" ng-src="{{coinImage}}"/>' +
                            '</div>' +
                        '</div>' +
                        '<div class="rightCol">' +
                            '<p>Results:</p>' +
                            '<hr>' +
                            '<p>Heads: {{headsCount}}</p>' +
                            '<p>Tails: {{tailsCount}}</p>' +
                        '</div>' +
                    '</div>',
        controller:"CoinCtrl",
        restrict: 'E'
    };
});
app.directive('probSpinner',function(){
    return{
        scope: {
            height: '@height',
            width:  '@width'
        },
        template:   '<div class="col" ng-init="begin()">' +
                        '<div class="leftCol" style="float: left;width:700px" >' +
                            '<div id="wheel" style="float: right"></div>' +
                            '<div>' +
                                '<label>Number of slices</label>' +
                                '<input class="smallinput" type="number" max="{{MAXNUMSLICES}}" min="0" ng-model="numSlices" ng-change="slicesChanged()" />' +
                                '<form ng-submit="startSpin()" >' +
                                    '<input type="submit" value="Spin" >' +
                                    '<div class="itemconfig" ng-repeat="slice in values">' +
                                    '<input class="smallinput" type="text"   ng-model="slice.name"  ng-change="change()"  />' +
                                    '<input class="smallinput" type="number" ng-model="slice.value" ng-change="change()" />' +
                                    '<input class="colorpicker" colorpicker  ng-model="slice.color" ng-change="change()"  />' +
                                    '<a class="removeitem" ng-click="removeItem($index)" >X</a>' +
                                    '</div>' +
                                    '<br><br>' +
                                '</form>' +
                            '</div>' +
                        '</div>' +
                        '<div class="rightCol" style="width: 100px">' +
                            '<p>Results:</p>' +
                            '<p ng-repeat="result in results track by $index"> {{result}} </p>' +
                        '</div>' +
                    '</div>',
        controller:"SpinCtrl",
        restrict: 'E'
    };
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
            if (!ngModel){
                return;
            }
            ngModel.$render = function () {
                elem.spectrum('set', ngModel.$viewValue || '#fff');
            };
            elem.on('change', function () {
                scope.$apply(function () {
                    ngModel.$setViewValue( elem.spectrum('get').toRgbString() );
                });
            });
        }
    };
});



