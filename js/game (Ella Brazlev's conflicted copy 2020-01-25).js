'use strict';
console.log('Minesweeper Soko');

var gBoard = [];
var EMPTY = '';
var MINE = '💣';
var FLAG = '🚩';
var gFirst = 1;
var gTimerId;
var gCountHints = 3;
var gSafeClickcount = 3;
var gLives = 1;

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

/*****************************************/
function initGame(elBtn) {

    if (elBtn.innerText === 'Easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLives = 2;
        for (var i = 0; i < 2; i++) {
            document.querySelector(`.live${i}`).style.display = 'block';
        }

    } else if (elBtn.innerText === 'Hard') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gLives = 3;
        for (var i = 1; i < 4; i++) {
            document.querySelector(`.live${i}`).style.display = 'block';
        }

    } else if (elBtn.innerText === 'Extreme') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gLives = 4;
        for (var i = 1; i < 5; i++) {
            document.querySelector(`.live${i}`).style.display = 'block';
        }

    };
    reset();
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
            board[i][j] = {
                location: {
                    i: i,
                    j: j
                },
                minesAroundCount: gLevel.SIZE,
                isShown: false,
                isMine: false,
                isMarked: false,
                value: EMPTY
            }
        }
    }
    var mines = gLevel.MINES;
    while (mines > 0) {
        var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var j = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (board[i][j].value !== MINE) board[i][j].value = MINE;
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
            if (gBoard[i][j].value === MINE) count++;
        }
    }
    return count;
}

/*****************************************/
function generateElOnBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var negs = setMinesNegsCount(i, j);
            if ((negs > 0) && (gBoard[i][j].value !== MINE)) {
                gBoard[i][j].value = negs;
            }
        }
    }
    return gBoard;
}

/*****************************************/
function cellClicked(elCell, i, j, event) {
    i = +elCell.id.substring(5, elCell.id.lastIndexOf('-'));
    j = +elCell.id.substring(elCell.id.lastIndexOf('-') + 1);

    if ((event.button === 1) || (event.button === 0)) {
        if (gFirst) {
            gTimerId = setInterval(timer, 1000);
            if (gBoard[i][j].value === MINE) {
                gBoard[i][j].isShown = true;
                initGame(event);
                if (checkGameOver()) {
                    victory();
                }
            }
            gFirst--;
        }

        if (gGame.isHint) {
            showCells(gBoard, i, j);
            setTimeout(function() {
                hideCells(gBoard, i, j)
            }, 1000);
            document.querySelector(`.lamp${gCountHints}`).style.display = 'none';
            gCountHints--;

        }

        if (gBoard[i][j].value === EMPTY) {
            gBoard[i][j].isShown = true;
            expandShown(gBoard, i, j);
            if (checkGameOver()) {
                victory();
            }
        }

        if (gBoard[i][j].isMarked) return;

        if (gBoard[i][j].value === MINE) {
            if (gLives > 0) {
                renderCell({ i: i, j: j }, gBoard[i][j].value);
                gGame.markedCount++;
                gBoard[i][j].isShown = true;
                document.querySelector(`.live${gLives}`).style.display = 'none';
                gLives--;

                if (checkGameOver()) {
                    victory();
                }
            } else {
                for (var i = 0; i < gBoard.length; i++) {
                    for (var j = 0; j < gBoard[i].length; j++) {
                        if (gBoard[i][j].value === MINE) {
                            renderCell({ i: i, j: j }, MINE);
                            gBoard[i][j].isShown = true;
                        }
                    }
                    loseGame();
                }
            }
        } else {
            renderCell({ i: i, j: j }, gBoard[i][j].value);
            gBoard[i][j].isShown = true;
            if (checkGameOver()) {
                victory();
            }
        }
    } else if (event.button === 2) {
        if (!gBoard[i][j].isMarked) {
            renderCellHide({ i: i, j: j }, FLAG)
            gBoard[i][j].isMarked = true;
            gGame.markedCount++;
            if (checkGameOver()) {
                victory();
            }
        } else if (gBoard[i][j].isMarked) {
            renderCellHide({ i: i, j: j }, EMPTY)
            gBoard[i][j].isMarked = false;
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
    console.log(gLevel.MINES);

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
            renderCell({ i: i, j: j }, board[i][j].value);

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
    var gameTime = gGame.secsPassed;
    storageTime(gGame.secsPassed);
    clearInterval(gTimerId);
}

/*****************************************/
function isHint() {
    if (gCountHints === 0) gGame.isHint = false;
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
            if (i === rowI && j === colJ) continue;
            renderCellHide({ i: i, j: j }, board[i][j].value);
        }
    }
}
/*****************************************/
function hideCells(board, rowI, colJ) {
    for (var i = rowI - 1; i <= rowI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = colJ - 1; j <= colJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
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
/*****************************************/
function safeClick() {

    var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
    var j = getRandomIntInclusive(0, gLevel.SIZE - 1);

    if ((!gBoard[i][j].isShown) && (gBoard[i][j].value !== MINE) && (gSafeClickcount > 0)) {
        renderCell({ i: i, j: j }, gBoard[i][j].value);
        setTimeout(function() {
            renderCellHide({ i: i, j: j }, EMPTY);
        }, 1000);
    }
    gSafeClickcount--;
}
/*****************************************/

function reset() {
    gFirst = 1;
    gCountHints = 3;
    gSafeClickcount = 3;

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isHint: false,
    }

    document.querySelector('.show').style.display = 'block';
    document.querySelector('.hidevictory').style.display = 'none';
    document.querySelector('.hidelost').style.display = 'none';

    for (var i = 1; i < 4; i++) {
        document.querySelector(`.lamp${i}`).style.display = 'block';
    }

    gBoard = initalEmptyBoard(gBoard);
    printMat(gBoard, '.board-container');
    gBoard = createBoard();
    generateElOnBoard();
    console.table(gBoard);
}