

export default class Checkers {
    constructor(gameBoard) {
        this._board = new Array(8);
        this._availableJumps = {};
        this._jumpOccurred = false;
        this._game = false;

        if (gameBoard) {
            this._board = gameBoard;
        } else {
            this._initGameBoard();
        }
    }

    _initGameBoard() {
        for(let i = 0; i < this._board.length; i++) {
            this._board[ i ] = new Array(8);
            for(let j = 0; j < this._board[ i ].length; j++) {
                this._board[ i ][ j ] = '';
            }
        }
    }

    set board(data) {
        this._board = data;
    }

    get board() {
        return this._board;
    }

    populateBoard(positions) {
        Object.keys(positions).forEach((key) => {
            let coord = key.split('');
            let x = coord[ 0 ].charCodeAt(0) - 97;
            let y = parseInt(coord[ 1 ]) - 1;
		
            this._board[ x ][ y ] = positions[ key ];
        });
    }

    validMove(piece, oldPos, newPos) {
        let bool = false;

        let oldCoord = oldPos.split('');
        let newCoord = newPos.split('');
		
        let oldX = oldCoord[ 0 ].charCodeAt(0) - 97;
        let oldY = parseInt(oldCoord[ 1 ]) - 1;

        let newX = newCoord[ 0 ].charCodeAt(0) - 97;
        let newY = parseInt(newCoord[ 1 ]) - 1;

        if(piece === 'wP') {
            if(this.positiveJump(piece, oldX, oldY, newX, newY)) {
                bool = true;
            } else if(this.positiveMove(oldX, oldY, newX, newY)) {
                bool = true;
            }
        } else if (piece === 'bP') {
            if(this.negativeMove(oldX, oldY, newX, newY)) {
                bool = true;
            } else if(this.negativeJump(piece, oldX, oldY, newX, newY)) {
                bool = true;
            }
        } else if(piece === 'wK' || piece === 'bK') {
            if(this.positiveJump(piece, oldX, oldY, newX, newY)) {
                bool = true;
            } else if(this.positiveMove(oldX, oldY, newX, newY)) {
                bool = true;
            } else if(this.negativeMove(oldX, oldY, newX, newY)) {
                bool = true;
            } else if(this.negativeJump(piece, oldX, oldY, newX, newY)) {
                bool = true;
            }
        }
        // update the this._board with the new location of the pieces
        if(bool) {
            this._board[ oldX ][ oldY ] = '';
            this._board[ newX ][ newY ] = piece;
            this.kingMe(piece, newX, newY);
        }
		
        // update the this._board with the new coordinates
        return bool;
    }

    // forward move for whitepiece
    positiveMove(oldX, oldY, newX, newY) {
        let bool = true;

        if((newY - oldY) !== 1 || ((newX - oldX) !== 1 && (newX - oldX) !== -1)) {
            bool = false;
        } else if(this._board[ newX ][ newY ] !== '') {
            bool = false;
        }
        return bool;
    }

    // forward move for blackpiece
    negativeMove(oldX, oldY, newX, newY) {
        let bool = true;

        if((newY - oldY) !== -1 || ((newX - oldX) !== 1 && (newX - oldX) !== -1)) {
            bool = false;
        } else if(this._board[ newX ][ newY ] !== '') {
            bool = false;
        }
        return bool;
    }

    positiveJump(piece, oldX, oldY, newX, newY) {
        let bool = true;
        let pieceType = piece.split('');
        /* Check that the user moved the piece 2 rows up and 2 columns away
		  from the orginal position
		*/

        if (newY - oldY !== 2 || ((newX - oldX) !== 2 && (newX - oldX) !== -2)) {
            bool = false;
        } else if(this._board[ newX ][ newY ] !== '') { // Check that the new location does not already have a piece there
            bool = false;
        } else if(newX > oldX) {
            /* istanbul ignore if */
            if(this._board[ oldX + 1 ][ oldY + 1 ] === '' || this._board[ oldX + 1 ][ oldY + 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                this._board[ oldX + 1 ][ oldY + 1 ] = '';
                this._jumpOccurred = true;
            }
            // the user jumped to the left
        } else if(newX < oldX) {
            /* istanbul ignore if */
            if(this._board[ oldX - 1 ][ oldY + 1 ] === '' || this._board[ oldX - 1 ][ oldY + 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                this._board[ oldX - 1 ][ oldY + 1 ] = '';
                this._jumpOccurred = true;
            }
        }

        return bool;
    }

    negativeJump(piece, oldX, oldY, newX, newY) {
        let bool = true;
        let pieceType = piece.split('');
        /* Check that the user moved the piece 2 rows down and 2 columns away
		  from the orginal position
		*/

        if(oldY - newY !== 2 || ((newX - oldX) !== 2 && (newX - oldX) !== -2)) {
            bool = false;
        } else if(this._board[ newX ][ newY ] !== '') {
            bool = false;
        } else if(newX > oldX) {
            /* istanbul ignore if */
            if(this._board[ oldX + 1 ][ oldY - 1 ] === '' || this._board[ oldX + 1 ][ oldY - 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                this._board[ oldX + 1 ][ oldY - 1 ] = '';
                this._jumpOccurred = true;
            }
            // the user jumped to the left
        } else if(newX < oldX) {
            /* istanbul ignore if */
            if(this._board[ oldX - 1 ][ oldY - 1 ] === '' || this._board[ oldX - 1 ][ oldY - 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                this._board[ oldX - 1 ][ oldY - 1 ] = '';
                this._jumpOccurred = true;
            }

        }
        return bool;
    }

    kingMe(piece, newX, newY) {
        if(piece === 'wP') {
            if(newY === 7) {
                this._board[ newX ][ newY ] = 'wK';
            }
        } else if(piece === 'bP') {
            if(newY === 0) {
                this._board[ newX ][ newY ] = 'bK';
            }
        }
    }

    checkForJumps(color, boardLocation) {
        // used for getting first character of the color for comparison of piece objects
        let colorSplit = color.split('');
        // used for getting this._board locations to integer values
        let location = boardLocation.split('');
        // coords of the dragstart piece
        let x = location[ 0 ].charCodeAt(0) - 97;
        let y = parseInt(location[ 1 ]) - 1;
        let bool = false;
        let futureRowPositive;
        let futureRowNegative;
        let futureColPositive;
        let futureColNegative;

        // reset the value of flag for jumpoccurring
        this._jumpOccurred = false;

        for(let row = 0; row < this._board.length; row++) {
            for(let col = 0; col < this._board[ row ].length; col++) {
                // Get piece of the same color
                if(this._board[ row ][ col ].indexOf(colorSplit[ 0 ]) !== -1) {
                    futureRowPositive = row + 2;
                    futureRowNegative = row - 2;
                    futureColPositive = col + 2;
                    futureColNegative = col - 2;
                    // FORWARD MOVE
                    // Make sure rows do not go out array dimensions
                    if(futureColPositive < this._board[ row ].length && this._board[ row ][ col ] !== 'bP') {
                        // Make sure cols do not go out of array dimensions
                        if(futureRowPositive < this._board[ row ].length) {
                            // check that there is ample jumping space, forward moves strictly enforce black mans to go forward
                            if(this._board[ futureRowPositive ][ futureColPositive ] === '') {
                                // check that there is a piece in the spot and that it is the opponents
                                if(this._board[ futureRowPositive - 1 ][ futureColPositive - 1 ].indexOf(colorSplit[ 0 ]) === -1 && this._board[ futureRowPositive - 1 ][ futureColPositive - 1 ] !== '') {
                                    // There is a jump available and the clicked piece is not the piece that can jump
                                    if(x === row && y === col) {
                                        bool = false;
                                        this.addToAvailableJumps(futureRowPositive, futureColPositive, boardLocation);
                                        return bool;
                                    }
										
                                    bool = true;
                                }
                            } // Make sure cols and rows do not go out of array dimensions negatively
                        }
                        if(futureRowNegative >= 0) {
                            // check to make sure there is ample jumping space
                            if(this._board[ futureRowNegative ][ futureColPositive ] === '') {
                                // check that there is a piece between of opposite color
                                if(this._board[ futureRowNegative + 1 ][ futureColPositive - 1 ].indexOf(colorSplit[ 0 ]) === -1 && this._board[ futureRowNegative + 1 ][ futureColPositive - 1 ] !== '') {
                                    // There is a jump available and the clicked piece is not the piece that can jump
                                    if(x === row && y === col) {
                                        bool = false;
                                        this.addToAvailableJumps(futureRowNegative, futureColPositive, boardLocation);
                                        return bool;
                                    }
                                    bool = true;
                                }
                            }
                        }

                    }
                    // BACKWARD MOVE
                    // Make sure rows do not go out array dimensions
                    if(futureColNegative >= 0 && this._board[ row ][ col ] !== 'wP') {
                        // Make sure cols do not go out of array dimensions
                        if(futureRowNegative >= 0) {
                            // check that there is ample jumping space, backward moves strictly enforce white mans to go backward
                            if(this._board[ futureRowNegative ][ futureColNegative ] === '') {
                                // check that there is a piece in the spot and that it is the opponents
                                if(this._board[ futureRowNegative + 1 ][ futureColNegative + 1 ].indexOf(colorSplit[ 0 ]) === -1 && this._board[ futureRowNegative + 1 ][ futureColNegative + 1 ] !== '') {
                                    // There is a jump available and the clicked piece is not the piece that can jump
                                    if(x === row && y === col) {
                                        bool = false;
                                        this.addToAvailableJumps(futureRowNegative, futureColNegative, boardLocation);
                                        return bool;
                                    }
										
                                    bool = true;
                                }
                            } // Make sure cols do not go out of array dimensions negatively
                        }
                        if(futureRowPositive < this._board.length) {
                            // check to make sure there is ample jumping space
                            if(this._board[ futureRowPositive ][ futureColNegative ] === '') {
                                // check that there is a piece between of opposite color
                                if(this._board[ futureRowPositive - 1 ][ futureColNegative + 1 ].indexOf(colorSplit[ 0 ]) === -1 && this._board[ futureRowPositive - 1 ][ futureColNegative + 1 ] !== '') {
                                    // There is a jump available and the clicked piece is not the piece that can jump
                                    if(x === row && y === col) {
                                        bool = false;
                                        this.addToAvailableJumps(futureRowPositive, futureColNegative, boardLocation);
                                        return bool;
                                    }
										
                                    bool = true;
									
                                }
                            }
                        }
                    }
                }
            }
        }
        return bool;
    }

    addToAvailableJumps(firstDigit, secondDigit, boardLocation) {
        let chr = String.fromCharCode(97 + firstDigit);
        let boardPosition = chr.concat(secondDigit + 1);

        if(boardLocation in this._availableJumps) {
            this._availableJumps[ boardLocation ].push(boardPosition);
        } else {
            this._availableJumps[ boardLocation ] = [ boardPosition ];
        }
    }

    forceJump(startPos, endPos) {
        if(Object.keys(this._availableJumps).length === 0) {
            return true;
        }
        if(startPos in this._availableJumps) {
            for(let i = 0; i < this._availableJumps[ startPos ].length; i++) {
                if(this._availableJumps[ startPos ][ i ] === endPos) {
                    // clear out the map for til the next time
                    this._availableJumps = {};
                    return true;
                }
            }
        }
        return false;
    }

    checkDoubleJump(piece, position) {
        checkForJumps(piece, position);
        if(Object.keys(this._availableJumps).length === 0) {
            return false;
        }
        return true;
    }

    getJumpOccurred() {
        return this._jumpOccurred;
    }

    checkWinLose(playerColor) {
        let result = 'none';

        if (playerColor === 'wP' || playerColor === 'wK') {
            let containsBlack = this.boardContains(board, 'black');

            if (containsBlack === false) {
                result = 'win';
            }
        } else if (playerColor === 'bP' || playerColor === 'bK') {
            let containsWhite = this.boardContains(board, 'white');

            if (containsWhite === false) {
                result = 'win';
            }
        }

        return result;
    }

    boardContains(value) {
        let piece;
        let king;

        if (value === 'black') {
            piece = 'bP';
            king = 'bK';
        } else if (value === 'white') {
            piece = 'wP';
            king = 'wK';
        }
		
        for (let i = 0; i < this._board.length; i++) {
            for (let k = 0; k < this._board[ i ].length; k++) {
                if (this._board[ i ][ k ] === piece || this._board[ i ][ k ] === king) {
                    return true;
                }
            }
        }
	
        return false;
    }
}

