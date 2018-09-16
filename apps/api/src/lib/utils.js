export function dumpUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
}

export function dumpGame(game) {
    return {
        id: game._id,
        player1: game.player1,
        player2: game.player2,
        winner: game.winner,
        status: game.status
    };
}
