var RoomController = {
    newCreep: function(room, body, role){
        var myspawns = Game.rooms[room].find(FIND_MY_SPAWNS);
        var index = 0;
        var number = Game.time % 10000;
        
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
            {role: role, state: 0, source: null, target: null});
        
        return 0;
    },
    
    checkPulse: function(mycreep){
        if(mycreep.ticksToLive > 1){
            return;
        }
        
        mycreep.suicide;
        delete mycreep.memory;
    },
    
    moreCreeps: function(room, numbers){
        var body, role;
        var needed = false;
        switch(Game.rooms[room].controller.level){
            case 3:
                
            case 2:
                if(numbers[RoomController.ROLE_MAINTAINER] < 4 && Game.rooms[room].find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}).length){
                    if(Game.rooms[room].energyCapacityAvailable >= 550){
                        body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                        role = RoomController.ROLE_MAINTAINER;
                        needed = true;
                    }
                    else{
                        body = [CARRY,CARRY,CARRY,CARRY,MOVE,MOVE];
                        role = RoomController.ROLE_MAINTAINER;
                        needed = true;
                    }
                }
                else if(numbers[RoomController.ROLE_HARVESTER] < 6){
                    if(Game.rooms[room].energyCapacityAvailable >= 550){
                        body = body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
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
                else if(numbers[RoomController.ROLE_BUILDER] < 4){
                    if(Game.rooms[room].energyCapacityAvailable >= 400){
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
            default:
            case 1:
                if(numbers[RoomController.ROLE_HARVESTER] < 2){
                    body = [WORK, WORK, CARRY, MOVE];
                    role = RoomController.ROLE_HARVESTER;
                    needed = true;
                }
                else if(numbers[RoomController.ROLE_BUILDER] < 2){
                    body = [WORK, WORK, CARRY, MOVE];
                    role = RoomController.ROLE_BUILDER;
                    needed = true
                }
                break;
        }
        if(needed){
            RoomController.newCreep(room, body, role);
        }
    },
    
    getSource: function(mycreep, type){
        switch(type){
            case RoomController.SOURCE_ENERGY:
                //FIX THIS, NEEDS TO ACTUALLY CHOOSE SOURCE
                var source = mycreep.room.find(FIND_SOURCES);
                var choice = Math.round(Math.random());
                mycreep.memory.source = source[choice].id;
                break;
            case RoomController.SOURCE_CONTAINER:
                //FIX THIS, CHOOSE CONTAINER BETTER
                var containers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                if(containers[0].store[RESOURCE_ENERGY] !== 0){
                    mycreep.memory.source = containers[0].id;
                }
                else {
                    mycreep.memory.source = containers[1].id;
                }
                break;
        }
    },
    
    getTarget: function(mycreep, type){
        switch(type){
            case RoomController.TARGET_CONTAINER:
                //FIX THIS, CHOOSE CONTAINERS BETTTER
                var containers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                if(containers[0].store[RESOURCE_ENERGY] !== containers[0].storeCapacity){
                    mycreep.memory.target = containers[0].id;
                }
                else {
                    mycreep.memory.target = containers[1].id;
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
                targets.sort((a,b) => a.hits - b.hits);
                if(targets[0].hits < targets[0].hitsMax){
                    mycreep.memory.target = targets[0].id;
                    return;
                }
                var hitloop = 50000;
                while(hitloop <= 300000000){
                    //Then those blasted Ramparts
                    targets = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
                    targets.sort((a,b) => a.hits - b.hits);
                    var hitrep = hitloop;
                    if(hitloop >= targets[0].hitsMax){
                        hitrep = targets[0].hitsMax;
                    }
                    if(targets[0].hits < hitrep){
                        mycreep.memory.target = targets[0].id;
                        return;
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
                }
                break;
            case RoomController.TARGET_SPAWN:
                //FIX THIS, HANDLE MULTIPLE SPAWNS
                var spawn = mycreep.room.find(FIND_MY_SPAWNS);
                mycreep.memory.target = spawn[0].name;
                break;
            case RoomController.TARGET_CONTROLLER:
                var spawn = mycreep.room.find(FIND_MY_SPAWNS);
                mycreep.memory.target = spawn[0].name;
                break;
            case RoomController.TARGET_EXTENSION:
                var ext = mycreep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}})
                for(var index in ext){
                    if(ext[index].energy < ext[index].energyCapacity){
                        mycreep.memory.target = ext[index].id;
                        return;
                    }
                }
                mycreep.memory.state = 0;
                break;
            case RoomController.TARGET_TOWER:
                var towers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                if(towers.length){
                    for(var index in towers){
                        if(towers[index].energy < towers[index].energyCapacity){
                            mycreep.memory.target = towers[index].id;
                            return;
                        }
                    }
                    mycreep.memory.state = 0;
                }
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

module.exports = RoomController;