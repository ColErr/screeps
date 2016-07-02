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
                
                break;
            case 3:
                //Reload Towers
                
                break;
            case 4:
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
    
    var source = Game.getObjectById(mycreep.memory.source).transfer(mycreep, RESOURCE_ENERGY);
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
    
    var result = mycreep.transfer(Game.spawns[mycreep.memory.target], RESOURCE_ENERGY);
    if(result === ERR_NOT_IN_RANGE) {
        mycreep.moveTo(Game.spawns[mycreep.memory.target]);
    }
    else if(result === ERR_FULL){
        mycreep.memory.state = 0;
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
        if(mycreep.room.energyAvailable < mycreep.room.energyCapacityAvailable){
            var myspawns = mycreep.room.find(FIND_MY_SPAWNS);
            for(var name in myspawns){
                if(Game.spawns[name].energy < Game.spawns[name].energyCapacity){
                    mycreep.memory.state = 1;
                    return;
                }
            }
            mycreep.memory.state = 2;
        }
        else{
            mycreep.memory.state = 4;
        }
    }
}

module.exports = Maintainer;