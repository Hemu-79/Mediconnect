const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class TherapyModel {
  constructor() {
    this.collection = COLLECTIONS.THERAPIES;
  }

  async create(data) {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    const therapyData = {
      id: docRef.id,
      routineName: data.routineName,
      description: data.description,
      longDescription: data.longDescription,
      difficulty: data.difficulty || 'Easy',
      totalDuration: data.totalDuration,
      targetConditions: data.targetConditions || [],
      exercises: data.exercises || [],
      category: data.category,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: data.createdBy || 'System',
      thumbnailImage: data.thumbnailImage || '/images/therapy-default.jpg',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(therapyData);
    return { ...therapyData, _id: docRef.id };
  }

  async findOne(query) {
    const db = getFirestore();
    const collectionRef = db.collection(this.collection);
    
    let queryRef = collectionRef;
    
    if (query.routineName) {
      queryRef = queryRef.where('routineName', '==', query.routineName);
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

  async find(query = {}) {
    const db = getFirestore();
    let queryRef = db.collection(this.collection);

    // Apply filters
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && typeof query[key] !== 'object') {
        queryRef = queryRef.where(key, '==', query[key]);
      }
    });

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  }

  async save(therapy) {
    const db = getFirestore();
    const docId = therapy._id || therapy.id;

    if (docId) {
      const updateData = { ...therapy };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      return this.create(therapy);
    }
  }
}

module.exports = new TherapyModel();
