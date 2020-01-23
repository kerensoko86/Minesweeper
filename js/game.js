'use strict';
console.log('Minesweeper Soko');

var gBoard = [];
var EMPTY = '';
var MINE = '💣';
var FLAG = '🚩';
var gLevelEasy = 'Easy';
var gLevelHard = 'Hard';
var gLevelExtreme = 'Extreme';
var gFirst = 1;
var gTimerId;
var gCount = 4;


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHint: false,
}

var gLevel = {
    SIZE: 4,
    MINES: 2
};

document.querySelector('.easy').innerText = gLevelEasy;
document.querySelector('.hard').innerText = gLevelHard;
document.querySelector('.extreme').innerText = gLevelExtreme;

/*****************************************/
function initGame(elBtn) {
    document.querySelector('.show').style.display = 'block';
    document.querySelector('.hidevictory').style.display = 'none';
    document.querySelector('.hidelost').style.display = 'none';

    selectLevel(elBtn);


}

/*****************************************/
function selectLevel(elBtn) {
    if (elBtn.innerText === gLevelEasy) {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
    } else if (elBtn.innerText === gLevelHard) {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
    } else if (elBtn.innerText === gLevelExtreme) {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
    };

    gBoard = initalEmptyBoard(gBoard);
    printMat(gBoard, '.board-container');
    gBoard = createBoard();
    generateElOnBoard();
    gGame.secsPassed = 0;
    console.table(gBoard);
}

/*****************************************/
function initalEmptyBoard(board) {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = EMPTY;
        }
    }
    return board;
}
/*****************************************/
function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j];
            cell = {
                location: {
                    i: i,
                    j: j
                },
                minesAroundCount: gLevel.SIZE,
                isShown: false,
                isMine: false,
                isMarked: true
            }
            board[cell.location.i][cell.location.j] = EMPTY;
        }
    }
    var mines = gLevel.MINES;
    while (mines > 0) {
        var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var j = getRandomIntInclusive(0, gLevel.SIZE - 1);
        board[i][j] = MINE;
        mines--;
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
            if ((negs > 0) && (gBoard[i][j] !== MINE)) {
                gBoard[i][j] = negs;
            }
        }
    }
    return gBoard;
}

/*****************************************/
function cellClicked(elCell, i, j, event) {
    var count = 0;
    i = +elCell.id.substring(5, elCell.id.lastIndexOf('-'));
    j = +elCell.id.substring(elCell.id.lastIndexOf('-') + 1);

    if ((event.button === 1) || (event.button === 0)) {
        if (gFirst) {
            gTimerId = setInterval(timer, 1000);
            if (gBoard[i][j] === MINE) {
                initGame(event);
            }
            gFirst--;
        }

        if (gGame.isHint) {
            showCells(gBoard, i, j);
            setTimeout(function() {
                hideCells(gBoard, i, j)
            }, 1000);
            gCount--;
            document.querySelector(`.lamp${gCount}`).style.display = 'none';
        }

        if (gBoard[i][j] === EMPTY) {
            expandShown(gBoard, i, j);
            if (checkGameOver()) {
                victory();
            }
        }

        if (gBoard[i][j] === gBoard[i][j].isMarked) return;

        if (gBoard[i][j] === MINE) {
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    if (gBoard[i][j] === MINE) renderCell({ i: i, j: j }, MINE);
                }
                loseGame();
            }

        } else {
            renderCell({ i: i, j: j }, gBoard[i][j]);
            if (checkGameOver() === true) {
                document.querySelector('.show').style.display = 'none';
                document.querySelector('.hidevictory').style.display = 'block';
            }
        }
    } else if (event.button === 2) {
        if ((count == 2) || (count == 1)) {
            renderCellHide({ i: i, j: j }, EMPTY)
            count--;
        } else {
            renderCellHide({ i: i, j: j }, FLAG)
            gBoard[i][j].isMarked === true;
            gGame.markedCount++;
        }
        if (checkGameOver()) {
            victory();
        }
    }
}
/*****************************************/
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.isShown = true;
    elCell.innerHTML = value;
    cellMarked(elCell);
}

/*****************************************/
function cellMarked(elCell) {
    var cellMark = document.querySelector(getSelector(elCell));
    cellMark.classList.add('mark');
    elCell.isMarked = true;
}

/*****************************************/
function getSelector(elCell, i, j) {
    i = +elCell.id.substring(5, elCell.id.lastIndexOf('-'));
    j = +elCell.id.substring(elCell.id.lastIndexOf('-') + 1);
    return '#cell-' + i + '-' + j;
}

/*****************************************/
function checkGameOver() {
    var count = gLevel.SIZE ** 2 - gLevel.MINES;
    var openCells = document.querySelectorAll('.mark').length;
    return ((count === openCells) && (gGame.markedCount === gLevel.MINES));
}
/*****************************************/
function loseGame() {
    document.querySelector('.show').style.display = 'none';
    document.querySelector('.hidelost').style.display = 'block';
    gGame.isOn = false;
    clearInterval(gTimerId);
}

/*****************************************/
function expandShown(board, rowI, colJ) {
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === rowI && j === colJ) continue;
            renderCell({ i: i, j: j }, board[i][j]);

            // if (gBoard[i][j] === EMPTY) {
            //     expandShown(board, i, j);
            // }
        }
    }
}

/*****************************************/
function timer() {
    gGame.secsPassed++;
    document.querySelector('.timer').innerText = gGame.secsPassed / 1000;
}
/*****************************************/
function victory() {
    document.querySelector('.show').style.display = 'none';
    document.querySelector('.hidevictory').style.display = 'block';
    gGame.isOn = false;
    clearInterval(gTimerId);
}

/*****************************************/
function isHint() {
    if (gCount === 0) gGame.isHint = false;
    else {
        gGame.isHint = true;
        setTimeout(function() { gGame.isHint = false }, 4000)
    }

}
/*****************************************/
function showCells(board, rowI, colJ) {
    //debugger
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            renderCellHide({ i: i, j: j }, board[i][j]);
        }
    }
}
/*****************************************/
function hideCells(board, rowI, colJ) {
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            // if (i === rowI && j === colJ) continue;
            renderCellHide({ i: i, j: j }, EMPTY);
        }
    }
}
/*****************************************/
function renderCellHide(location, value) {
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.classList.remove('mark');
    elCell.innerHTML = value;
}