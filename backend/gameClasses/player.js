class Player {
    /**
     * 
     * @param {int} socketID 
     * @param {string} username 
     * @param {int} sessionID 
     */
    constructor(socketID, username, sessionID) {
        this.socketID = socketID;
        this.username = username;
        this.deck = [];
        this.readyStatus = false;
        this.selectedCard = null;
        this.noCardsRemaining = false;
        this.sessionID = sessionID
    }

    matchStart() {
        let io = require('../socket').getio();

        io.to(this.socketID).emit("startMatch");
    }

    setDeck(deck) {
        this.deck = deck;
    }

    getSocket() {
        let io = require('../socket').getio();

        return io.to(this.socketID);
    }

    gameStart = () => {
        let io = require('../socket').getio();
        this.sendDeck();

    }


    async chosenCardListener() {
        return new Promise((resolve, reject) => {
            if (this.selectedCard !== null) {
                resolve(this.selectedCard);
                return;
            }

            let io = require('../socket').getio();
            io.sockets.sockets.get(this.socketID).once("disconnect", (reason) => {
                reject("card not exist");
            });

            io.sockets.sockets.get(this.socketID).once("chosen-card", (arg) => {

                let foundCard = this.checkCardExists(arg);
                if (typeof foundCard === 'object') {
                    resolve(foundCard);
                } else {
                    reject(new Error(foundCard));
                }
            });
        });
    }

    checkCardExists(cardID) {
        if(this.selectedCard) { return this.selectedCard;}

        for (let index = 0; index < this.deck.length; index++) {
            const card = this.deck[index];

            if (card.id === parseInt(cardID)) {
                this.selectedCard = card;
                this.deck.splice(index, 1);
                return card;
            }
        }
        return "card not exist";
    }

    resetChosenCard() {
        this.selectedCard = null;
        this.sendDeck();
    }

    sendDeck() {
        let io = require('../socket').getio();
        let array2;
        
        if (this.deck.length > 1) {
            array2 = [0, 1];
        } else if (this.deck.length === 0) {
            this.noCardsRemaining = true;
            return;
        } else if (this.deck.length === 1) {
            array2 = [0];  // Handle the case where there is exactly one card
        }
    
        let deckToGivePlayer = array2.map(i => this.deck[i]);
        io.to(this.socketID).emit("deck-update", deckToGivePlayer);
    }
    

    setReadyStatus(status) {
        this.readyStatus = status;
    }

    getReadyStatus() {
        return this.readyStatus;
    }

    addCardToDeck(cards) {
        cards.forEach(card => {
            this.deck.push(card);
        });
    }

    newSocketID(newSocketID) {
        this.socketID = newSocketID;
    }

    sendWinnerToPLayer(winner) {
        this.getSocket().emit("winner-decided", winner);

    }


}

module.exports = Player;