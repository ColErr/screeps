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
                    if(Game.rooms[room].energyCapacityAvailable >= 850){
                        body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY];
                        role = RoomController.ROLE_BUILDER;
                        needed = true;
                    }
                    else if(Game.rooms[room].energyCapacityAvailable >= 400){
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
                //FIX THIS, HANDLE MULTIPLE SPAWNS
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

module.exports = RoomController;