const constants = require('../hlt/Constants');
const Geometry = require('../hlt/Geometry');

/**
 * strategy is a function that accepts the current game map and return a list of next steps to take
 * @param {GameMap} gameMap
 * @returns {string[]} moves that needs to be taken. null values are ignored
 */
// baubot 4 target strat.
function fourStrat(gameMap) {
    // Here we build the set of commands to be sent to the Halite engine at the end of the turn
    // one ship - one command
    // in this particular strategy we only give new commands to ships that are not docked
    const moves = gameMap.myShips.filter(s => s.isUndocked()).map(
    ship => {
        // Look for a close free planet.
        var freePlanets = gameMap.planets.filter(p => p.isFree());
        freePlanets = [...freePlanets].sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
        var freePlanet = freePlanets[0];

        // Look for dockable planets.
        var dockPlanets = gameMap.planets.filter(p => (p.isOwnedByMe() && p.hasDockingSpot()));
        dockPlanets = [...dockPlanets].sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
        var dockPlanet = dockPlanets[0];

        // Look for enemy ship.
        var enemies = gameMap.enemyShips;
        enemies = [...enemies].sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
        var enemy = enemies[0];

        // Looke for vulnerable enemy ships.
        var dockedEnemies = enemies.filter(e => !e.isUndocked());
        dockedEnemies = [...enemies].sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
        var docked = dockedEnemies[0];

        if(freePlanets.length > 0 && dockPlanets.length > 0) {
            if (
                ship.distanceBetween(freePlanet) <= ship.distanceBetween(dockPlanet) + 15 &&
                ship.distanceBetween(freePlanet) < ship.distanceBetween(enemy) + 15
            ) {
                if (ship.canDock(freePlanet)) {
                    return ship.dock(freePlanet);
                } else {
                    return ship.navigate({
                        target: freePlanet,
                        keepDistanceToTarget: freePlanet.radius + 3,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            } else if (
                ship.distanceBetween(dockPlanet) < ship.distanceBetween(freePlanet) - 15 &&
                ship.distanceBetween(dockPlanet) < ship.distanceBetween(enemy) + 15
            ) {
                if (ship.canDock(dockPlanet)) {
                    return ship.dock(dockPlanet);
                } else {
                    return ship.navigate({
                        target: dockPlanet,
                        keepDistanceToTarget: dockPlanet.radius + 3,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            } else {
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + 5) {
                    return ship.navigate({
                        target: docked,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                } else {
                    return ship.navigate({
                        target: enemy,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            }
        } else if(freePlanets.length > 0 && dockPlanets.length === 0) {
            if (ship.distanceBetween(freePlanet) < ship.distanceBetween(enemy) + 15) {
                if (ship.canDock(freePlanet)) {
                    return ship.dock(freePlanet);
                } else {
                    return ship.navigate({
                        target: freePlanet,
                        keepDistanceToTarget: freePlanet.radius + 3,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            } else {
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + 5) {
                    return ship.navigate({
                        target: docked,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                } else {
                    return ship.navigate({
                        target: enemy,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            }
        }  else if(dockPlanets.length > 0 && freePlanets.length === 0) {
            if (ship.distanceBetween(dockPlanets) < ship.distanceBetween(enemy) + 15) {
                if (ship.canDock(dockPlanets)) {
                    return ship.dock(dockPlanets);
                } else {
                    return ship.navigate({
                        target: dockPlanet,
                        keepDistanceToTarget: dockPlanet.radius + 3,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            } else {
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + 5) {
                    return ship.navigate({
                        target: docked,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                } else {
                    return ship.navigate({
                        target: enemy,
                        keepDistanceToTarget: 5,
                        speed: constants.MAX_SPEED,
                        avoidObstacles: true,
                        ignoreShips: false
                    });
                }
            }
        } else {
            if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + 5) {
                return ship.navigate({
                    target: docked,
                    keepDistanceToTarget: 5,
                    speed: constants.MAX_SPEED,
                    avoidObstacles: true,
                    ignoreShips: false
                });
            } else {
                return ship.navigate({
                    target: enemy,
                    keepDistanceToTarget: 5,
                    speed: constants.MAX_SPEED,
                    avoidObstacles: true,
                    ignoreShips: false
                });
            }
        }
    });
    return moves;
}
// baubot focus strat.
function focusStrat(gameMap) {
    var targetPlanet;

    const moves = gameMap.myShips.filter(s => s.isUndocked()).map(
    ship => {
        // If targetPlanet is not set, find nearest planet and set to targetPlanet.
            // Head for planet.
        // Else
            // If distance from ship to planet is less than 5.
                // If planet dockable, dock.
                // Else find all vulnerable enemies.
                    // If there are vulnerable enemies, kill.
                    // Else, find next
            // Else
    });
    return moves;
}
module.exports = {fourStrat,focusStrat};
