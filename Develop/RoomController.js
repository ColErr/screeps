var RoomController = {
    newCreep: function(spawn, body, role){
        var number = Game.time % 10000;
        var success = Game.spawns[spawn].canCreateCreep(body, (role + number));
        if(success === -3){
            while(true){
                success = Game.spawns[spawn].canCreateCreep(body, (role + (++number)));
                if(success !== -3){
                    break;
                }
            }
        }
        if(success !== 0){
            return success;
        }
        
        var newcreep = Game.spawns[spawn].createCreep(body, (role + number), 
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
        var spawns = Game.rooms[room].find(FIND_MY_SPAWNS);
        var body, role;
        var needed = false;
        switch(Game.rooms[room].controller.level){
            case 3:
                
            case 2:
                
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
            RoomController.newCreep(spawns[0].name, body, role);
        }
    },
    
    getSource: function(mycreep, type){
        switch(type){
            case RoomController.SOURCE_ENERGY:
                //FIX THIS, NEEDS TO ACTUALLY CHOOSE SOURCE
                var source = mycreep.room.find(FIND_SOURCES);
                mycreep.memory.source = source[0].id;
                break;
            case RoomController.SOURCE_CONTAINER:
                //FIX THIS, CHOOSE CONTAINER BETTER
                var containers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                mycreep.memory.source = containers[0].id;
                break;
        }
    },
    
    getTarget: function(mycreep, type){
        switch(type){
            case RoomController.TARGET_CONTAINER:
                //FIX THIS, CHOOSE CONTAINERS BETTTER
                var containers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                mycreep.memory.target = containers[0].id;
                break;
            case RoomController.TARGET_BUILD:
                var targets = mycreep.room.find(FIND_CONSTRUCTION_SITES);
                if(!targets.length){
                    mycreep.memory.state = 0;
                }
                
                mycreep.memory.target = targets[0].id;
                break;
            case RoomController.TARGET_REPAIR:
                targets = mycreep.room.find(FIND_STRUCTURES, {filter: object => object.hits < object.hitsMax});
                targets.sort((a,b) => a.hits - b.hits);
                
                mycreep.memory.target = targets[0].id;
                break;
            case RoomController.TARGET_SPAWN:
                //FIX THIS, HANDLE MULTIPLE SPAWNS AND EXTENSIONS
                var spawn = mycreep.room.find(FIND_MY_SPAWNS);
                mycreep.memory.target = spawn[0].name;
                break;
            case RoomController.TARGET_CONTROLLER:
                var spawn = mycreep.room.find(FIND_MY_SPAWNS);
                mycreep.memory.target = spawn[0].name;
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
    
    COUNT_HARVESTER: 0,
    COUNT_BUILDER: 1,
    COUNT_MAINTAINER: 2,
    COUNT_REPAIRER: 3
}

module.exports = RoomController;