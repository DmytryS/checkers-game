

export default class Checkers {
    constructor() {
        this._board = new Array(8);
        this._availableJumps = {};
        this._jumpOccurred = false;
        this._game = false;
    }

    _initGameBoard() {
        for(let i = 0; i < board.length; i++) {
            board[ i ] = new Array(8);
            for(let j = 0; j < board[ i ].length; j++) {
                board[ i ][ j ] = '';
            }
        }
    }

    set VirtualBoard(data) {
        this._board = data;
    }

    get VirtualBoard() {
        return board;
    }

    populateBoard(positions) {
        Object.keys(positions).forEach((key) => {
            let coord = key.split('');
            let x = coord[ 0 ].charCodeAt(0) - 97;
            let y = parseInt(coord[ 1 ]) - 1;
		
            board[ x ][ y ] = positions[ key ];
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
            board[ oldX ][ oldY ] = '';
            board[ newX ][ newY ] = piece;
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
        } else if(board[ newX ][ newY ] !== '') {
            bool = false;
        }
        return bool;
    }

    // forward move for blackpiece
    negativeMove(oldX, oldY, newX, newY) {
        let bool = true;

        if((newY - oldY) !== -1 || ((newX - oldX) !== 1 && (newX - oldX) !== -1)) {
            bool = false;
        } else if(board[ newX ][ newY ] !== '') {
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
        } else if(board[ newX ][ newY ] !== '') { // Check that the new location does not already have a piece there
            bool = false;
        } else if(newX > oldX) {
            /* istanbul ignore if */
            if(board[ oldX + 1 ][ oldY + 1 ] === '' || board[ oldX + 1 ][ oldY + 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                board[ oldX + 1 ][ oldY + 1 ] = '';
                this._jumpOccurred = true;
            }
            // the user jumped to the left
        } else if(newX < oldX) {
            /* istanbul ignore if */
            if(board[ oldX - 1 ][ oldY + 1 ] === '' || board[ oldX - 1 ][ oldY + 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                board[ oldX - 1 ][ oldY + 1 ] = '';
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
        } else if(board[ newX ][ newY ] !== '') {
            bool = false;
        } else if(newX > oldX) {
            /* istanbul ignore if */
            if(board[ oldX + 1 ][ oldY - 1 ] === '' || board[ oldX + 1 ][ oldY - 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                board[ oldX + 1 ][ oldY - 1 ] = '';
                this._jumpOccurred = true;
            }
            // the user jumped to the left
        } else if(newX < oldX) {
            /* istanbul ignore if */
            if(board[ oldX - 1 ][ oldY - 1 ] === '' || board[ oldX - 1 ][ oldY - 1 ].indexOf(pieceType[ 0 ]) !== -1) {
                bool = false;
            } else {
                // destroy the piece
                board[ oldX - 1 ][ oldY - 1 ] = '';
                this._jumpOccurred = true;
            }

        }
        return bool;
    }

    kingMe(piece, newX, newY) {
        if(piece === 'wP') {
            if(newY === 7) {
                board[ newX ][ newY ] = 'wK';
            }
        } else if(piece === 'bP') {
            if(newY === 0) {
                board[ newX ][ newY ] = 'bK';
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

        for(let row = 0; row < board.length; row++) {
            for(let col = 0; col < board[ row ].length; col++) {
                // Get piece of the same color
                if(board[ row ][ col ].indexOf(colorSplit[ 0 ]) !== -1) {
                    futureRowPositive = row + 2;
                    futureRowNegative = row - 2;
                    futureColPositive = col + 2;
                    futureColNegative = col - 2;
                    // FORWARD MOVE
                    // Make sure rows do not go out array dimensions
                    if(futureColPositive < board[ row ].length && board[ row ][ col ] !== 'bP') {
                        // Make sure cols do not go out of array dimensions
                        if(futureRowPositive < board[ row ].length) {
                            // check that there is ample jumping space, forward moves strictly enforce black mans to go forward
                            if(board[ futureRowPositive ][ futureColPositive ] === '') {
                                // check that there is a piece in the spot and that it is the opponents
                                if(board[ futureRowPositive - 1 ][ futureColPositive - 1 ].indexOf(colorSplit[ 0 ]) === -1 && board[ futureRowPositive - 1 ][ futureColPositive - 1 ] !== '') {
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
                            if(board[ futureRowNegative ][ futureColPositive ] === '') {
                                // check that there is a piece between of opposite color
                                if(board[ futureRowNegative + 1 ][ futureColPositive - 1 ].indexOf(colorSplit[ 0 ]) === -1 && board[ futureRowNegative + 1 ][ futureColPositive - 1 ] !== '') {
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
                    if(futureColNegative >= 0 && board[ row ][ col ] !== 'wP') {
                        // Make sure cols do not go out of array dimensions
                        if(futureRowNegative >= 0) {
                            // check that there is ample jumping space, backward moves strictly enforce white mans to go backward
                            if(board[ futureRowNegative ][ futureColNegative ] === '') {
                                // check that there is a piece in the spot and that it is the opponents
                                if(board[ futureRowNegative + 1 ][ futureColNegative + 1 ].indexOf(colorSplit[ 0 ]) === -1 && board[ futureRowNegative + 1 ][ futureColNegative + 1 ] !== '') {
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
                        if(futureRowPositive < board.length) {
                            // check to make sure there is ample jumping space
                            if(board[ futureRowPositive ][ futureColNegative ] === '') {
                                // check that there is a piece between of opposite color
                                if(board[ futureRowPositive - 1 ][ futureColNegative + 1 ].indexOf(colorSplit[ 0 ]) === -1 && board[ futureRowPositive - 1 ][ futureColNegative + 1 ] !== '') {
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

        if(boardLocation in availableJumps) {
            availableJumps[ boardLocation ].push(boardPosition);
        } else {
            availableJumps[ boardLocation ] = [ boardPosition ];
        }
    }

    forceJump(startPos, endPos) {
        if(Object.keys(availableJumps).length === 0) {
            return true;
        }
        if(startPos in availableJumps) {
            for(let i = 0; i < availableJumps[ startPos ].length; i++) {
                if(availableJumps[ startPos ][ i ] === endPos) {
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
        if(Object.keys(availableJumps).length === 0) {
            return false;
        }
        return true;
    }

    getJumpOccurred() {
        return jumpOccurred;
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

    boardContains(board, value) {
        let piece;
        let king;

        if (value === 'black') {
            piece = 'bP';
            king = 'bK';
        } else if (value === 'white') {
            piece = 'wP';
            king = 'wK';
        }
		
        for (let i = 0; i < board.length; i++) {
            for (let k = 0; k < board[ i ].length; k++) {
                if (board[ i ][ k ] === piece || board[ i ][ k ] === king) {
                    return true;
                }
            }
        }
	
        return false;
    }
}

