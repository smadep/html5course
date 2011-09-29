/*
TODO:
styling
display move count
moving
check for end
reset

*/
var Cell = function(row, column){
    var that = this;
    this.row = row;
    this.column = column;
    this.moveTo = function (cell){
        that.row = cell.row;
        that.column = cell.column;
        };
    }
    
var Halma = function() { 
    
var that = this;
this.canvasElement = null;
this.moveCountElement = null;
this.moveCount = 0;
this.boardWidth = 9;
this.boardHeight = 9;
this.pieceWidth = 50;
this.pieceHeight = 50;
this.canvasWidth = function(){ return 1 + (that.boardWidth*that.pieceWidth);};
this.canvasHeight = function(){ return 1 + (that.boardHeight*that.pieceHeight);};

//this.getCell = function(row, column){
 //       return new Cell(row, column);
  //  };

this.nothingSelected = -1;

this.saveGame = function(){
    if (window.localStorage) {
        state = JSON.stringify(that.pieces);
        localStorage['halma.pieces'] = state;
        localStorage['halma.moveCount'] = that.moveCount; 
    }
    }
this.resumeGame = function(){
    if (window.localStorage && localStorage['halma.pieces']) {
        that.pieces = JSON.parse(localStorage['halma.pieces']);
        // create for each piece a new instance of the piece to get the moveTo handler back, because this one was not persisted
        for(i = 0; i < that.pieces.length; i++){
            that.pieces[i] = new Cell(that.pieces[i].row, that.pieces[i].column);
            }
        that.moveCount = localStorage['halma.moveCount'];
        return true;
    }
    return false;
    }    

this.isGameOver = function(){
    var i, piece;
    for (var i = 0; i < that.pieces.length; i++) {
        piece = that.pieces[i];
        if (piece.row > 2 || piece.col < that.boardWidth - 3) {
            return false;
        }
    }
    return true;
    };


this.newGame = function(){
    
    //if (!that.resumeGame()){
        that.pieces = [ new Cell(that.boardHeight - 3, 0),
                        new Cell(that.boardHeight - 2, 0),
                        new Cell(that.boardHeight - 1, 0),
                        new Cell(that.boardHeight - 3, 1),
                        new Cell(that.boardHeight - 2, 1),
                        new Cell(that.boardHeight - 1, 1),
                        new Cell(that.boardHeight - 3, 2),
                        new Cell(that.boardHeight - 2, 2),
                        new Cell(that.boardHeight - 1, 2)
        ];
    //}
    that.selectedPieceIndex = that.nothingSelected;
    that.moveCount = 0;
    that.drawBoard();
    };

this.drawBoard = function(){
    var dc = that.drawingContext;
    var x, y;
    
    dc.clearRect(0, 0, that.canvasWidth(), that.canvasHeight());

    dc.beginPath();
    
    for(x = 0; x < that.canvasWidth(); x+=that.pieceWidth){
        dc.moveTo(0.5 + x, 0);
        dc.lineTo(0.5 + x, that.canvasWidth());
    }
    
    for(y = 0; y < that.canvasHeight(); y+=that.pieceHeight){
        dc.moveTo(0, 0.5 + y);
        dc.lineTo(that.canvasHeight(), 0.5 + y);
    }
    
    dc.strokeStyle = '#aaa';
    dc.stroke();
    
    for(i = 0; i < that.pieces.length;i++){
        that.drawPiece(that.pieces[i], that.selectedPieceIndex === i);
    }
    
    /*$(this.pieces).each(function(){
            this.drawPiece(this);
        });*/
    //that.saveGame();
    };

this.drawPiece = function (p, selected){
    
    var dc = that.drawingContext;
    
    var x = (p.column * that.pieceWidth) + (that.pieceWidth / 2);
    var y = (p.row * that.pieceHeight) + (that.pieceHeight / 2);
    var radius = (that.pieceHeight / 2) * 0.9;
    
    
    dc.beginPath();
    dc.arc(x, y, radius, 0, Math.PI * 2, false);
    dc.closePath();
    
    dc.strokeStyle = 'red';
    dc.stroke();
    
    if (selected){
        dc.fillStyle = 'red';
        dc.fill();
        }
    };

this.initGame = function(){
        
        that.canvasElement = document.createElement('canvas'); //jquery?
        that.canvasElement.id = 'halma_canvas';
        that.canvasElement.width = that.canvasWidth(); // dividable by 9
        that.canvasElement.height = that.canvasHeight();
        //$(this.canvasElement).css('background-color','red');
        
        $('body').append(that.canvasElement);
        //document.body.appendChild(this.canvasElement);
        
        //$(this.canvasElement).click(function (event){canvasClick(event);});
        that.canvasElement.addEventListener('click', that.canvasClick, false);
        
        that.moveCountElement = $('p')[0];
         $('body').append(that.moveCountElement);
         
         that.drawingContext = that.canvasElement.getContext('2d');
         
         that.newGame();
        };
        
this.canvasClick = function(event){
    //alert('go!');
    var cellClicked = that.getCursorPosition(event);
    var i;
    
    for(i = 0; i < that.pieces.length; i++){
        piece = that.pieces[i];
        if(piece.row === cellClicked.row && piece.column === cellClicked.column){
            that.pieceClicked(i);
            return;
        }
    }
    that.emptyCellClicked(cellClicked);        
    };
    
this.pieceClicked = function (index){
    if( index === that.selectedPieceIndex ) { return; }
    //that.pieces[index].selected = true;
    //Halma.drawPiece(Halma.pieces[index]);
    
     
    that.selectedPieceIndex = index;
  
    
    that.drawBoard();
    
    }; 
this.emptyCellClicked = function (cell){
    console.log('empty');
    // if selected piece, then move to adjacent piece
    
    
    var selectedPiece;
    var dx, dy;
    
    if (that.selectedPieceIndex === that.nothingSelected) {
        return;
    }
    
    selectedPiece = that.pieces[that.selectedPieceIndex];
    
    dx = Math.abs(cell.row - selectedPiece.row);
    dy = Math.abs(cell.column - selectedPiece.column);
    
    if (that.isSimpleMove(dx, dy)) {
        console.log('simple');
        selectedPiece.moveTo(cell);
        that.moveCount += 1;
        that.selectedPieceIndex = that.nothingSelected;
        that.drawBoard();
    }
    else if (that.isJump(dx, dy) && that.isPieceInbetween(selectedPiece, cell)) {
        console.log('jump');
        selectedPiece.moveTo(cell);
        that.moveCount += 1;
        that.selectedPieceIndex = that.nothingSelected;
        that.drawBoard();
    }
    
    };
this.getCursorPosition = function (event){
    
    var x;
    var y;
    
    var cell;
    
    if (event.pageX != undefined && event.pageY != undefined) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    x -= that.canvasElement.offsetLeft;
    y -= that.canvasElement.offsetTop;
    
    
    x = Math.min(x, that.canvasWidth() -1);
    y = Math.min(y, that.canvasHeight() -1);
    
    cell = new Cell(Math.floor(y / that.pieceHeight), 
                         Math.floor(x / that.pieceWidth));
    
    return cell;
    };
    
this.isSimpleMove = function(dx, dy){
         return (dx <= 1) && (dy <= 1);
    }    
this.isJump = function (dx, dy){
    return ((dx == 2) && (dy == 0))
     || ((dx == 0) && (dy == 2))
     || ((dx == 2) && (dy == 2));
    }
this.isPieceInbetween = function (p1, p2){
    var centreRow = (p1.row + p2.row) / 2;
  var centreCol = (p1.column + p2.column) / 2;
  var i;
  for( i = 0; i < that.pieces.length; i++ ) {
    if( that.pieces[i].row == centreRow && that.pieces[i].column == centreCol ) {
      return true;
    }
  }
  return false;
    }    
};

$(function(){
    var halma = new Halma();
    halma.initGame();
    });
    