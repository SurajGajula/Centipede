class Account {
    constructor(marbles) {
        this.marbles = marbles;
    }
}

export function getUsername() {
    return localStorage.getItem('username');
}

export function getPassword() {
    return localStorage.getItem('hashedPassword');
}

export default Account;