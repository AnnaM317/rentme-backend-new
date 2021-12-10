const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('setUser', userId => {
            if (socket.myTopic === userId) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(userId)
            socket.myTopic = userId
        })
        socket.on('setStay', stayId => {
            if (socket.myTopic === stayId) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(stayId)
            socket.myTopic = stayId
        })
        socket.on('setNotif', notif => {
            console.log('Emitting Chat msg', notif);
            gIo.to(socket.myTopic).emit('getNotif', notif)
        })

        socket.on('chat topic', topic => {
            //אם בחרת בטופיק שאתה גם ככה עליו אז לא צריך כלום
            if (socket.myTopic === topic) return;
            //אם יש עליך טופיק, נוריד מדבקה ונשי חדשה. נזכור שהסוקט הזה נמצא על הטופיק הזה כדי להוריד אחר כך את המדבקה
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        // אם מישהו שולח הודעה אז צריך לשלוח לכל מי שאיתו באותו הטופיק את ההודעה הזאת
        //socket זה הבחור ששלח הודעה ושורה 35 זה לשלוח לכל השאר שאיתו
        socket.on('chat newMsg', msg => {
            console.log('Emitting Chat msg', msg);
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('user-watch', userId => {
            socket.join('watching:' + userId)
        })
        //רוצה לדעת מי היוזר שזה הסוקט שלו, לכן שם את היוזר איידי על הסוקט הזה. צריך שיוזר סרוויס בפרונט אנד בלוגין להוסיף לסוקט
        socket.on('set-user-socket', userId => {
            logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
            socket.userId = userId
        })
        socket.on('unset-user-socket', () => {
            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}
//תביא סוקט של יוזר מסוים ואז אשר לעשות אמיט רק לסוקט הבודד הזה
async function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
//חוץ למי ששלח את ההודעה
async function broadcast({ type, data, room = null, userId }) {
    console.log('BROADCASTING', JSON.stringify(arguments));
    const excludedSocket = await _getUserSocket(userId)
    if (!excludedSocket) {
        // logger.debug('Shouldnt happen, socket not found')
        // _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    //חשוב
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}
//מחזירה סוקט של יוזר ספציפי
async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}
// function _getAllSockets() {
//     const socketIds = Object.keys(gIo.sockets.sockets)
//     const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
//     return sockets;
// }

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}



