const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class DoctorModel {
  constructor() {
    this.collection = COLLECTIONS.DOCTORS;
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
    
    const doctorData = {
      id: docRef.id,
      firebaseUid: data.firebaseUid,
      email: data.email,
      firstName: firstName,
      lastName: lastName,
      name: data.name || `${firstName} ${lastName}`.trim(),
      profilePicture: data.profilePicture || '',
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || null,
      phoneNumber: data.phoneNumber || '',
      address: data.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      medicalLicenseNumber: data.medicalLicenseNumber || '',
      specializations: data.specializations || [],
      subSpecializations: data.subSpecializations || [],
      yearsOfExperience: data.yearsOfExperience || 0,
      education: data.education || [],
      hospitalAffiliations: data.hospitalAffiliations || [],
      clinicAddress: data.clinicAddress || {
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
      },
      bio: data.bio || '',
      averageRating: 0,
      totalReviews: 0,
      profileCompleted: false,
      totalPatients: 0,
      totalAppointments: 0,
      role: 'doctor',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(doctorData);
    return { ...doctorData, _id: docRef.id };
  }

  async findOne(query) {
    const db = getFirestore();
    const collectionRef = db.collection(this.collection);
    
    let queryRef = collectionRef;
    
    if (query.firebaseUid) {
      queryRef = queryRef.where('firebaseUid', '==', query.firebaseUid);
    } else if (query.email) {
      queryRef = queryRef.where('email', '==', query.email);
    } else if (query.medicalLicenseNumber) {
      queryRef = queryRef.where('medicalLicenseNumber', '==', query.medicalLicenseNumber);
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

    // Apply sorting
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortDirection = options.sort[sortField] === -1 ? 'desc' : 'asc';
      queryRef = queryRef.orderBy(sortField, sortDirection);
    }

    // Apply limit
    if (options.limit) {
      queryRef = queryRef.limit(options.limit);
    }

    // Apply skip (pagination)
    if (options.skip) {
      // Firestore doesn't have skip, we need to use offset
      queryRef = queryRef.offset(options.skip);
    }

    const snapshot = await queryRef.get();
    return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  }

  async updateOne(query, update) {
    const doctor = await this.findOne(query);
    if (!doctor) return null;

    const db = getFirestore();
    const updateData = {
      ...update.$set,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection(this.collection).doc(doctor._id).update(updateData);
    return this.findById(doctor._id);
  }

  async save(doctor) {
    const db = getFirestore();
    const docId = doctor._id || doctor.id;

    if (docId) {
      // Update existing
      const updateData = { ...doctor };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      // Create new
      return this.create(doctor);
    }
  }

  async distinct(field, query = {}) {
    const db = getFirestore();
    let queryRef = db.collection(this.collection);

    // Apply query filters
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) {
        queryRef = queryRef.where(key, '==', query[key]);
      }
    });

    const snapshot = await queryRef.get();
    const values = new Set();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const value = field.split('.').reduce((obj, key) => obj?.[key], data);
      
      if (Array.isArray(value)) {
        value.forEach(v => values.add(v));
      } else if (value !== undefined && value !== null) {
        values.add(value);
      }
    });

    return Array.from(values);
  }

  async countDocuments(query = {}) {
    const doctors = await this.find(query);
    return doctors.length;
  }

  // Helper methods
  checkProfileCompletion(doctor) {
    const required = {
      personalInfo: !!(
        doctor.firstName &&
        doctor.lastName &&
        doctor.dateOfBirth &&
        doctor.phoneNumber
      ),
      professionalInfo: !!(
        doctor.medicalLicenseNumber &&
        doctor.specializations?.length > 0 &&
        doctor.yearsOfExperience >= 0
      ),
      education: doctor.education?.length > 0,
    };

    doctor.completedSections = required;
    doctor.profileCompleted = Object.values(required).every(Boolean);

    return doctor.profileCompleted;
  }

  updateRating(doctor, newRating) {
    const totalRating = doctor.averageRating * doctor.totalReviews + newRating;
    doctor.totalReviews += 1;
    doctor.averageRating = totalRating / doctor.totalReviews;

    return doctor.averageRating;
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
}

module.exports = new DoctorModel();
