const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class ChatModel {
  constructor() {
    this.collection = COLLECTIONS.CHATS;
  }

  async create(data) {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    const chatData = {
      id: docRef.id,
      doctorId: data.doctorId,
      patientId: data.patientId,
      appointmentId: data.appointmentId || null,
      messages: [],
      lastMessage: null,
      isActive: true,
      doctorTyping: false,
      patientTyping: false,
      doctorUnreadCount: 0,
      patientUnreadCount: 0,
      isMuted: { doctor: false, patient: false },
      activeVideoCall: {
        isActive: false,
        roomId: '',
        startedBy: null,
        startedByModel: null,
        startedAt: null,
        participants: []
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(chatData);
    return { ...chatData, _id: docRef.id };
  }

  async findOne(query) {
    const db = getFirestore();
    const collectionRef = db.collection(this.collection);
    
    let queryRef = collectionRef;
    
    // Build composite query
    if (query.doctorId && query.patientId) {
      queryRef = queryRef
        .where('doctorId', '==', query.doctorId)
        .where('patientId', '==', query.patientId);
    } else if (query.doctorId) {
      queryRef = queryRef.where('doctorId', '==', query.doctorId);
    } else if (query.patientId) {
      queryRef = queryRef.where('patientId', '==', query.patientId);
    } else if (query._id || query.id) {
      const docId = query._id || query.id;
      const doc = await collectionRef.doc(docId).get();
      return doc.exists ? { ...doc.data(), _id: doc.id } : null;
    }

    const snapshot = await queryRef.limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { ...doc.data(), _id: doc.id };
  }

  async findById(id) {
    const db = getFirestore();
    const doc = await db.collection(this.collection).doc(id).get();
    return doc.exists ? { ...doc.data(), _id: doc.id } : null;
  }

  async find(query = {}, options = {}) {
    const db = getFirestore();
    let queryRef = db.collection(this.collection);

    // Apply filters
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && typeof query[key] !== 'object') {
        queryRef = queryRef.where(key, '==', query[key]);
      }
    });

    // Apply populate if specified
    const snapshot = await queryRef.get();
    let chats = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

    if (options.populate) {
      const Doctor = require('./doctor');
      const Patient = require('./patient');

      chats = await Promise.all(chats.map(async (chat) => {
        if (options.populate.includes('doctorId') && chat.doctorId) {
          chat.doctorId = await Doctor.findById(chat.doctorId);
        }
        if (options.populate.includes('patientId') && chat.patientId) {
          chat.patientId = await Patient.findById(chat.patientId);
        }
        return chat;
      }));
    }

    return chats;
  }

  async save(chat) {
    const db = getFirestore();
    const docId = chat._id || chat.id;

    if (docId) {
      const updateData = { ...chat };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      return this.create(chat);
    }
  }

  // Helper methods
  addMessage(chat, messageData) {
    const message = {
      ...messageData,
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!chat.messages) chat.messages = [];
    chat.messages.push(message);
    chat.lastMessage = message;

    // Update unread counts
    if (messageData.senderModel === "Doctor") {
      chat.patientUnreadCount = (chat.patientUnreadCount || 0) + 1;
    } else {
      chat.doctorUnreadCount = (chat.doctorUnreadCount || 0) + 1;
    }

    return message;
  }

  markAsRead(chat, userId, userModel) {
    if (!chat.messages) return 0;

    const unreadMessages = chat.messages.filter(
      (msg) =>
        !msg.isRead &&
        (msg.senderId !== userId || msg.senderModel !== userModel)
    );

    unreadMessages.forEach((msg) => {
      msg.isRead = true;
      msg.readAt = new Date().toISOString();
    });

    // Reset unread count
    if (userModel === "Doctor") {
      chat.doctorUnreadCount = 0;
    } else {
      chat.patientUnreadCount = 0;
    }

    return unreadMessages.length;
  }

  startVideoCall(chat, startedBy, startedByModel) {
    const roomId = `call_${chat._id || chat.id}_${Date.now()}`;

    chat.activeVideoCall = {
      isActive: true,
      roomId: roomId,
      startedBy: startedBy,
      startedByModel: startedByModel,
      startedAt: new Date().toISOString(),
      participants: [
        {
          userId: startedBy,
          userModel: startedByModel,
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    // Add system message
    this.addMessage(chat, {
      senderId: startedBy,
      senderModel: startedByModel,
      messageType: "video_call_start",
      content: "Video call started",
    });

    return roomId;
  }

  endVideoCall(chat, endedBy, endedByModel) {
    if (chat.activeVideoCall?.isActive) {
      chat.activeVideoCall.isActive = false;

      // Add system message
      this.addMessage(chat, {
        senderId: endedBy,
        senderModel: endedByModel,
        messageType: "video_call_end",
        content: "Video call ended",
      });
    }
  }
}

module.exports = new ChatModel();
