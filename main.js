var RoomController = require('RoomController');

var Builder = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Fill up Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Build Structures
                buildStructures(mycreep);
                break;
            case 2:
                //Repair Structures
                repairStructures(mycreep);
                break;
            case 3:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
            case 4:
                mycreep.moveTo(Game.flags.Build);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var type = RoomController.SOURCE_ENERGY;
    
        if(mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length > 0){
            type = RoomController.SOURCE_CONTAINER;
        }
        RoomController.getSource(mycreep, type);
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    if(Game.getObjectById(mycreep.memory.source) instanceof Structure){
        //Getting energy from a container
        var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
        if(source === ERR_NOT_IN_RANGE){
            mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
        }
        else if(source === OK){
            return;
        }
        else{
            mycreep.memory.source = null;
        }
    }
    else{
        //Getting energy from a source
        if(mycreep.harvest(Game.getObjectById(mycreep.memory.source)) === ERR_NOT_IN_RANGE) {
            mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
        }
    }
}

function buildStructures(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_BUILD);
    }
    
    var target = mycreep.build(Game.getObjectById(mycreep.memory.target));
    if(target === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(target === OK){
        return;
    }
    else {
        mycreep.memory.target = null;
    }
}

function repairStructures(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_REPAIR);
    }
    
    if(Game.getObjectById(mycreep.memory.target).hits === Game.getObjectById(mycreep.memory.target).hitsMax){
        mycreep.memory.target = null;
        return;
    }
    
    var target = mycreep.repair(Game.getObjectById(mycreep.memory.target));
    if(target === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(target === OK){
        return;
    }
    else {
        mycreep.memory.target = null;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(Game.flags.Build){
        if(Game.flags.Build.room !== mycreep.room){
            mycreep.memory.state = 4;
            return;
        }
    }
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.find(FIND_CONSTRUCTION_SITES).length){
            mycreep.memory.state = 1;
        }
        else{
            if(mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax}).length){
                mycreep.memory.state = 2;
            }
            else{
                mycreep.memory.state = 3;
            }
        }
    }
}

//Game.spawns.E4S33A.createCreep([CLAIM,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY], "Cl0000", {room: "E4S33", role: "Cl", state: 0, source: null, target: null});

var RoomController = require('RoomController');

var Claimer = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Wait at Stage
                waitAtStage(mycreep);
                break;
            case 1:
                //Claim room
                claimRoom(mycreep);
                break;
            case 2:
                //Reserve room
                reserveRoom(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function waitAtStage(mycreep){
    if(mycreep.carry.energy !== mycreep.carryCapacity){
        if(mycreep.memory.source === null){
            RoomController.getSource(mycreep, RoomController.SOURCE_CONTAINER);
        }
        
        var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
        if(source === ERR_NOT_IN_RANGE){
            mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
            return;
        }
        else if(source === OK){
            mycreep.memory.source = null;
            return;
        }
    }
    
    if(mycreep.pos.getRangeTo(Game.flags.Stage) <= 1){
        return;
    }
    mycreep.moveTo(Game.flags.Stage);
}

function claimRoom(mycreep){
    if(mycreep.room !== Game.flags.Claim.room){
        mycreep.moveTo(Game.flags.Claim);
        return;
    }
    
    if(mycreep.room.controller.level === 0){
        if(mycreep.claimController(mycreep.room.controller) == ERR_NOT_IN_RANGE) {
            mycreep.moveTo(mycreep.room.controller);
        }
    }
    else if(mycreep.room.controller.level === 1){
        mycreep.upgradeController(mycreep.room.controller);
    }
    else if(mycreep.room.controller.level === 2){
        mycreep.memory.role = RoomController.ROLE_BUILDER;
        mycreep.memory.state = 0;
    }
}

function reserveRoom(mycreep){
    if(mycreep.room !== Game.rooms[mycreep.memory.room]){
        mycreep.moveTo(new RoomPosition(25, 25, mycreep.memory.room));
        return;
    }
    
    if(mycreep.reserveController(mycreep.room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(mycreep.room.controller);    
    }
}

function checkState(mycreep){
    if(mycreep.getActiveBodyparts(CARRY) === 0){
        mycreep.memory.state = 2;
    }
    else if(Game.flags.Claim){
        mycreep.memory.state = 1;
    }
    else{
        mycreep.memory.state = 0;
    }
}

var RoomController = require('RoomController');

var Fighter = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        checkState(mycreep);

        switch(mycreep.memory.state){
            case 0:
                //Wait for orders
                break;
            case 1:
                //Move to Staging
                mycreep.moveTo(Game.flags.Stage);
                break;
            case 2:
                //Move to Rally
                mycreep.moveTo(Game.flags.Rally);
                break;
            case 3:
                //MURDER!!!
                attackEnemy(mycreep);
                break;
        }
    }
}

function attackEnemy(mycreep){
    if(mycreep.room !== Game.flags.Rally.room){
        mycreep.moveTo(Game.flags.Rally);
        return;
    }
    
    var targets = [];
    switch(Game.flags.Rally.secondaryColor){
        case COLOR_GREY:
            targets = Game.flags.Rally.pos.findInRange(FIND_STRUCTURES, 0);
            if(targets.length){
                break;
            }
        case COLOR_RED:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            if(targets.length){
                break;
            }
        case COLOR_ORANGE:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_CREEPS, 
                {filter: 
                    function(object){
                        if(Memory.friends.includes(object.owner.username)){
                            return false;
                        }
                        return (object.getActiveBodyparts(ATTACK)>0 || object.getActiveBodyparts(RANGED_ATTACK)>0);
                    }
                }
            );
            if(targets.length){
                break;
            }
        case COLOR_YELLOW:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_CREEPS,
                {filter: 
                    function(object){
                        if(Memory.friends.includes(object.owner.username)){
                            return false;
                        }
                        return true;
                    }
                }
            );
            if(targets.length){
                break;
            }
        case COLOR_GREEN:
            targets = Game.flags.Rally.room.find(FIND_HOSTILE_SPAWNS);
            break;
    }
    
    var target = mycreep.pos.findClosestByRange(targets);
    
    var success = mycreep.rangedAttack(target);
    if(success === ERR_NO_BODYPART){
        if((mycreep.attack(target) === ERR_NOT_IN_RANGE) || (mycreep.dismantle(target) === ERR_NOT_IN_RANGE)){
            mycreep.moveTo(target);
        }
        return;
    }
    else if(success === ERR_NOT_IN_RANGE){
        mycreep.moveTo(target);
        return;
    }
    mycreep.attack(target);
}

function checkState(mycreep){
    if(Memory.war.warweredeclared){
        switch(Game.flags.Rally.color){
            case COLOR_GREEN:
                mycreep.memory.state = 0;
                break;
            case COLOR_YELLOW:
                mycreep.memory.state = 2;
                break;
            case COLOR_RED:
                mycreep.memory.state = 3;
                break;
        }
    }
    else if(mycreep.pos.getRangeTo(Game.flags.Stage) <= 1){
        mycreep.memory.state = 0;
    }
    else {
        mycreep.memory.state = 1;
    }
}

var RoomController = require('RoomController');

var Harvester = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Harvest Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Drop Energy in Container
                deliverEnergy(mycreep);
                break;
            case 2:
                //Load spawn with Energy
                giveSpawnEnergy(mycreep);
                break;
            case 3:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        RoomController.getSource(mycreep, RoomController.SOURCE_ENERGY);
    }
    
    if(mycreep.harvest(Game.getObjectById(mycreep.memory.source)) === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
}

function deliverEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTAINER);
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function giveSpawnEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_SPAWN);
    }
    
    var result = mycreep.transfer(Game.spawns[mycreep.memory.target], RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target]);
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
        mycreep.memory.state = 0;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        if(mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length === 0){
            if(mycreep.room.energyAvailable < mycreep.room.energyCapacityAvailable){
                mycreep.memory.state = 2;
            }
            else{
                mycreep.memory.state = 3;
            }
        }
        else{
            mycreep.memory.state = 1;
        }
    }
}

var RoomController = require('RoomController');

var Maintainer = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Fill up Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Bring Energy to Spawn
                giveSpawnEnergy(mycreep);
                break;
            case 2:
                //Bring Energy to Extensions
                giveExtensionEnergy(mycreep);
                break;
            case 3:
                //Reload Towers
                reloadTower(mycreep);
                break;
            case 4:
                //Load Balance Containers
                distributeEnergy(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var containers = mycreep.room.find(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                        return object.store[RESOURCE_ENERGY] >= mycreep.carryCapacity;
                    }
                }
            }
        );
        if(containers.length){
            var location = containers.indexOf( mycreep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}) );
            if(location !== -1 && containers.length > 1){
                containers.splice(location, 1);
            }
            if(containers.length){
                containers.sort((a,b) => (b.store[RESOURCE_ENERGY]/b.storeCapacity) - (a.store[RESOURCE_ENERGY])/a.storeCapacity);
                mycreep.memory.source = containers[0].id;
            }
        }
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
    if(source === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
    else if(source === OK){
        return;
    }
    else{
        mycreep.memory.source = null;
    }
}

function giveSpawnEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_SPAWN);
    }
    
    if(mycreep.memory.target === null){
        mycreep.memory.state = 2;
        return;
    }
    
    var result = mycreep.transfer(Game.spawns[mycreep.memory.target], RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target]);
    }
    if(Game.spawns[mycreep.memory.target].energy === Game.spawns[mycreep.memory.target].energyCapacity){
        mycreep.memory.target = null;
    }
}

function giveExtensionEnergy(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_EXTENSION);
    }
    
    if(mycreep.memory.target === null){
        return;
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY)
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    if(Game.getObjectById(mycreep.memory.target).energy === Game.getObjectById(mycreep.memory.target).energyCapacity){
        mycreep.memory.target = null;
    }
}

function reloadTower(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_TOWER);
    }
	
	if(mycreep.memory.target === null){
		return;
	}
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY)
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function distributeEnergy(mycreep){
    if(mycreep.memory.target === null){
        var containers = mycreep.room.find(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                        return (object.storeCapacity - object.store[RESOURCE_ENERGY]) >= mycreep.carry.energy;
                    }
                }
            }
        );
        if(containers.length){
            containers.sort((a,b) => (a.store[RESOURCE_ENERGY]/a.storeCapacity) - (b.store[RESOURCE_ENERGY]/b.storeCapacity));
            mycreep.memory.target = containers[0].id;
        }
    }
    
    var result = mycreep.transfer(Game.getObjectById(mycreep.memory.target), RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(result === ERR_FULL){
        mycreep.memory.target = null;
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.energyAvailable < mycreep.room.energyCapacityAvailable){
            var myspawns = mycreep.room.find(FIND_MY_SPAWNS);
            for(var name in myspawns){
                if(Game.spawns[myspawns[name].name].energy < Game.spawns[myspawns[name].name].energyCapacity){
                    mycreep.memory.state = 1;
                    return;
                }
            }
            mycreep.memory.state = 2;
            return;
        }
        var towers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        if(towers.length){
            for(var index in towers){
                if(towers[index].energy < towers[index].energyCapacity){
                    mycreep.memory.state = 3;
                    return;
                }
            }
        }
        mycreep.memory.state = 4;
    }
}

//Game.spawns.E4S33A.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], "Pi0000", {room: "E4S33", role: "Pi", state: 0, source: null, target: null});

var RoomController = require('RoomController');

var Pirate = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Wait at Stage
                waitAtStage(mycreep);
                break;
            case 1:
                //Deposit da loot
                depositLoot(mycreep);
                break;
            case 2:
                //Git da loot
                getLoot(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function waitAtStage(mycreep){
    if(mycreep.pos.getRangeTo(Game.flags.Stage) === 0){
        return;
    }
    mycreep.moveTo(Game.flags.Stage);
}

function depositLoot(mycreep){
    if(mycreep.room !== Game.rooms[mycreep.memory.room]){
        mycreep.moveTo(new RoomPosition(25, 25, mycreep.memory.room));
        return;
    }
    
    var result = mycreep.transfer(Game.rooms[mycreep.memory.room].storage, RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.rooms[mycreep.memory.room].storage);
    }
}

function getLoot(mycreep){
    if(mycreep.room !== Game.flags.Plunder.room){
        mycreep.moveTo(Game.flags.Plunder);
        return;
    }
    
    if(mycreep.memory.target === null){
        var containers = mycreep.room.find(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                        return object.store[RESOURCE_ENERGY] >= 100 ;
                    }
                }
            }
        );
        if(containers.length){
            containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
            mycreep.memory.target = containers[0].id;
        }
        else{
            var resources = mycreep.room.find(FIND_DROPPED_ENERGY, 
                {filter: 
                    function(object){
                        return object.amount >= 100 ;
                    }
                }
            );
            if(resources.length){
                resources.sort((a,b) => b.amount - a.amount);
                mycreep.memory.target = resources[0].id;
            }
        }
    }
    
    var target = Game.getObjectById(mycreep.memory.target);
    if(target instanceof Structure){
        var success = mycreep.withdraw(target, RESOURCE_ENERGY);
        if(success === ERR_NOT_IN_RANGE){
            mycreep.moveTo(target);
        }
        else if(success === OK){
            mycreep.memory.target = null;
            return;
        }
    }
    else{
        var success = mycreep.pickup(target);
        if(success === ERR_NOT_IN_RANGE){
            mycreep.moveTo(target);
        }
        else if(success === OK){
            mycreep.memory.target = null;
            return;
        }
    }
}

function checkState(mycreep){
    if(Game.flags.Plunder){
        if(_.sum(mycreep.carry) === 0){
            mycreep.memory.state = 2;
        }
        else{
            mycreep.memory.state = 1;
        }
    }
    else{
        mycreep.memory.state = 0;
    }
}

var RoomController = require('RoomController');

var Repairer = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Fill up Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Repair Structures
                repairStructures(mycreep);
                break;
            case 2:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        RoomController.getSource(mycreep, RoomController.SOURCE_CONTAINER);
    }
    if(mycreep.memory.source === null){
        return;
    }
    
    var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
    if(source === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
    else if(source === OK){
        return;
    }
    else{
        mycreep.memory.source = null;
    }
}

function repairStructures(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_REPAIR);
    }
    
    if(Game.getObjectById(mycreep.memory.target).hits === Game.getObjectById(mycreep.memory.target).hitsMax){
        mycreep.memory.target = null;
        return;
    }
    
    var target = mycreep.repair(Game.getObjectById(mycreep.memory.target));
    if(target === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.target));
    }
    else if(target === OK){
        return;
    }
    else {
        mycreep.memory.target = null;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy === mycreep.carryCapacity && mycreep.memory.target === null){
        mycreep.memory.source = null;
        if(mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax}).length){
            mycreep.memory.state = 1;
        }
        else{
            mycreep.memory.state = 2;
        }
    }
}

var RoomController = {
    newCreep: function(room, body, role, targetroom = null){
        if(targetroom === null){
            targetroom = room;
        }
        var myspawns = Game.rooms[room].find(FIND_MY_SPAWNS);
        var index = 0;
        var number = Game.time % 10000;
        
        if(myspawns.length === 0){
            return;
        }
        for(index in myspawns){
            if(myspawns[index] === null){
                break;
            }
        }
        if(myspawns[index] === null){
            return;
        }
        
        var success = myspawns[index].canCreateCreep(body, (role + number));
        if(success === -3){
            while(true){
                success = myspawns[index].canCreateCreep(body, (role + (++number)));
                if(success !== -3){
                    break;
                }
            }
        }
        if(success !== 0){
            return success;
        }
        var newcreep = myspawns[index].createCreep(body, (role + number), 
            {room: targetroom, role: role, state: 0, source: null, target: null});
        
        return 0;
    },
    
    checkPulse: function(mycreep){
        if(mycreep.ticksToLive > 1){
            return;
        }
        
        if(mycreep.memory.role === RoomController.ROLE_CLAIMER){
            Memory.rooms[mycreep.memory.room].creep = false;
        }
        mycreep.suicide;
        delete mycreep.memory;
    },
    
    moreCreeps: function(room, numbers){
        var body, role;
        var needed = false;
        
        switch(Game.rooms[room].controller.level){
            default:
            case 2:
                if(numbers[RoomController.ROLE_MAINTAINER] < 2 && Game.rooms[room].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length){
                    if(Game.rooms[room].energyCapacityAvailable >= 750 && Game.rooms[room].storage){
                        body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_MAINTAINER;
                        needed = true;
                    }
                    else if(Game.rooms[room].energyCapacityAvailable >= 450){
                        body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_MAINTAINER;
                        needed = true;
                    }
                    else{
                        body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                        role = RoomController.ROLE_MAINTAINER;
                        needed = true;
                    }
                }
                else if(numbers[RoomController.ROLE_HARVESTER] < 8){
                    if(Game.rooms[room].energyCapacityAvailable >= 550){
                        body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_HARVESTER;
                        needed = true;
                    }
                    else if(Game.rooms[room].energyCapacityAvailable >= 400){
                        body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                        role = RoomController.ROLE_HARVESTER;
                        needed = true;
                    }
                    else{
                        body = [WORK, WORK, CARRY, MOVE];
                        role = RoomController.ROLE_HARVESTER;
                        needed = true;
                    }
                }
                else if(numbers[RoomController.ROLE_UPGRADER] < 2){
                    if(Game.rooms[room].energyCapacityAvailable >= 850){
                        body = [MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY];
                        role = RoomController.ROLE_UPGRADER;
                        needed = true;
                    }
                    else if(Game.rooms[room].energyCapacityAvailable >= 550){
                        body = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
                        role = RoomController.ROLE_UPGRADER;
                        needed = true;
                    }
                    else{
                        body = [WORK, WORK, CARRY, MOVE];
                        role = RoomController.ROLE_UPGRADER;
                        needed = true;
                    }
                }
                else if(numbers[RoomController.ROLE_BUILDER] < 4){
                    /*if(Game.rooms[room].energyCapacityAvailable >= 850){
                        body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY];
                        role = RoomController.ROLE_BUILDER;
                        needed = true;
                    }
                    else*/ if(Game.rooms[room].energyCapacityAvailable >= 400){
                        body = [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_BUILDER;
                        needed = true;
                    }
                    else{
                        body = [WORK, WORK, CARRY, MOVE];
                        role = RoomController.ROLE_BUILDER;
                        needed = true;
                    }
                }
                else if(numbers[RoomController.ROLE_REPAIRER] < 2){
                    if(Game.rooms[room].energyCapacityAvailable >= 400){
                        body = [WORK, WORK, CARRY, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_REPAIRER;
                        needed = true;
                    }
                    else{
                        body = [WORK, WORK, CARRY, MOVE];
                        role = RoomController.ROLE_REPAIRER;
                        needed = true;
                    }
                }
            case 1:
                if(numbers[RoomController.ROLE_HARVESTER] < 2){
                    body = [WORK, WORK, CARRY, MOVE];
                    role = RoomController.ROLE_HARVESTER;
                    needed = true;
                }
                else if(numbers[RoomController.ROLE_MAINTAINER] < 1 && Game.rooms[room].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length){
                    body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                    role = RoomController.ROLE_MAINTAINER;
                    needed = true;
                }
                else if(numbers[RoomController.ROLE_BUILDER] < 2){
                    body = [WORK, WORK, CARRY, MOVE];
                    role = RoomController.ROLE_BUILDER;
                    needed = true;
                }
                break;
        }
        if(Memory.rooms[room].war.moretroops && !needed){
            switch(Memory.rooms[room].war.body){
                case 0:
                    body = [TOUGH, MOVE];
                    break;
                case 1:
                    body = [ATTACK, MOVE];
                    break;
                case 2:
                    body = [MOVE, ATTACK, MOVE, ATTACK];
                    break;
                case 3:
                    body = [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, MOVE, ATTACK];
                    break;
                case 4:
                    body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE]
                    break;
                case 5:
                    body = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK]
                    break;
            }
            
            role = RoomController.ROLE_FIGHTER;
            needed = true;
        }
        
        if(needed){
            RoomController.newCreep(room, body, role);
        }
    },
    
    getSource: function(mycreep, type){
        switch(type){
            case RoomController.SOURCE_ENERGY:
                //This actually seems to work fairly well
                var sources = mycreep.room.find(FIND_SOURCES);
                if(sources.length === 2){
                    mycreep.memory.source = sources[Memory.rooms[mycreep.room.name].source].id;
                    Memory.rooms[mycreep.room.name].source = Math.abs(--Memory.rooms[mycreep.room.name].source);
                }
                else{
                    mycreep.memory.source = sources[0].id;
                }
                break;
            case RoomController.SOURCE_CONTAINER:
                var containers = mycreep.room.find(FIND_STRUCTURES, 
                    {filter: 
                        function(object){
                            if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                                return object.store[RESOURCE_ENERGY] >= mycreep.carryCapacity;
                            }
                        }
                    }
                );
                if(containers.length){
                    var target = mycreep.pos.findClosestByRange(containers);
                    mycreep.memory.source = target.id;
                }
                break;
        }
    },
    
    getTarget: function(mycreep, type){
        switch(type){
            case RoomController.TARGET_CONTAINER:
                var containers = mycreep.room.find(FIND_STRUCTURES, 
                    {filter: 
                        function(object){
                            if(object.structureType === STRUCTURE_CONTAINER || object.structureType === STRUCTURE_STORAGE){
                                return (object.storeCapacity - object.store[RESOURCE_ENERGY]) >= mycreep.carry.energy;
                            }
                        }
                    }
                );
                if(containers.length){
                    var target = mycreep.pos.findClosestByRange(containers);
                    mycreep.memory.target = target.id;
                }
                break;
            case RoomController.TARGET_BUILD:
                var targets = mycreep.room.find(FIND_CONSTRUCTION_SITES);
                if(!targets.length){
                    mycreep.memory.state = 0;
                    return;
                }
                mycreep.memory.target = targets[0].id;
                break;
            case RoomController.TARGET_REPAIR:
                //Check for containers first
                var targets = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                targets.sort((a,b) => a.hits - b.hits);
                if(targets[0].hits < targets[0].hitsMax){
                    mycreep.memory.target = targets[0].id;
                    return;
                }
                //Then check for Roads, because they are quick
                targets = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_ROAD}});
                if(targets.length){
                    targets.sort((a,b) => a.hits - b.hits);
                    if(targets[0].hits < targets[0].hitsMax){
                        mycreep.memory.target = targets[0].id;
                        return;
                    }
                }
                var hitloop = 50000;
                while(hitloop <= 300000000){
                    //Then those blasted Ramparts
                    targets = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
                    if(targets.length){
                        targets.sort((a,b) => a.hits - b.hits);
                        var hitrep = hitloop;
                        if(hitloop >= targets[0].hitsMax){
                            hitrep = targets[0].hitsMax;
                        }
                        if(targets[0].hits < hitrep){
                            mycreep.memory.target = targets[0].id;
                            return;
                        }
                    }
                    //Then everything else
                    targets = mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
                    if(!targets.length){
                        mycreep.memory.state = 0;
                        return;
                    }
                    targets.sort((a,b) => a.hits - b.hits);
                    if(targets[0].hits < hitloop){
                        mycreep.memory.target = targets[0].id;
                        return;
                    }
                    hitloop *= 2;
                    if(hitloop > 300000000){
                        hitloop = 300000000;
                    }
                }
                break;
            case RoomController.TARGET_SPAWN:
                var spawns = mycreep.room.find(FIND_MY_SPAWNS);
                for(var index in spawns){
                    if(spawns[index].energy < spawns[index].energyCapacity){
                        mycreep.memory.target = spawns[index].name;
                        return;
                    }
                }
                break;
            case RoomController.TARGET_CONTROLLER:
                var spawn = mycreep.room.find(FIND_MY_SPAWNS);
                mycreep.memory.target = spawn[0].name;
                break;
            case RoomController.TARGET_EXTENSION:
                var ext = mycreep.room.find(FIND_STRUCTURES, 
                    {filter: 
                        function(object){
                            if(object.structureType === STRUCTURE_EXTENSION){
                                return object.energy < object.energyCapacity;
                            }
                        }
                    }
                );
                if(ext.length){
                    var choice = mycreep.pos.findClosestByRange(ext);
                    mycreep.memory.target = choice.id;
                    return;
                }
                mycreep.memory.state = 0;
                break;
            case RoomController.TARGET_TOWER:
                var towers = mycreep.room.find(FIND_STRUCTURES, 
                    {filter: 
                        function(object){
                            if(object.structureType === STRUCTURE_TOWER){
                                return object.energy < object.energyCapacity;
                            }
                        }
                    }
                );
                if(towers.length){
                    mycreep.memory.target = towers[0].id;
                    return;
                }
                mycreep.memory.state = 0;
                break;
        }
    },
    
    ////////////////////
    //GLOBAL CONSTANTS//
    ////////////////////
    ROLE_HARVESTER: "Ha",
    ROLE_BUILDER: "Bl",
    ROLE_MAINTAINER: "Mn",
    ROLE_REPAIRER: "Rp",
    ROLE_UPGRADER: "Up",
    ROLE_FIGHTER: "At",
    ROLE_PIRATE: "Pi",
    ROLE_CLAIMER: "Cl",
    
    SOURCE_ENERGY: 0,
    SOURCE_CONTAINER: 1,
    
    TARGET_CONTAINER: 0,
    TARGET_BUILD: 1,
    TARGET_REPAIR: 2,
    TARGET_SPAWN: 3,
    TARGET_CONTROLLER: 4,
    TARGET_EXTENSION: 5,
    TARGET_TOWER: 6
}

var Tower = {
    run: function(mytower){
        //Does tower have energy?
        if(mytower.energy === 0){
            return;
        }
        
        if(!mytower.my){
            return;
        }
        
        //Check for Hostile creeps
        var target = null;
        if(mytower.room.find(FIND_HOSTILE_CREEPS).length){
            target = mytower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, 
                {filter: 
                    function(object){
                        if(Memory.friends.includes(object.owner.username)){
                            return false;
                        }
                        return (object.getActiveBodyparts(ATTACK)>0 || object.getActiveBodyparts(RANGED_ATTACK)>0);
                    }
                }
            );
            if(target === null){
                target = mytower.pos.findClosestByRange(FIND_HOSTILE_CREEPS,
                    {filter: 
                        function(object){
                            if(Memory.friends.includes(object.owner.username)){
                                return false;
                            }
                            return true;
                        }
                    }
                );
            }
            if(target.owner.username !== "Invader"){
                Game.notify(target.owner.username +"'s creep has entered room "+mytower.room.name, 2);
            }
            mytower.attack(target);
            return;
        }
        //Check for injured friendly creeps
        target = mytower.room.find(FIND_MY_CREEPS, {filter: object => object.hits < object.hitsMax});
        if(target.length){
            target.sort((a,b) => a.hits - b.hits);
            mytower.heal(target[0]);
        }
    }
}

var RoomController = require('RoomController');

var Upgrader = {
    run: function(mycreep){
        if(mycreep.spawning){
            return;
        }
        
        switch(mycreep.memory.state){
            case 0:
                //Fill up Energy
                getEnergy(mycreep);
                break;
            case 1:
                //Upgrade the Controller
                upgradeLocalController(mycreep);
                break;
        }
        
        checkState(mycreep);
    }
}

function getEnergy(mycreep){
    if(mycreep.memory.source === null){
        var source = mycreep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, 
            {filter: 
                function(object){
                    return object.structureType === STRUCTURE_CONTAINER/* || object.structureType === STRUCTURE_STORAGE*/
                }
            }
        );
        mycreep.memory.source = source.id;
    }
    
    if(mycreep.memory.source === null){
        return;
    }
    
    var source = mycreep.withdraw(Game.getObjectById(mycreep.memory.source), RESOURCE_ENERGY);
    if(source === ERR_NOT_IN_RANGE){
        mycreep.moveTo(Game.getObjectById(mycreep.memory.source));
    }
    else if(source === OK){
        return;
    }
    else{
        mycreep.memory.source = null;
    }
}

function upgradeLocalController(mycreep){
    if(mycreep.memory.target === null){
        RoomController.getTarget(mycreep, RoomController.TARGET_CONTROLLER);
    }
    
    if(mycreep.upgradeController(Game.spawns[mycreep.memory.target].room.controller) == ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target].room.controller);
    }
}

function checkState(mycreep){
    if(mycreep.carry.energy === 0){
        mycreep.memory.state = 0;
        mycreep.memory.target = null;
    }
    else if(mycreep.carry.energy > 0 && mycreep.memory.target === null){
        mycreep.memory.state = 1;
    }
}

var RoomController = require('RoomController');

var Harvester = require('Harvester');
var Builder = require('Builder');
var Maintainer = require('Maintainer');
var Repairer = require('Repairer');
var Upgrader = require('Upgrader');
var Fighter = require('Fighter');
var Pirate = require('Pirate');
var Claimer = require('Claimer');

var Tower = require('Tower');

module.exports.loop = function() {
    //Game Initialization
    if(Memory.init === undefined){
        initialize();
    }
    
    //Initialize rooms
    var roomstats = {};
    for(var name in Game.rooms){
        //Initialize creep counter variables
        roomstats[name] = {};
        roomstats[name].Ha = 0;
        roomstats[name].Bl = 0;
        roomstats[name].Mn = 0;
        roomstats[name].Rp = 0;
        roomstats[name].Up = 0;
        
        //Towers
        var towers = Game.rooms[name].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        if(towers.length){
            for(var index in towers){
                Tower.run(towers[index]);
            }
        }
    }
    
    //Creep Loop
    for(var name in Game.creeps){
        switch(Game.creeps[name].memory.role){
            case RoomController.ROLE_HARVESTER:
                Harvester.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Ha;
                break;
            case RoomController.ROLE_BUILDER:
                Builder.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Bl;
                break;
            case RoomController.ROLE_MAINTAINER:
                Maintainer.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Mn;
                break;
            case RoomController.ROLE_REPAIRER:
                Repairer.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Rp;
                break;
            case RoomController.ROLE_UPGRADER:
                Upgrader.run(Game.creeps[name]);
                ++roomstats[Game.creeps[name].room.name].Up;
                break;
            case RoomController.ROLE_FIGHTER:
                Fighter.run(Game.creeps[name]);
                break;
            case RoomController.ROLE_PIRATE:
                Pirate.run(Game.creeps[name]);
                break;
            case RoomController.ROLE_CLAIMER:
                Claimer.run(Game.creeps[name]);
                break;
        }
        
        RoomController.checkPulse(Game.creeps[name]);
    }
    
    for(var room in roomstats){
        if(Game.rooms[room].controller.my){
            RoomController.moreCreeps(room, roomstats[room]);
            if(Game.time%100 === 0){
                console.log("Room "+room+" is "+(Math.round((Game.rooms[room].controller.progress/Game.rooms[room].controller.progressTotal)*10000)/100)+"% to level"+(Game.rooms[room].controller.level + 1));
            }
        }
    }
    
    for(var room in Memory.rooms){
        if(Memory.rooms[room].reserve === true && Memory.rooms[room].creep === false){
            RoomController.newcreep(Memory.rooms[room].spawn, [CLAIM, CLAIM, MOVE, MOVE], RoomController.ROLE_CLAIMER, room);
        }
    }
    
    //Average CPU usage
    var currentcpu = Game.cpu.getUsed();
    Memory.cpuavg = ((Memory.cpuavg * 9)+ currentcpu)/10
    
    //Extra timing tasks
    if((Game.time%100) === 0){
        if(Game.time%1000 && Game.cpu.getUsed() < (Game.cpu.limit - 5)){
            garbageCollect();
        }
        Memory.lastadd = Game.cpu.getUsed() - currentcpu;
    }
}

function garbageCollect(){
    for(var creepmem in Memory.creeps){
        if(Game.creeps[creepmem] === undefined){
            delete Memory.creeps[creepmem];
        }
    }
}

function initialize() {
    if(_.isEmpty(Game.spawns)){
        return;
    }
    
    for(var index in Game.spawns){
        var roomname = Game.spawns[index].room.name;
        Memory.rooms[roomname] = {source:0};
    }
    
    Memory.friends = [Niarbeht, Figgis, Kyndigen];
    
    Memory.cpuavg = 0;
    Memory.lastadd = 0;
    Memory.init = true;
}