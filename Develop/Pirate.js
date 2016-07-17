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

module.exports = Pirate;