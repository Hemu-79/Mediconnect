const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class PatientModel {
  constructor() {
    this.collection = COLLECTIONS.PATIENTS;
  }

  async create(data) {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    // Handle name field - split into firstName and lastName if provided
    let firstName = data.firstName || '';
    let lastName = data.lastName || '';
    
    if (data.name && !data.firstName && !data.lastName) {
      const nameParts = data.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    const patientData = {
      id: docRef.id,
      firebaseUid: data.firebaseUid,
      email: data.email,
      firstName: firstName,
      lastName: lastName,
      name: data.name || `${firstName} ${lastName}`.trim(),
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
      bloodGroup: data.bloodGroup || null,
      maritalStatus: data.maritalStatus || 'single',
      phoneNumber: data.phoneNumber || '',
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      profilePicture: data.profilePicture || '',
      emergencyContacts: data.emergencyContacts || [],
      height: data.height || { value: null, unit: 'cm' },
      weight: data.weight || { value: null, unit: 'kg' },
      medicalHistory: data.medicalHistory || [],
      allergies: data.allergies || [],
      currentMedications: data.currentMedications || [],
      smokingStatus: data.smokingStatus || 'never',
      alcoholConsumption: data.alcoholConsumption || 'never',
      exerciseFrequency: data.exerciseFrequency || 'none',
      dietType: data.dietType || 'vegetarian',
      profileCompleted: false,
      role: 'patient',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(patientData);
    return { ...patientData, _id: docRef.id };
  }

  async findOne(query) {
    const db = getFirestore();
    const collectionRef = db.collection(this.collection);
    
    let queryRef = collectionRef;
    
    if (query.firebaseUid) {
      queryRef = queryRef.where('firebaseUid', '==', query.firebaseUid);
    } else if (query.email) {
      queryRef = queryRef.where('email', '==', query.email);
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

    // Apply filters if provided
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined && typeof query[key] !== 'object') {
        queryRef = queryRef.where(key, '==', query[key]);
      }
    });

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  }

  async updateOne(query, update) {
    const patient = await this.findOne(query);
    if (!patient) return null;

    const db = getFirestore();
    const updateData = {
      ...update.$set,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection(this.collection).doc(patient._id).update(updateData);
    return this.findById(patient._id);
  }

  async save(patient) {
    const db = getFirestore();
    const docId = patient._id || patient.id;

    if (docId) {
      // Update existing
      const updateData = { ...patient };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      // Create new
      return this.create(patient);
    }
  }

  // Helper methods
  checkProfileCompletion(patient) {
    const required = {
      personalInfo: !!(
        patient.firstName &&
        patient.lastName &&
        patient.dateOfBirth &&
        patient.gender &&
        patient.bloodGroup
      ),
      contactInfo: !!patient.phoneNumber,
      medicalInfo: !!(patient.height?.value && patient.weight?.value),
      emergencyContact: patient.emergencyContacts?.length > 0,
    };

    patient.completedSections = required;
    patient.profileCompleted = Object.values(required).every(Boolean);

    return patient.profileCompleted;
  }

  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  calculateBMI(height, weight) {
    if (!height?.value || !weight?.value) return null;
    const heightInMeters = height.value / 100;
    return (weight.value / (heightInMeters * heightInMeters)).toFixed(1);
  }
}

module.exports = new PatientModel();
