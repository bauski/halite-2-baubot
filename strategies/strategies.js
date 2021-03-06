const constants = require('../hlt/Constants');
const Geometry = require('../hlt/Geometry');
const Log = require('../hlt/Log');

// baubot basic strat.
function basic(gameMap) {
    var planets = gameMap.planets;
    var enemies = gameMap.enemyShips;
    var targetPlanet = false;
    var targetEnemy = false;

    var planetBuffer = 25;
    var enemyBuffer = 5;
    var targetBuffer = 15;

    var myPlanets = planets.filter(p => p.isOwnedByMe());
    var dockablePlanets = myPlanets.filter(p => p.hasDockingSpot());
    var freePlanets = planets.filter(p => p.isFree());
    var activeEnemies = enemies.filter(s => s.isUndocked());
    var busyEnemies = enemies.filter(s => !s.isUndocked());
    var activeAllies = gameMap.myShips.filter(s => s.isUndocked());

    // Ship Tactics.
    const moves = gameMap.myShips.filter(s => s.isUndocked()).map(
    ship => {
        var dockablePlanet = getClosest(dockablePlanets,ship);
        var freePlanet = getClosest(freePlanets,ship);
        var activeEnemy = getClosest(activeEnemies,ship);
        var busyEnemy = getClosest(busyEnemies,ship);
        var myPlanet = getClosest(myPlanets,ship);
        var activeAlly = getClosest(activeAllies,ship,1);

        // Set target planet if possible.
        targetPlanet = getTarget(freePlanet, dockablePlanet, planetBuffer, ship);
        // Set target enemy if possible.
        targetEnemy = getTarget(busyEnemy, activeEnemy, enemyBuffer, ship);

        if(targetPlanet && targetEnemy) {
            if(ship.distanceBetween(targetPlanet) + targetBuffer < ship.distanceBetween(targetEnemy)) {
                return tryDocking(ship,targetPlanet);
            } else {
                return attack(ship, targetEnemy, activeAlly);
            }
        }  else if(targetPlanet && !targetEnemy) {
            return tryDocking(ship,targetPlanet);
        } else if(!targetPlanet && targetEnemy) {
            return attack(ship, targetEnemy, activeAlly);
        }
    });
    return moves;

    function attack(ship, target, ally) {

        if(ship.distanceBetween(target) <= 5) {
            if(ally) {
                if(ship.distanceBetween(target) < ship.distanceBetween(ally)) {
                    return move(ship, ally);
                } else {
                    return move(ship, target);
                }
            } else {
                return move(ship, target);
            }
        } else {
            return move(ship, target);
        }
    }

    function getClosest(multiple, ship, index = 0) {
        if(multiple.length > 0) {
            return multiple.sort((a, b) => Geometry.distance(ship, a) - Geometry.distance(ship, b))[index];
        } else {
            return false;
        }
    }

    function tryDocking(ship,planet) {
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

    function move(ship, target, distance = 5) {
        var speed = constants.MAX_SPEED;
        if(target.toString()[0] == "p") {
            distance = target.radius + 3;
            if(ship.distanceBetween(target) < 20) {
                speed = speed/1.5;
            }
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
