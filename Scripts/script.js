/*
    *
    *   MIT License
    *
    *   Copyright (c) 2023 Radovan Draskovic
    *
    *   Permission is hereby granted, free of charge, to any person obtaining a copy
    *   of this software and associated documentation files (the "Software"), to deal
    *   in the Software without restriction, including without limitation the rights
    *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    *   copies of the Software, and to permit persons to whom the Software is
    *   furnished to do so, subject to the following conditions:
    *   The above copyright notice and this permission notice shall be included in all
    *   copies or substantial portions of the Software.
    * 
    *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    *   SOFTWARE.
    * 
*/

function preparePage() {
    lastClicked = undefined;
    lastClassName = undefined;
    draggedTo = undefined;
    turn = "white";
    containerDisplayWinner.innerHTML = "";
    containerChoosePiece.innerHTML = "";
    needPawnReplacement = EMPTY;

    whiteRookLeftMoved = false;
    whiteRookRightMoved = false;
    blackRookLeftMoved = false;
    blackRookRightMoved = false;
    whiteKingMoved = false;
    blackKingMoved = false;
    whiteKingCheck = false;
    blackKingCheck = false;
    pawnPositionI = -1;
    pawnPositionJ = -1;

    whitePawnsMovedTwoSquares = [];
    blackPawnsMovedTwoSquares = [];
    enpassantWhiteEnableLeft = [];
    enpassantWhiteEnableRight = [];
    enpassantBlackEnableLeft = [];
    enpassantBlackEnableRight = [];

    for(let i = 0; i < COLUMNS; i++) {
        whitePawnsMovedTwoSquares.push(false);
        blackPawnsMovedTwoSquares.push(false);
        enpassantWhiteEnableLeft.push(0);
        enpassantWhiteEnableRight.push(0);
        enpassantBlackEnableLeft.push(0);
        enpassantBlackEnableRight.push(0);
    }

    gameOver = false;

    createBoardMatrix();
    generateBoard(true);
}

function generateBoard(flagPutPieces) {

    let board = document.createElement("table");
    let counter = 0;

    for(let i = 0; i < ROWS; i++) {
        let row = document.createElement("tr");
        for(let j = 0; j < COLUMNS + 1; j++) {
            let cell = document.createElement("td");                

            if(j == 0) {
                cell.classList = "alignRight";
                cell.innerText = counter+1;
                counter++;
            }
            else {
                
                cell.id = generateUniquePosition(i, j-1);
                
                cell.ondragenter = function() {
                    draggedTo = generateUniquePosition(i, j-1);
                }

                if(i % 2 == 0) {
                    if(j % 2 == 0) cell.classList = "green";
                    else cell.classList = "white";
                }
                else {
                    if(j % 2 == 0) cell.classList = "white";
                    else cell.classList = "green";
                }
            }
            row.appendChild(cell);
        }

        if(flagPutPieces)
            board.appendChild(row);
    }

    let rowLetters = document.createElement("tr");
    rowLetters.classList = "alignTop";
    rowLetters.appendChild(document.createElement("td"));
    for(let i = 0; i < 8; i++) {
        let cellLetter = document.createElement("td");
        cellLetter.innerText = String.fromCharCode(97 + i);
        cellLetter.classList = "alignTop";
        rowLetters.appendChild(cellLetter);
    }

    board.appendChild(rowLetters);
    containerBoardDiv.innerHTML = "";
    containerBoardDiv.appendChild(board);

    putPieces();
}

function createBoardMatrix() {

    boardMatrix = [];

    for(let i = 0; i < ROWS; i++) {
        let row = [];
        for(let j = 0; j < COLUMNS; j++)
            row.push(EMPTY);
        boardMatrix.push(row);
    }

    for (let element of initialPositions) {
        for (let piece of element[1]) {
            let positionI = Number(piece[0])*10 + Number(piece[1]);
            let positionJ = Number(piece[2])*10 + Number(piece[3]);

            switch(element[0]) {
                case "whitePAWN":
                    boardMatrix[positionI][positionJ] = whitePAWN;
                    break;
                case "whiteROOK":
                    boardMatrix[positionI][positionJ] = whiteROOK;
                    break;
                case "whiteKNIGHT":
                    boardMatrix[positionI][positionJ] = whiteKNIGHT;
                    break;
                case "whiteBISHOP":
                    boardMatrix[positionI][positionJ] = whiteBISHOP;
                    break;
                case "whiteQUEEN":
                    boardMatrix[positionI][positionJ] = whiteQUEEN;
                    break;
                case "whiteKING":
                    boardMatrix[positionI][positionJ] = whiteKING;
                    break;
                case "blackPAWN":
                    boardMatrix[positionI][positionJ] = blackPAWN;
                    break;
                case "blackROOK":
                    boardMatrix[positionI][positionJ] = blackROOK;
                    break;
                case "blackKNIGHT":
                    boardMatrix[positionI][positionJ] = blackKNIGHT;
                    break;
                case "blackBISHOP":
                    boardMatrix[positionI][positionJ] = blackBISHOP;
                    break;
                case "blackQUEEN":
                    boardMatrix[positionI][positionJ] = blackQUEEN;
                    break;
                case "blackKING":
                    boardMatrix[positionI][positionJ] = blackKING;
                    break;
                default:
                    break;
            }
        }
    }

}

function putPieces() {
    for (let element of initialPositions) {
        let s = "../Images/Pieces/" + element[0] + ".png";
        for (let piece of element[1]) {
        
            let img = document.createElement("img");
            img.src = s;
            img.style.height = "100%";
            img.style.width = "100%";
    
            document.getElementById(piece).innerHTML = "";
            document.getElementById(piece).appendChild(img);

            document.getElementById(piece).ondragstart = function() {
                if(needPawnReplacement == WAITING) return;
                displayPossibleMoves(piece);
            }

            document.getElementById(piece).ondragend = function() {
                if(needPawnReplacement == WAITING) return;
                displayPossibleMoves(piece);

                let audio1 = new Audio();
                let audio2 = new Audio();
                let audio3 = new Audio();

                audio1.src = "../Sounds/move-self.mp3";
                audio2.src = "../Sounds/capture.mp3";
                audio3.src = "../Sounds/error.wav"

                let positionStartI = Number(piece[0]) * 10 + Number(piece[1]);
                let positionStartJ = Number(piece[2]) * 10 + Number(piece[3]);
                let positionEndI = Number(draggedTo[0]) * 10 + Number(draggedTo[1]);
                let positionEndJ = Number(draggedTo[2]) * 10 + Number(draggedTo[3]);

                if(positionStartI != positionEndI || positionStartJ != positionEndJ) {
                    let test = isValidMove(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix);

                    if(test == -1 && turn == getColorFromString(boardMatrix[positionStartI][positionStartJ])) {
                        document.getElementById(piece).style.backgroundColor = "#ff4d4d";
                        audio3.play();
                        
                        setTimeout(function() {
                            document.getElementById(piece).style.backgroundColor = ""; // Revert back to normal color
                        }, 500);
                    }

                    if(test != -1 && getColorFromString(boardMatrix[positionStartI][positionStartJ]) == turn) {
                        if(canCheckAfterMove(positionStartI, positionStartJ, positionEndI, positionEndJ) == false && needPawnReplacement == EMPTY) {
                            if(turn == "white") turn = "black";
                            else turn = "white";

                            movePiece(piece, draggedTo, s);
                            if(test == 1) audio1.play();
                            else audio2.play();
                        }
                        else {
                            document.getElementById(piece).style.backgroundColor = "#ff4d4d";
                            audio3.play();

                            setTimeout(function() {
                                document.getElementById(piece).style.backgroundColor = ""; // Revert back to normal color
                            }, 500);
                        }
                    }
                }

                draggedTo = undefined;
            }
        }
    }
}

function movePiece(startId, endId, imageSource) {
    
    if(needPawnReplacement == WAITING) return;

    let audio1 = new Audio();
    let audio2 = new Audio();
    let audio3 = new Audio();
    let audio4 = new Audio();

    audio1.src = "../Sounds/move-self.mp3";
    audio2.src = "../Sounds/capture.mp3";
    audio3.src = "../Sounds/error.wav";
    audio4.src = "../Sounds/game-over.mp3";

    document.getElementById(endId).innerHTML = "";
    document.getElementById(startId).innerHTML = "";

    let source = "../Images/Pieces/" + boardMatrix[Number(startId[0]*10+startId[1])][Number(startId[2]*10+startId[3])] + ".png";
    let img = document.createElement("img");
    img.src = source;
    img.style.height = "100%";
    img.style.width = "100%";
    document.getElementById(endId).appendChild(img);

    document.getElementById(endId).ondragstart = function() {
        if(needPawnReplacement == WAITING) return;
        displayPossibleMoves(endId);
    }

    document.getElementById(endId).ondragend = function() {
        if(needPawnReplacement == WAITING) return;
        displayPossibleMoves(endId);
        
        let positionStartI = Number(endId[0]) * 10 + Number(endId[1]);
        let positionStartJ = Number(endId[2]) * 10 + Number(endId[3]);
        let positionEndI = Number(draggedTo[0]) * 10 + Number(draggedTo[1]);
        let positionEndJ = Number(draggedTo[2]) * 10 + Number(draggedTo[3]);

        if(positionStartI != positionEndI || positionStartJ != positionEndJ) {
            let test = isValidMove(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix);

            if(test == -1 && turn == getColorFromString(boardMatrix[positionStartI][positionStartJ])) {
                document.getElementById(endId).style.backgroundColor = "#ff4d4d";
                audio3.play();

                setTimeout(function() {
                    document.getElementById(endId).style.backgroundColor = ""; // Revert back to normal color
                }, 500);
            }

            if(test != -1 && getColorFromString(boardMatrix[positionStartI][positionStartJ]) == turn) {
                if(canCheckAfterMove(positionStartI, positionStartJ, positionEndI, positionEndJ) == false && needPawnReplacement == EMPTY) {
                    if(turn == "white") turn = "black";
                    else turn = "white";

                    movePiece(endId, draggedTo, imageSource);

                    if(test == 1) audio1.play();
                    else audio2.play();
                }
                else {
                    document.getElementById(endId).style.backgroundColor = "#ff4d4d";
                    audio3.play();

                    setTimeout(function() {
                        document.getElementById(endId).style.backgroundColor = ""; // Revert back to normal color
                    }, 500);
                }
            }
        }
        draggedTo = undefined;
    }

    let positionStartI = Number(startId[0]) * 10 + Number(startId[1]);
    let positionStartJ = Number(startId[2]) * 10 + Number(startId[3]);
    let positionEndI = Number(endId[0]) * 10 + Number(endId[1]);
    let positionEndJ = Number(endId[2]) * 10 + Number(endId[3]);
    
    if(boardMatrix[positionStartI][positionStartJ] == "whiteKING") {
        
        if(whiteKingMoved == false && positionEndI == positionStartI && positionEndJ == positionStartJ + 2 && whiteRookRightMoved == false) {
            boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
            boardMatrix[positionStartI][positionStartJ] = EMPTY;
            movePiece(generateUniquePosition(7,7), generateUniquePosition(7, 5), "../Images/Pieces/whiteROOK.png");
            whiteKingMoved = true;
            whiteRookRightMoved = true;
            return;
        }
        else if (whiteKingMoved == false && positionEndI == positionStartI && positionEndJ == positionStartJ - 2 && whiteRookLeftMoved == false) {
            boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
            boardMatrix[positionStartI][positionStartJ] = EMPTY;
            movePiece(generateUniquePosition(7,0), generateUniquePosition(7, 3), "../Images/Pieces/whiteROOK.png");
            whiteKingMoved = true;
            whiteRookLeftMoved = true;
            return;
        }
    }

    if(boardMatrix[positionStartI][positionStartJ] == "blackKING") {
        if(blackKingMoved == false && positionEndI == positionStartI && positionEndJ == positionStartJ + 2 && blackRookRightMoved == false) {
            boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
            boardMatrix[positionStartI][positionStartJ] = EMPTY;
            movePiece(generateUniquePosition(0,7), generateUniquePosition(0, 5), "../Images/Pieces/blackROOK.png");
            blackKingMoved = true;
            blackRookRightMoved = true;
            return;
        }
        else if (blackKingMoved == false && positionEndI == positionStartI && positionEndJ == positionStartJ - 2 && blackRookLeftMoved == false) {
            boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
            boardMatrix[positionStartI][positionStartJ] = EMPTY;
            movePiece(generateUniquePosition(0,0), generateUniquePosition(0, 3), "../Images/Pieces/blackROOK.png");
            blackKingMoved = true;
            blackRookLeftMoved = true;
            return;
        }
    }

    if(boardMatrix[positionStartI][positionStartJ] == "whitePAWN" && positionEndI == positionStartI - 2) whitePawnsMovedTwoSquares[positionStartJ] = true;
    if(boardMatrix[positionStartI][positionStartJ] == "blackPAWN" && positionEndI == positionStartI + 2) blackPawnsMovedTwoSquares[positionStartJ] = true;


    let pawnReplacement = false;
    
    if(boardMatrix[positionStartI][positionStartJ] == "whitePAWN" && positionEndI == 0) pawnReplacement = true;
    if(boardMatrix[positionStartI][positionStartJ] == "blackPAWN" && positionEndI == 7) pawnReplacement = true;

    if(boardMatrix[positionStartI][positionStartJ] == "whiteKING") whiteKingMoved = true;
    if(boardMatrix[positionStartI][positionStartJ] == "blackKING") blackKingMoved = true;

    if(boardMatrix[positionStartI][positionStartJ] == "whiteROOK" && positionStartI == 7 && positionStartJ == 0) whiteRookLeftMoved = true;
    if(boardMatrix[positionStartI][positionStartJ] == "whiteROOK" && positionStartI == 7 && positionStartJ == 7) whiteRookRightMoved = true;
    if(boardMatrix[positionStartI][positionStartJ] == "blackROOK" && positionStartI == 0 && positionStartJ == 0) blackRookLeftMoved = true;
    if(boardMatrix[positionStartI][positionStartJ] == "blackROOK" && positionStartI == 0 && positionStartJ == 7) blackRookRightMoved = true;

    if(boardMatrix[positionStartI][positionStartJ] == "whitePAWN" && isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix, "white")) {
        boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
        boardMatrix[positionStartI][positionStartJ] = EMPTY;
        boardMatrix[positionStartI][positionEndJ] = EMPTY;
        document.getElementById(generateUniquePosition(positionStartI, positionEndJ)).innerHTML = "";
    }
    else if(boardMatrix[positionStartI][positionStartJ] == "blackPAWN" && isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix, "black")) {
        boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
        boardMatrix[positionStartI][positionStartJ] = EMPTY;
        boardMatrix[positionStartI][positionEndJ] = EMPTY;
        document.getElementById(generateUniquePosition(positionStartI, positionEndJ)).innerHTML = "";
    }
    else {

        if(getColorFromString(boardMatrix[positionStartI][positionStartJ]) == "white" && isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix, "white") == 0) {
            for(let i = 0; i < COLUMNS; i++) {
                if(enpassantWhiteEnableLeft[i] == -1) enpassantWhiteEnableLeft = -2;
                if(enpassantWhiteEnableRight[i] == 1) enpassantWhiteEnableRight = 2;
            }
        }

        if(getColorFromString(boardMatrix[positionStartI][positionStartJ]) == "black" && isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, boardMatrix, "black") == 0) {
            for(let i = 0; i < COLUMNS; i++) {
                if(enpassantBlackEnableLeft[i] == -1) enpassantBlackEnableLeft = -2;
                if(enpassantBlackEnableRight[i] == 1) enpassantBlackEnableRight = 2;
            }
        }
        
        if(boardMatrix[positionStartI][positionStartJ] == "whitePAWN" && positionEndI == 3) {
            if(positionEndJ - 1 >= 0 && boardMatrix[positionEndI][positionEndJ-1] == "blackPAWN") enpassantWhiteEnableLeft[positionEndJ] = -2;
            if(positionEndJ + 1 < COLUMNS && boardMatrix[positionEndI][positionEndJ+1] == "blackPAWN") enpassantWhiteEnableRight[positionEndJ] = 2;
        }

        if(boardMatrix[positionStartI][positionStartJ] == "blackPAWN" && positionEndI == 4) {
            if(positionEndJ - 1 >= 0 && boardMatrix[positionEndI][positionEndJ-1] == "whitePAWN") enpassantBlackEnableLeft[positionEndJ] = -2;
            if(positionEndJ + 1 < COLUMNS && boardMatrix[positionEndI][positionEndJ+1] == "whitePAWN") enpassantBlackEnableRight[positionEndJ] = 2;
        }

        if(boardMatrix[positionStartI][positionStartJ] == "whitePAWN" && positionEndI == positionStartI - 2) {
            // Enable possible enpassant move for the opponent
            if(positionStartJ - 1 >= 0) enpassantBlackEnableRight[positionStartJ - 1] = 0;
            if(positionStartJ + 1 < COLUMNS) enpassantBlackEnableLeft[positionStartJ + 1] = 0;
        }

        if(boardMatrix[positionStartI][positionStartJ] == "blackPAWN" && positionEndI == positionStartI + 2) {
            // Enable possible enpassant move for the opponent
            if(positionStartJ - 1 >= 0) enpassantWhiteEnableRight[positionStartJ - 1] = 0;
            if(positionStartJ + 1 < COLUMNS) enpassantWhiteEnableLeft[positionStartJ + 1] = 0;
        }

        boardMatrix[positionEndI][positionEndJ] = boardMatrix[positionStartI][positionStartJ];
        boardMatrix[positionStartI][positionStartJ] = EMPTY;
    }

    if(pawnReplacement) {
        pawnPositionI = positionEndI;
        pawnPositionJ = positionEndJ;
        needPawnReplacement = WAITING;
        replacePawn(img, imageSource);
    }

    let testGameOver = isGameOver();
    if(testGameOver != NOT_OVER) {
        audio4.play();
        gameOver = true;
        if(testGameOver == WIN_BLACK) containerDisplayWinner.innerHTML = "Game over! Black won the game!";
        else if(testGameOver == DRAW) containerDisplayWinner.innerHTML = "Game over! Draw!";
        else containerDisplayWinner.innerHTML = "Game over! White won the game!";
    }

    if(isKingInCheck("black")) blackKingCheck = true;
    else blackKingCheck = false;

    if(isKingInCheck("white")) whiteKingCheck = true;
    else whiteKingCheck = false;
}

function refreshBoard() {
    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            if(document.getElementById(generateUniquePosition(i, j)).classList.contains("dot"))
                document.getElementById(generateUniquePosition(i, j)).classList.remove("dot");
            if(document.getElementById(generateUniquePosition(i, j)).classList.contains("circle"))
                document.getElementById(generateUniquePosition(i, j)).classList.remove("circle");
        }
    }
}

function displayPossibleMoves(currentPosition) {

    if(!gameOver) {
        refreshBoard();

        if(lastClicked == document.getElementById(currentPosition)) {
            removePossibleMoves(currentPosition);
            return;
        }
        
        if(lastClicked != undefined) {
            lastClicked.className = lastClassName;   
        }
        
        lastClicked = document.getElementById(currentPosition);
        lastClassName = document.getElementById(currentPosition).className;
        document.getElementById(currentPosition).className = "clickedPiece";

        let positionI = Number(currentPosition[0])*10 + Number(currentPosition[1]);
        let positionJ = Number(currentPosition[2])*10 + Number(currentPosition[3]);

        for(let i = 0; i < ROWS; i++) {
            for(let j = 0; j < COLUMNS; j++) {
                if(i != positionI || j != positionJ) {
                    let test = isValidMove(positionI, positionJ, i, j, boardMatrix);
                    if(test == -1) continue;

                    if(test == 1) document.getElementById(generateUniquePosition(i, j)).classList.add("dot");
                    else document.getElementById(generateUniquePosition(i, j)).classList.add("circle");
                }
            }
        }
    }
}

/*
    *
    * Return value:
    *  -1   in case this is not a valid move
    *   1   in case it is a valid move and there is not a opponent's figure
    *   2   in case it is a valid move and there is a oponent's figure
    * 
*/
function isValidMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix) {

    let returnValue = -1;

    switch(playMatrix[positionStartI][positionStartJ]) {

        case "whitePAWN":

            if(isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix, "white")) {
                returnValue = 2;
                break;
            }

            if(positionEndI < positionStartI - 2 || positionEndI >= positionStartI) break;
            if(positionEndJ < positionStartJ - 1 || positionEndJ > positionStartJ + 1) break;

            if(positionEndJ != positionStartJ) {
                if(positionEndI != positionStartI - 1) break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) != "black") break;
            }
            else {
                if(playMatrix[positionEndI][positionEndJ] != EMPTY) break;
            }

            if(positionEndI == positionStartI - 2) {
                if(positionStartI != 6) break;
                if(playMatrix[positionEndI+1][positionEndJ] != EMPTY) break;
            }

            if(positionEndJ == positionStartJ) returnValue = 1;
            else returnValue = 2;

            break;
        
        case "blackPAWN":

            if(isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix, "black")) {
                returnValue = 2;
                break;
            }

            if(positionEndI > positionStartI + 2 || positionEndI <= positionStartI) break;
            if(positionEndJ < positionStartJ - 1 || positionEndJ > positionStartJ + 1) break;

            if(positionEndJ != positionStartJ) {
                if(positionEndI != positionStartI + 1) break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) != "white") break;
            }
            else {
                if(playMatrix[positionEndI][positionEndJ] != EMPTY) break;
            }

            if(positionEndI == positionStartI + 2) {
                if(positionStartI != 1) break;
                if(playMatrix[positionStartI+1][positionEndJ] != EMPTY) break;
            }

            if(positionEndJ == positionStartJ) returnValue = 1;
            else returnValue = 2;

            break;

        case "whiteKNIGHT":

            if(positionEndI == positionStartI - 2 && positionEndJ == positionStartJ + 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    break;
            }
            else if(positionEndI == positionStartI - 2 && positionEndJ == positionStartJ - 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI - 1 && positionEndJ == positionStartJ + 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI - 1 && positionEndJ == positionStartJ - 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }

            else if(positionEndI == positionStartI + 1 && positionEndJ == positionStartJ - 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 2 && positionEndJ == positionStartJ - 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 2 && positionEndJ == positionStartJ + 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 1 && positionEndJ == positionStartJ + 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else
                returnValue = -1;
            break;
        
        case "blackKNIGHT":
        
            if(positionEndI == positionStartI - 2 && positionEndJ == positionStartJ + 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    break;
            }
            else if(positionEndI == positionStartI - 2 && positionEndJ == positionStartJ - 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI - 1 && positionEndJ == positionStartJ + 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI - 1 && positionEndJ == positionStartJ - 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }

            else if(positionEndI == positionStartI + 1 && positionEndJ == positionStartJ - 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 2 && positionEndJ == positionStartJ - 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 2 && positionEndJ == positionStartJ + 1) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else if(positionEndI == positionStartI + 1 && positionEndJ == positionStartJ + 2) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white")
                    returnValue = 2;
                else if(playMatrix[positionEndI][positionEndJ] == EMPTY)
                    returnValue = 1;
                else
                    returnValue = -1;
            }
            else
                returnValue = -1;

            break;
        
        case "whiteROOK":

            if(!canRookMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) break;
            
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") break;
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") returnValue = 2;
            else returnValue = 1;

            break;

        case "blackROOK":

            if(!canRookMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) break;
            
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") break;
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") returnValue = 2;
            else returnValue = 1;

            break;

        case "whiteBISHOP":

            if(canBishopMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") {
                    returnValue = 2;
                    break;
                }
                else {
                    returnValue = 1;
                    break;
                }
            }

            break;

        case "blackBISHOP":
            
            if(canBishopMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") {
                    returnValue = 2;
                    break;
                }
                else {
                    returnValue = 1;
                    break;
                }
            }

            break;

        case "whiteQUEEN":
            
            if( canRookMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix) || canBishopMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") returnValue = 2;
                else returnValue = 1;
            }

            break
        
        case "blackQUEEN":

            if( canRookMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix) || canBishopMove(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix)) {
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") break;
                if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") returnValue = 2;
                else returnValue = 1;
            }

            break
            

        case "whiteKING":
            
            if(!whiteKingMoved) {
                if(positionEndI == positionStartI && positionEndJ == positionStartJ - 2) {
                    let flg = true;
                    for(let i = 1; i < positionStartJ; i++) {
                        if(playMatrix[positionStartI][i] != EMPTY) {
                            flg = false;
                            break;
                        }
                    }

                    if(flg) {
                        if(whiteRookLeftMoved || isKingInCheck("white")) break;
                        returnValue = 1;
                        break;
                    }

                }

                if(positionEndI == positionStartI && positionEndJ == positionStartJ + 2) {
                    let flg = true;

                    for(let i = positionStartJ+1; i < 7; i++) {
                        if(playMatrix[positionStartI][i] != EMPTY) {
                            flg = false;
                            break;
                        }
                    }

                    if(flg) {
                        if(whiteRookRightMoved || isKingInCheck("white")) break;
                        returnValue = 1;
                        break;
                    }
                }
            }

            if(positionEndI > positionStartI + 1 || positionEndI < positionStartI - 1 || positionEndJ > positionStartJ + 1 || positionEndJ < positionStartJ - 1) break;
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") break;
            if(canCheckAfterMove(positionStartI, positionStartJ, positionEndI, positionEndJ)) break;

            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") returnValue = 2;
            else returnValue = 1;

            break;

        case "blackKING":

            if(!blackKingMoved) {
                if(positionEndI == positionStartI && positionEndJ == positionStartJ - 2) {
                    let flg = true;
                    for(let i = 1; i < positionStartJ; i++) {
                        if(playMatrix[positionStartI][i] != EMPTY) {
                            flg = false;
                            break;
                        }
                    }

                    if(flg) {
                        if(blackRookLeftMoved || isKingInCheck("black")) break;
                        returnValue = 1;
                        break;
                    }

                }

                if(positionEndI == positionStartI && positionEndJ == positionStartJ + 2) {
                    let flg = true;

                    for(let i = positionStartJ+1; i < 7; i++) {
                        if(playMatrix[positionStartI][i] != EMPTY) {
                            flg = false;
                            break;
                        }
                    }

                    if(flg) {
                        if(blackRookRightMoved || isKingInCheck("black")) break;
                        returnValue = 1;
                        break;
                    }
                }
            }

            if(positionEndI > positionStartI + 1 || positionEndI < positionStartI - 1 || positionEndJ > positionStartJ + 1 || positionEndJ < positionStartJ - 1) break;
            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "black") break;
            if(canCheckAfterMove(positionStartI, positionStartJ, positionEndI, positionEndJ)) break;

            if(getColorFromString(playMatrix[positionEndI][positionEndJ]) == "white") returnValue = 2;
            else returnValue = 1;

            break;

        default:
            break;

    }

    return returnValue;
}

function removePossibleMoves(currentPosition) {
    
    lastClicked.className = lastClassName;
    lastClicked = undefined;
    lastClassName = undefined;

}

function canRookMove(startI, startJ, endI, endJ, playMatrix) {
    if(endI != startI && endJ != startJ) return false;
            
    if(endI == startI) {
        let flagPossible = true;

        if(endJ < startJ) {
            for(let i = endJ+1; i < startJ; i++) {
                if(playMatrix[startI][i] != EMPTY) {
                    flagPossible = false;
                    break;
                }
            }
        }
        else {
            for(let i = startJ + 1; i < endJ; i++) {
                if(playMatrix[startI][i] != EMPTY) {
                    flagPossible = false;
                    break;
                }
            }
        }

        if(!flagPossible) return false;
    }

    if(endJ == startJ) {
        let flagPossible = true;

        if(endI < startI) {
            for(let i = endI+1; i < startI; i++) {
                if(playMatrix[i][endJ] != EMPTY) {
                    flagPossible = false;
                    break;
                }
            }
        }
        else {
            for(let i = startI + 1; i < endI; i++) {
                if(playMatrix[i][endJ] != EMPTY) {
                    flagPossible = false;
                    break;
                }
            }
        }

        if(!flagPossible) return false;
    }

    return true;
}

function isEnPassant(positionStartI, positionStartJ, positionEndI, positionEndJ, playMatrix, color) {
    
    if(color == "white") {
     
        if(positionStartI == 3 && positionStartJ - 1 >= 0 && playMatrix[positionStartI][positionStartJ-1] == "blackPAWN" && positionEndI == positionStartI-1 && positionEndJ == positionStartJ - 1 && blackPawnsMovedTwoSquares[positionStartJ-1]) {
            if(enpassantWhiteEnableLeft[positionStartJ] == 0 || enpassantWhiteEnableLeft[positionStartJ] == -1) {
                enpassantWhiteEnableLeft[positionStartJ] = -1;
                return -1;
            }
            return 0;
        }
        if(positionStartI == 3 && positionStartJ + 1 < COLUMNS && playMatrix[positionStartI][positionStartJ+1] == "blackPAWN" && positionEndI == positionStartI-1 && positionEndJ == positionStartJ + 1 && blackPawnsMovedTwoSquares[positionStartJ+1]) {
            if(enpassantWhiteEnableRight[positionStartJ] == 0 || enpassantWhiteEnableRight[positionStartJ] == 1) {
                enpassantWhiteEnableRight[positionStartJ] = 1;
                return 1;
            }
            return 0;
        }
        return 0;
    }

    if(positionStartI == 4 && positionStartJ - 1 >= 0 && playMatrix[positionStartI][positionStartJ-1] == "whitePAWN" && positionEndI == positionStartI+1 && positionEndJ == positionStartJ - 1 && whitePawnsMovedTwoSquares[positionStartJ-1]) {
        if(enpassantBlackEnableLeft[positionStartJ] == 0 || enpassantBlackEnableLeft[positionStartJ] == -1) {
            enpassantBlackEnableLeft[positionStartJ] = -1;
            return -1;
        }
        return 0;
    }
    if(positionStartI == 4 && positionStartJ + 1 < COLUMNS && playMatrix[positionStartI][positionStartJ+1] == "whitePAWN" && positionEndI == positionStartI+1 && positionEndJ == positionStartJ + 1 && whitePawnsMovedTwoSquares[positionStartJ+1]) {
        if(enpassantBlackEnableRight[positionStartJ] == 0 || enpassantBlackEnableRight[positionStartJ] == 1) {
            enpassantBlackEnableRight[positionStartJ] = 1;
            return 1;
        }
        return 0;
    }
    return 0;
}

function canBishopMove(startI, startJ, endI, endJ, playMatrix) {
    return (
        canBishopMoveDirection1(startI, startJ, endI, endJ, playMatrix) ||
        canBishopMoveDirection2(startI, startJ, endI, endJ, playMatrix) ||
        canBishopMoveDirection3(startI, startJ, endI, endJ, playMatrix) ||
        canBishopMoveDirection4(startI, startJ, endI, endJ, playMatrix)
    )
}

function canBishopMoveDirection1(startI, startJ, endI, endJ, playMatrix) {
    let flagObstacle = false;
    let flagReachedDestination = false;

    let i = startI + 1;
    let j = startJ + 1;
    while(i < ROWS && j < COLUMNS) {
        if(i == endI && j == endJ) {
            flagReachedDestination = true;
            break;
        }
        if(playMatrix[i][j] != EMPTY)
            flagObstacle = true;
        i++;
        j++;
    }

    return flagReachedDestination && !flagObstacle;
}

function canBishopMoveDirection2(startI, startJ, endI, endJ, playMatrix) {
    let flagObstacle = false;
    let flagReachedDestination = false;

    let i = startI + 1;
    let j = startJ - 1;
    while(i < ROWS && j >= 0) {
        if(i == endI && j == endJ) {
            flagReachedDestination = true;
            break;
        }
        if(playMatrix[i][j] != EMPTY)
            flagObstacle = true;
        i++;
        j--;
    }

    return flagReachedDestination && !flagObstacle;
}

function canBishopMoveDirection3(startI, startJ, endI, endJ, playMatrix) {
    let flagObstacle = false;
    let flagReachedDestination = false;

    let i = startI - 1;
    let j = startJ + 1;
    while(i >= 0 && j < COLUMNS) {
        if(i == endI && j == endJ) {
            flagReachedDestination = true;
            break;
        }
        if(playMatrix[i][j] != EMPTY)
            flagObstacle = true;
        i--;
        j++;
    }
    return flagReachedDestination && !flagObstacle;
}

function canBishopMoveDirection4(startI, startJ, endI, endJ, playMatrix) {
    let flagObstacle = false;
    let flagReachedDestination = false;

    let i = startI - 1;
    let j = startJ - 1;
    while(i >= 0 && j >= 0) {
        if(i == endI && j == endJ) {
            flagReachedDestination = true;
            break;
        }
        if(playMatrix[i][j] != EMPTY)
            flagObstacle = true;
        i--;
        j--;
    }

    return flagReachedDestination && !flagObstacle;

}

// Function that checks whether you can move a piece and not get checked after

function canCheckAfterMove(positionStartI, positionStartJ, positionEndI, positionEndJ) {

    let pieceColor = getColorFromString(boardMatrix[positionStartI][positionStartJ]);
    let matrixCopy = makeMatrxCopy();

    let kingPositionI = -1;
    let kingPositionJ = -1;
    let found = false;

    // Make move
    matrixCopy[positionEndI][positionEndJ] = matrixCopy[positionStartI][positionStartJ];
    matrixCopy[positionStartI][positionStartJ] = EMPTY;

    // Find KING position on the copy of the board
    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            
            if(pieceColor == "white" && matrixCopy[i][j] == "whiteKING") {
                kingPositionI = i; kingPositionJ = j; found = true;
                break;
            }

            if(pieceColor == "black" && matrixCopy[i][j] == "blackKING") {
                kingPositionI = i; kingPositionJ = j; found = true;
                break;
            }
        }

        if(found) break;
    }

    // Check if king of given color is in check - if it is then this move is NOT legal
    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            if(matrixCopy[i][j] != EMPTY && getColorFromString(matrixCopy[i][j]) != pieceColor) {
                let test = isValidMove(i, j, kingPositionI, kingPositionJ, matrixCopy);
                if(test != -1) return true;
            }
        }
    }
    
    return false;
}

// Function that checks whether king of a given color is in CHECK

function isKingInCheck(color) {
    
    let positionI = -1;
    let positionJ = -1;
    let found = false;

    // Find KING position on the board (for a specified color)
    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            
            if(color == "white" && boardMatrix[i][j] == "whiteKING") {
                positionI = i; positionJ = j; found = true;
                break;
            }

            if(color == "black" && boardMatrix[i][j] == "blackKING") {
                positionI = i; positionJ = j; found = true;
                break;
            }
        }

        if(found) break;
    }

    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            if(boardMatrix[i][j] != EMPTY && getColorFromString(boardMatrix[i][j]) != color && isValidMove(i, j, positionI, positionJ, boardMatrix) != -1) {
                document.getElementById(generateUniquePosition(positionI, positionJ)).style.backgroundColor = "#800000";

                setTimeout(function() {
                    document.getElementById(generateUniquePosition(positionI, positionJ)).style.backgroundColor = ""; // Revert back to normal color
                }, 500);
                return true;
            }
        }
    }

    return false;
}

/*
    Return values:
    -1      -> black wins
    0       -> draw
    1       -> white wins
    2       -> not game over
*/
function isGameOver() {

    let numOfPieces = 0;
    let positionIwhiteKing = -1;
    let positionJwhiteKing = -1;
    let positionIblackKing = -1;
    let positionJblackKing = -1;
    let directions = [
        [-1,-1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];
    let whiteLose = true;
    let blackLose = true;

    for(let i = 0; i < ROWS; i++) {
        for(let j = 0; j < COLUMNS; j++) {
            if(boardMatrix[i][j] == "whiteKING") { positionIwhiteKing = i; positionJwhiteKing = j; }
            if(boardMatrix[i][j] == "blackKING") { positionIblackKing = i; positionJblackKing = j; }
            if(boardMatrix[i][j] != EMPTY) numOfPieces += 1;
        }
    }

    if(numOfPieces == 2) return DRAW; // Draw

    if(isKingInCheck("white")) {
        // Check if you can move king to any place around where he is not in check
        for(let element of directions) {
            let i = positionIwhiteKing + element[0];
            let j = positionJwhiteKing + element[1];
            
            if(i < 0 || i >= ROWS || j < 0 || j >= COLUMNS) continue;
            if(isValidMove(positionIwhiteKing, positionJwhiteKing, i, j, boardMatrix) != -1) {
                whiteLose = false;
                break;
            }
        }

        if(whiteLose) { // Check if you can block the attack by any other piece
            let flagBreak = false;
            for(let i = 0; i < ROWS; i++) {
                for(let j = 0; j < COLUMNS; j++) {
                    if(boardMatrix[i][j] != EMPTY && getColorFromString(boardMatrix[i][j]) == "white") {

                        for(let p = 0; p < ROWS; p++) {
                            for(let q = 0; q < COLUMNS; q++) {
                                if(p != i || q != j) {
                                    if(isValidMove(i, j, p, q, boardMatrix) != -1 && canCheckAfterMove(i, j, p, q) == false) {
                                        whiteLose = false;
                                        flagBreak = true;
                                        break;
                                    }
                                }
                            }
                            if(flagBreak) break;
                        }
                    }
                }
            }
        }
    }
    else {
        whiteLose = false;
    }

    if(isKingInCheck("black")) {
        // Check if you can move king to any place around where he is not in check
        for(let element of directions) {
            let i = positionIblackKing + element[0];
            let j = positionJblackKing + element[1];
            
            if(i < 0 || i >= ROWS || j < 0 || j >= COLUMNS) continue;
            if(isValidMove(positionIblackKing, positionJblackKing, i, j, boardMatrix) != -1) {
                blackLose = false;
                break;
            }
        }

        if(blackLose) { // Check if you can block the attack by any other piece
            let flagBreak = false;
            for(let i = 0; i < ROWS; i++) {
                for(let j = 0; j < COLUMNS; j++) {
                    if(boardMatrix[i][j] != EMPTY && getColorFromString(boardMatrix[i][j]) == "black") {

                        for(let p = 0; p < ROWS; p++) {
                            for(let q = 0; q < COLUMNS; q++) {
                                if(p != i || q != j) {
                                    if(isValidMove(i, j, p, q, boardMatrix) != -1 && canCheckAfterMove(i, j, p, q) == false) {
                                        blackLose = false;
                                        flagBreak = true;
                                        break;
                                    }
                                }
                            }
                            if(flagBreak) break;
                        }
                    }
                }
            }
        }
    }
    else {
        blackLose = false;
    }

    if(whiteLose) return WIN_BLACK;
    if(blackLose) return WIN_WHITE;
    
    // Check for STALEMATE
    let hasMove = false;
    if(turn == "white") {
        for(let i = 0; i < ROWS; i++) {
            for(let j = 0; j < COLUMNS; j++) {
                if(boardMatrix[i][j] != EMPTY && getColorFromString(boardMatrix[i][j]) == "white") {

                    for(let p = 0; p < ROWS; p++) {
                        for(let q = 0; q < COLUMNS; q++) {
                            if(isValidMove(i, j, p, q, boardMatrix) != -1) {
                                hasMove = true;
                                break;
                            }
                        }
                        if(hasMove) break;
                    }
                }
            }
        }
    }
    else {
        for(let i = 0; i < ROWS; i++) {
            for(let j = 0; j < COLUMNS; j++) {
                if(boardMatrix[i][j] != EMPTY && getColorFromString(boardMatrix[i][j]) == "black") {

                    for(let p = 0; p < ROWS; p++) {
                        for(let q = 0; q < COLUMNS; q++) {
                            if(isValidMove(i, j, p, q, boardMatrix) != -1) {
                                hasMove = true;
                                break;
                            }
                        }
                        if(hasMove) break;
                    }
                }
            }
        }
    }

    if(hasMove == false) return DRAW;
    return NOT_OVER;
}

function replacePawn(imageReference, source) {

    let color = getColorFromString(boardMatrix[pawnPositionI][pawnPositionJ]);

    let divDisplay = document.createElement("div");
    divDisplay.className = "displayAvailablePieces";
        let span = document.createElement("span");
        span.innerText = "Please choose one of below pieces by clicking on it!";

        let divImages = document.createElement("div");

        let imageRook = document.createElement("img"); imageRook.style.height = "100%"; imageRook.title = "Rook";
        let imageKnight = document.createElement("img"); imageKnight.style.height = "100%"; imageKnight.title = "Knight";
        let imageBishop = document.createElement("img"); imageBishop.style.height = "100%"; imageBishop.title = "Bishop";
        let imageQueen = document.createElement("img"); imageQueen.style.height = "100%"; imageQueen.title = "Queen";

        imageRook.onclick = function() {
            containerChoosePiece.innerHTML = "";

            if(color == "white") boardMatrix[pawnPositionI][pawnPositionJ] = "whiteROOK";
            else boardMatrix[pawnPositionI][pawnPositionJ] = "blackROOK";

            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).innerHTML = "";
            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).appendChild(imageRook);
            
            isKingInCheck("black");
            isKingInCheck("white");

            needPawnReplacement = EMPTY;
        }
        
        imageKnight.onclick = function() {
            containerChoosePiece.innerHTML = "";

            if(color == "white") boardMatrix[pawnPositionI][pawnPositionJ] = "whiteKNIGHT";
            else boardMatrix[pawnPositionI][pawnPositionJ] = "blackKNIGHT";

            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).innerHTML = "";
            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).appendChild(imageKnight);

            isKingInCheck("black");
            isKingInCheck("white");

            needPawnReplacement = EMPTY;
        }
        
        imageBishop.onclick = function() {
            containerChoosePiece.innerHTML = "";

            if(color == "white") boardMatrix[pawnPositionI][pawnPositionJ] = "whiteBISHOP";
            else boardMatrix[pawnPositionI][pawnPositionJ] = "blackBISHOP";

            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).innerHTML = "";
            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).appendChild(imageBishop);

            isKingInCheck("black");
            isKingInCheck("white");

            needPawnReplacement = EMPTY;
        }

        imageQueen.onclick = function() {
            containerChoosePiece.innerHTML = "";

            if(color == "white") boardMatrix[pawnPositionI][pawnPositionJ] = "whiteQUEEN";
            else boardMatrix[pawnPositionI][pawnPositionJ] = "blackQUEEN";

            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).innerHTML = "";
            document.getElementById(generateUniquePosition(pawnPositionI, pawnPositionJ)).appendChild(imageQueen);

            isKingInCheck("black");
            isKingInCheck("white");

            needPawnReplacement = EMPTY;
        }

    if(color == "white") {
        imageRook.src = "../Images/Pieces/whiteROOK.png";
        imageKnight.src = "../Images/Pieces/whiteKNIGHT.png";
        imageBishop.src = "../Images/Pieces/whiteBISHOP.png";
        imageQueen.src = "../Images/Pieces/whiteQUEEN.png";
    }
    else {
        imageRook.src = "../Images/Pieces/blackROOK.png";
        imageKnight.src = "../Images/Pieces/blackKNIGHT.png";
        imageBishop.src = "../Images/Pieces/blackBISHOP.png";
        imageQueen.src = "../Images/Pieces/blackQUEEN.png";
    }

    divDisplay.appendChild(span);
    divImages.appendChild(imageRook);
    divImages.appendChild(imageKnight);
    divImages.appendChild(imageBishop);
    divImages.appendChild(imageQueen);
    
    divDisplay.appendChild(divImages);

    containerChoosePiece.innerHTML = "";
    containerChoosePiece.appendChild(divDisplay);
}

function makeMatrxCopy() {
    let newMatrix = [];
    for(let i = 0; i < ROWS; i++) {
        let r = [];
        for(let j = 0; j < COLUMNS; j++)
            r.push(boardMatrix[i][j]);
        newMatrix.push(r);
    }
    return newMatrix;
}

function getColorFromString(inputString) {
    let s = "";

    for(let letter of inputString) {
        if(letter == letter.toLowerCase()) s += letter;
    }

    return s;
}

function generateUniquePosition(positionI, positionJ) {
    let position = "";
    if(positionI < 10) position += "0" + positionI;
    else position += positionI;

    if(positionJ < 10) position += "0" + positionJ;
    else position += positionJ;

    return position;
}

const ROWS = 8;
const COLUMNS = 8;
const initialPositions = [
    ["whitePAWN", ["0600", "0601", "0602", "0603", "0604", "0605", "0606", "0607"]],
    ["whiteROOK", ["0700", "0707"]],
    ["whiteKNIGHT", ["0701", "0706"]],
    ["whiteBISHOP", ["0702", "0705"]],
    ["whiteQUEEN", ["0703"]],
    ["whiteKING", ["0704"]],
    ["blackPAWN", ["0100", "0101", "0102", "0103", "0104", "0105", "0106", "0107"]],
    ["blackROOK", ["0000", "0007"]],
    ["blackKNIGHT", ["0001", "0006"]],
    ["blackBISHOP", ["0002", "0005"]],
    ["blackQUEEN", ["0003"]],
    ["blackKING", ["0004"]]
];

const DRAW = 0;
const WIN_BLACK = -1;
const WIN_WHITE = 1;
const NOT_OVER = 2;

const whitePAWN     = "whitePAWN";
const whiteROOK     = "whiteROOK";
const whiteKNIGHT   = "whiteKNIGHT";
const whiteBISHOP   = "whiteBISHOP";
const whiteQUEEN    = "whiteQUEEN";
const whiteKING     = "whiteKING";
const blackPAWN     = "blackPAWN";
const blackROOK     = "blackROOK";
const blackKNIGHT   = "blackKNIGHT";
const blackBISHOP   = "blackBISHOP";
const blackQUEEN    = "blackQUEEN";
const blackKING     = "blackKING";
const EMPTY         = "empty";
const WAITING       = "waiting";

const containerBoardDiv = document.getElementById("boardDiv");
const containerDisplayWinner = document.getElementById("textWin");
const containerChoosePiece = document.getElementById("choosePieceToChange");

let lastClicked = undefined;
let lastClassName = undefined;

let boardMatrix = undefined;

let draggedTo = undefined;
let turn = undefined;
let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;
let blackRookLeftMoved = false;
let blackRookRightMoved = false;
let whiteKingMoved = false;
let blackKingMoved = false;
let whiteKingCheck = false;
let blackKingCheck = false;
let gameOver = false;

let whitePawnsMovedTwoSquares = [];
let blackPawnsMovedTwoSquares = [];
let enpassantWhiteEnableLeft = [];
let enpassantWhiteEnableRight = [];
let enpassantBlackEnableLeft = [];
let enpassantBlackEnableRight = [];

let needPawnReplacement = EMPTY;
let pawnPositionI = -1;
let pawnPositionJ = -1;