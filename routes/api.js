'use strict';
var Game = require('../lib/checkers');

exports.getBoard = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};

exports.getRole = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get role', {role: 'p1'})
    }
};

exports.getTurn = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        console.log('send log');
        socket.emit('get turn', {turn: 'p1'})
    }
};

exports.connectGame = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};

exports.disconnectGame = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};

exports.surrender = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};

exports.makeMove = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};

exports.getGamesList = function (socket, gameList) {
    return function () {
        let board = new Game(123, {id: 312, name: 'Vasya'});
        board.newGame();
        socket.emit('get board', {board: board.getBoard})
    }
};