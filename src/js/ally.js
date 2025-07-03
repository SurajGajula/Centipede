class Ally {
    constructor(name, attack, health, skillstatus, skillcount, skillhits) {
        this.name = name;
        this.attack = attack;
        this.health = health;
        this.skillstatus = skillstatus;
        this.skillcount = skillcount;
        this.skillhits = skillhits;
        this.statuses = {};
    }

    addStatus(status, count) {
        this.statuses[status] = count;
    }

    clearStatuses() {
        this.statuses = {};
    }

    removeStatus(status){
        delete this.statuses[status];
    }
}

export default Ally;
