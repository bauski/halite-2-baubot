const constants = require('../hlt/Constants');
const Geometry = require('../hlt/Geometry');

/**
 * strategy is a function that accepts the current game map and return a list of next steps to take
 * @param {GameMap} gameMap
 * @returns {string[]} moves that needs to be taken. null values are ignored
 */
// baubot 4 target strat.
// Change target preferences depending on how many planets we have.
function fourStrat(gameMap) {
    // Get all planets
    var planets = gameMap.planets;
    // Set distance Buffer variables
    dockedEnemyBuffer = 5;
    enemyBuffer = 15;
    dockBuffer = 15;
    freeBuffer = 15;
    // Ship Commands
    const moves = gameMap.myShips.filter(s => s.isUndocked()).map(
    ship => {
        // Get my planets.
        var myPlanets = planets.filter(p => p.isOwnedByMe());
        if(myPlanets < 3) {
            enemyBuffer = 15;
            dockBuffer = 15;
            freeBuffer = 35;
        } else {
            enemyBuffer = 15;
            dockBuffer = 15;
            freeBuffer = 15;
        }

        // Look for a close free planet.
        var freePlanets = planets.filter(p => p.isFree()).sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
        var freePlanet = freePlanets[0];

        // Look for dockable planets.
        var dockPlanets = planets.filter(p => (p.isOwnedByMe() && p.hasDockingSpot())).sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b));
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
                ship.distanceBetween(freePlanet) <= ship.distanceBetween(dockPlanet) + dockBuffer &&
                ship.distanceBetween(freePlanet) < ship.distanceBetween(enemy) + enemyBuffer
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
                ship.distanceBetween(dockPlanet) < ship.distanceBetween(freePlanet) - freeBuffer &&
                ship.distanceBetween(dockPlanet) < ship.distanceBetween(enemy) + enemyBuffer
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
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + dockedEnemyBuffer) {
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
            if (ship.distanceBetween(freePlanet) < ship.distanceBetween(enemy) + enemyBuffer) {
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
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + enemyBuffer) {
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
            if (ship.distanceBetween(dockPlanets) < ship.distanceBetween(enemy) + enemyBuffer) {
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
                if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + dockedEnemyBuffer) {
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
            if (ship.distanceBetween(docked) < ship.distanceBetween(enemy) + dockedEnemyBuffer) {
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
