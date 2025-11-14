const { getFirestore, COLLECTIONS } = require('../config/firebase.config');
const { FieldValue } = require('firebase-admin/firestore');

class DoctorAvailabilityModel {
  constructor() {
    this.collection = COLLECTIONS.DOCTOR_AVAILABILITY;
  }

  async create(data) {
    const db = getFirestore();
    const docRef = db.collection(this.collection).doc();
    
    const availabilityData = {
      id: docRef.id,
      doctorId: data.doctorId,
      weeklySchedule: data.weeklySchedule || this.getDefaultWeeklySchedule(),
      specificDates: data.specificDates || [],
      consultationFee: data.consultationFee || 500,
      emergencyAvailable: data.emergencyAvailable || false,
      advanceBookingLimit: data.advanceBookingLimit || 30,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(availabilityData);
    return { ...availabilityData, _id: docRef.id };
  }

  getDefaultWeeklySchedule() {
    const defaultDay = {
      isAvailable: true,
      startTime: '09:00',
      endTime: '17:00',
      breakStartTime: '13:00',
      breakEndTime: '14:00',
      slotDuration: 30
    };

    return {
      monday: { ...defaultDay },
      tuesday: { ...defaultDay },
      wednesday: { ...defaultDay },
      thursday: { ...defaultDay },
      friday: { ...defaultDay },
      saturday: { ...defaultDay, endTime: '13:00', breakStartTime: '', breakEndTime: '' },
      sunday: { isAvailable: false, startTime: '', endTime: '', breakStartTime: '', breakEndTime: '', slotDuration: 30 }
    };
  }

  async findOne(query) {
    const db = getFirestore();
    const collectionRef = db.collection(this.collection);
    
    let queryRef = collectionRef;
    
    if (query.doctorId) {
      queryRef = queryRef.where('doctorId', '==', query.doctorId);
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

  async save(availability) {
    const db = getFirestore();
    const docId = availability._id || availability.id;

    if (docId) {
      const updateData = { ...availability };
      delete updateData._id;
      delete updateData.id;
      updateData.updatedAt = FieldValue.serverTimestamp();
      
      await db.collection(this.collection).doc(docId).update(updateData);
      return this.findById(docId);
    } else {
      return this.create(availability);
    }
  }

  generateSlotsForDay(availability, date) {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const daySchedule = availability.weeklySchedule[dayOfWeek];

    if (!daySchedule.isAvailable) {
      return [];
    }

    const slots = [];
    const startTime = new Date(`1970-01-01T${daySchedule.startTime}:00`);
    const endTime = new Date(`1970-01-01T${daySchedule.endTime}:00`);
    const breakStart = daySchedule.breakStartTime
      ? new Date(`1970-01-01T${daySchedule.breakStartTime}:00`)
      : null;
    const breakEnd = daySchedule.breakEndTime
      ? new Date(`1970-01-01T${daySchedule.breakEndTime}:00`)
      : null;
    const slotDuration = daySchedule.slotDuration * 60 * 1000;

    let currentTime = startTime;

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration);

      if (
        breakStart &&
        breakEnd &&
        ((currentTime >= breakStart && currentTime < breakEnd) ||
          (slotEnd > breakStart && slotEnd <= breakEnd))
      ) {
        currentTime = breakEnd;
        continue;
      }

      if (slotEnd <= endTime) {
        slots.push({
          startTime: currentTime.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          isBooked: false,
        });
      }

      currentTime = slotEnd;
    }

    return slots;
  }
}

module.exports = new DoctorAvailabilityModel();
