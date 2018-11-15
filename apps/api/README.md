# Checkers game backend

## Prerequirements
- Redis
- MongoDB


## Installation

    $ git clone git@github.com:DmytryS/checkers-game.git
    $ cd ~/Documents/checkers-game/apps/api
    $ cp config/config.json.sample config/config.json
    $ npm install
    $ npm start

## Check coverage with istanbul

    $ npm run test:coverage-check

## Run tests

    $ npm run test

## Check lint

    $ npm run lint