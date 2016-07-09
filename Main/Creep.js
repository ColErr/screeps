class Creep {
    
    constructor(name){
        this.myname = name;
        this.mycreep = Game.creeps[name];
    }
    
    function newCreep(spawn, body, role){
        var number = Game.tick%10000;
        var success = Game.spawns[spawn].canCreateCreep(body, (role + number));
        if(success === -3){
            while(true){
                success = Game.spawns[spawn].canCreateCreep(body, (role + (++number)));
            }
        }
        if(success !=== 0){
            return success;
        }
        
        var newcreep = Game.spawns[spawn].createCreep(body, (role + number));
        Game.creeps[newcreep].memory.state = -1;
        Game.creeps[newcreep].memory.role = role;
        Game.creeps[newcreep].memory.source = null;
        Game.creeps[newcreep].memory.target = null;
        
        return 0;
    }
    
    function getEnergy(mycreep){
        var containers = mycreep.room.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}}))
        
        if(_.isEmpty(containers) || mycreep.memory.role === ROLE_HARVESTER){
            //Get energy from a source
        }
        else{
            //Get energy from a container
        }
    }
    
    function checkPulse(){
        if(this.mycreep.ticksToLive > 1){
            return;
        }
        
        this.mycreep.suicide;
        delete this.mycreep.memory;
    }
}
///////////////////////////////////////
//         CREEP CONSTANTS           //
///////////////////////////////////////
var ROLE_HARVESTER = "Ha";
var ROLE_BUILDER = "Bl";
var ROLE_MAINTAINER = "Mn";
var ROLE_REPAIRER = "Rp";


module.exports.creep;