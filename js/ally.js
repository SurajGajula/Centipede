class Ally {
    constructor(name, attack, health, skillcount, skillhits, skillstatus) {
        this.name = name;
        this.attack = attack;
        this.health = health;
        this.skillcount = skillcount;
        this.skillhits = skillhits;
        this.skillstatus = skillstatus;
        this.maxHealth = health;
        this.statuses = {};
    }

    addStatus(status, count) {
        count = Number(count);
        if (this.statuses[status]) {
            this.statuses[status] = Number(this.statuses[status]) + count;
        } else {
            this.statuses[status] = count;
        }
    }

    clearStatuses() {
        this.statuses = {};
    }

    removeStatus(status){
        delete this.statuses[status];
    }
}

export default Ally;
