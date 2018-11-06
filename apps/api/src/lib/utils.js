export function dumpUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
}

export function dumpGame(game) {
    return {
        id: game.id,
        player1: game.player1,
        player2: game.player2 || null,
        winner: game.winner || null,
        status: game.status,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
    };
}

export function dumpAction(action) {
    return {
        id: action.id,
        userId: action.userId,
        type: action.type,
        createdAt: action.createdAt,
        updatedAt: action.updatedAt
    };
}
