const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class AppointmentModel {
  constructor() {
    this.collection = COLLECTIONS.APPOINTMENTS;
  }

  async create(data) {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    const appointmentData = {
      id: docRef.id,
      doctorId: data.doctorId,
      patientId: data.patientId,
      appointmentDate: data.appointmentDate,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status || 'pending',
      appointmentType: data.appointmentType || 'consultation',
      notes: data.notes || '',
      fee: data.fee,
      paymentStatus: data.paymentStatus || 'pending',
      paymentId: data.paymentId || '',
      reasonForVisit: data.reasonForVisit,
      doctorNotes: data.doctorNotes || '',
      prescription: data.prescription || '',
      roomUrl: data.roomUrl || '',
      symptoms: data.symptoms || [],
      diagnosis: data.diagnosis || '',
      followUpRequired: data.followUpRequired || false,
      followUpDate: data.followUpDate || null,
      doctorCalendarEventId: data.doctorCalendarEventId || null,
      patientCalendarEventId: data.patientCalendarEventId || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(appointmentData);
    return { ...appointmentData, _id: docRef.id };
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
      const value = query[key];
      
      if (value && typeof value === 'object' && value.$gte && value.$lte) {
        // Handle range queries
        queryRef = queryRef.where(key, '>=', value.$gte).where(key, '<=', value.$lte);
      } else if (value !== undefined && typeof value !== 'object') {
        queryRef = queryRef.where(key, '==', value);
      }
    });

    // Apply populate (we'll fetch related docs separately)
    const snapshot = await queryRef.get();
    let appointments = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

    // Handle populate for doctorId and patientId
    if (options.populate) {
      const Doctor = require('./doctor');
      const Patient = require('./patient');

      appointments = await Promise.all(appointments.map(async (apt) => {
        if (options.populate.includes('doctorId') && apt.doctorId) {
          apt.doctorId = await Doctor.findById(apt.doctorId);
        }
        if (options.populate.includes('patientId') && apt.patientId) {
          apt.patientId = await Patient.findById(apt.patientId);
        }
        return apt;
      }));
    }

    // Apply sorting
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortDirection = options.sort[sortField];
      
      appointments.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (sortDirection === 1 || sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return appointments;
  }

  async findOne(query) {
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  async updateOne(query, update) {
    const appointment = await this.findOne(query);
    if (!appointment) return null;

    const db = getFirestore();
    const updateData = {
      ...update.$set,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection(this.collection).doc(appointment._id).update(updateData);
    return this.findById(appointment._id);
  }

  async save(appointment) {
    const db = getFirestore();
    const docId = appointment._id || appointment.id;

    if (docId) {
      // Update existing
      const updateData = { ...appointment };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      // Create new
      return this.create(appointment);
    }
  }

  async deleteOne(query) {
    const appointment = await this.findOne(query);
    if (!appointment) return null;

    const db = getFirestore();
    await db.collection(this.collection).doc(appointment._id).delete();
    return appointment;
  }

  async aggregate(pipeline) {
    // Simplified aggregate for common use cases
    const db = getFirestore();
    
    if (pipeline[0]?.$match) {
      const matchQuery = pipeline[0].$match;
      const appointments = await this.find(matchQuery);
      
      if (pipeline[1]?.$group) {
        const groupBy = pipeline[1].$group._id;
        const groupField = groupBy.replace('$', '');
        
        const grouped = appointments.reduce((acc, apt) => {
          const key = apt[groupField];
          if (!acc[key]) {
            acc[key] = { _id: key, appointmentCount: 0 };
          }
          acc[key].appointmentCount += 1;
          return acc;
        }, {});
        
        let result = Object.values(grouped);
        
        // Apply match on grouped results
        if (pipeline[2]?.$match) {
          const secondMatch = pipeline[2].$match;
          result = result.filter(item => {
            return Object.keys(secondMatch).every(key => {
              if (secondMatch[key].$gte) {
                return item[key] >= secondMatch[key].$gte;
              }
              return item[key] === secondMatch[key];
            });
          });
        }
        
        // Apply sort
        if (pipeline[3]?.$sort) {
          const sortField = Object.keys(pipeline[3].$sort)[0];
          const sortDir = pipeline[3].$sort[sortField];
          result.sort((a, b) => sortDir === 1 ? a[sortField] - b[sortField] : b[sortField] - a[sortField]);
        }
        
        // Apply limit
        if (pipeline[4]?.$limit) {
          result = result.slice(0, pipeline[4].$limit);
        }
        
        return result;
      }
    }
    
    return [];
  }
}

module.exports = new AppointmentModel();
