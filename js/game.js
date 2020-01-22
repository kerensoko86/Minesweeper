'use strict';
console.log('Minesweeper Soko');

var gBoard = [];
var EMPTY = '';
var MINE = '💣';

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gCell;


// console.table(runGeneration(gBoard));

/*****************************************/

function initGame() {
    gBoard = createBoard();
    printMat(gBoard, '.board-container');
    gBoard = buildBoard();
    generateElOnBoard(gBoard);
    console.table(gBoard);
}


function createBoard(board) {
    var SIZE = 4;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = EMPTY;
        }
    }
    return board;
}

/*****************************************/
function buildBoard(board) {
    var SIZE = 4;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            var cell = board[i][j];
            cell = {
                location: {
                    i: i,
                    j: j
                },
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: true
            }
            board[cell.location.i][cell.location.j] = EMPTY;

            if (((i === 2) && (j === 0)) || ((i === 1) && (j === 2))) {
                board[cell.location.i][cell.location.j] = MINE;
            }
        }
    }
    return board;
}

/*****************************************/
function setMinesNegsCount(rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (gBoard[i][j] === MINE) count++;
        }
    }
    return count;
}

/*****************************************/
function generateElOnBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var negs = setMinesNegsCount(i, j);
            if (negs === 1) gBoard[i][j] = 1;
            if (negs === 2) gBoard[i][j] = 2;
        }
    }
    return gBoard;
}

/*****************************************/
function cellClicked(elCell, i, j) {

    i = +elCell.id.substring(5, elCell.id.lastIndexOf('-'));
    j = +elCell.id.substring(elCell.id.lastIndexOf('-') + 1);

    renderCell({ i: i, j: j }, gBoard[i][j]);
    cellMarked(elCell);

}
/*****************************************/
function cellMarked(elCell) {
    var cellMark = document.querySelector(getSelector(elCell));
    console.log(cellMark);
    cellMark.classList.add('mark');
    console.log(cellMark);
}

/*****************************************/
function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j;
}

/*****************************************/
function checkGameOver() {
    return;
}

// function expandShown(board, elCell, i, j) {
//     if (cellClicked)
// }