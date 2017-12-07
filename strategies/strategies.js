const constants = require('../hlt/Constants');
const Geometry = require('../hlt/Geometry');

// baubot 4 target strat.
function basic(gameMap) {
    var planets = gameMap.planets;
    var enemies = gameMap.enemyShips;
    var targetPlanet = false;
    var targetEnemy = false;

    var planetBuffer = 15;
    var enemyBuffer = 5;

    // Ship Tactics.
    const moves = gameMap.myShips.filter(s => s.isUndocked()).map(
    ship => {
        var dockablePlanets = planets.filter(p => p.isOwnedByMe() && p.hasDockingSpot());
        var dockablePlanet = getClosest(dockablePlanets,ship);

        var freePlanets = planets.filter(p => p.isFree());
        var freePlanet = getClosest(freePlanets,ship);

        var activeEnemies = enemies.filter(s => s.isUndocked());
        var activeEnemy = getClosest(activeEnemies,ship);

        var busyEnemies = enemies.filter(s => !s.isUndocked());
        var busyEnemy = getClosest(busyEnemies,ship);

        // Set target planet if possible.
        targetPlanet = getTarget(freePlanet, dockablePlanet, planetBuffer, ship);
        // Set target enemy if possible.
        targetEnemy = getTarget(busyEnemy, activeEnemy, enemyBuffer, ship);

        if(targetPlanet && targetEnemy) {
            if(ship.distanceBetween(targetPlanet) < ship.distanceBetween(targetEnemy)) {
                return tryDocking(ship,targetPlanet,move);
            } else {
                return move(ship,targetEnemy);
            }
        }  else if(targetPlanet && !targetEnemy) {
            return tryDocking(ship,targetPlanet,move);
        } else if(!targetPlanet && targetEnemy) {
            return move(ship,targetEnemy);
        }
    });
    return moves;

    function getClosest(multiple,ship) {
        if(multiple.length > 0) {
            return multiple.sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))[0];
        } else {
            return false;
        }
    }

    function tryDocking(ship,planet,move) {
        if(ship.canDock(planet)) {
            return ship.dock(planet);
        } else {
            return move(ship,planet);
        }
    }

    function getTarget(preferred,secondary,buffer,ship) {
        var target = false;
        if(preferred && secondary) {
            if(ship.distanceBetween(preferred) < ship.distanceBetween(secondary) + buffer) {
                target = preferred;
            } else {
                target = secondary;
            }
        } else if(preferred && !secondary) {
            target = preferred;
        } else if(!preferred && secondary) {
            target = secondary;
        }
        return target;
    }

    function move(ship,target) {
        var speed = constants.MAX_SPEED;
        var distance = 5;
        if(target.toString()[0] == "p") {
            distance = target.radius + 3;
        }
        return ship.navigate({
            target: target,
            keepDistanceToTarget: distance,
            speed: speed,
            avoidObstacles: true,
            ignoreShips: false
        });
    }
}
module.exports = {basic};
