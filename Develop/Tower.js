var Tower = {
    run: function(mytower){
        //Does tower have energy?
        if(mytower.energy === 0){
            return;
        }
        
        //Check for Hostile creeps
        var target = null;
        if(mytower.room.find(FIND_HOSTILE_CREEPS).length){
            target = mytower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, 
                {filter: function(object){
                return (object.getActiveBodyparts(ATTACK)>0 || object.getActiveBodyparts(RANGED_ATTACK)>0);}});
            if(target === null){
                target = mytower.pos.findClosestByRange(FIND_HOSTILE_CREEP);
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

module.exports = Tower;