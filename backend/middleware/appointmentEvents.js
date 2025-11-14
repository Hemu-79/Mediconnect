// middlewares/appointmentEvents.js
const Appointment = require('../models/appointment');

async function handleAppointmentCreated(appointmentId) {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId patientId');
    
    console.log('Appointment created:', {
      appointmentId,
      doctor: appointment.doctorId.email,
      patient: appointment.patientId.email,
      date: appointment.appointmentDate,
      time: `${appointment.startTime} - ${appointment.endTime}`
    });

    // Note: Google Calendar integration removed during Firebase migration
    // Calendar events can be added back later if needed
  } catch (error) {
    console.error('Appointment creation logging failed:', {
      error: error.message,
      stack: error.stack
    });
    // Don't throw - appointment should still complete
  }
}

async function handleAppointmentUpdated(appointmentId) {
  try {
    const appointment = await Appointment.findById(appointmentId);
    
    console.log('Appointment updated:', {
      appointmentId,
      status: appointment.status,
      date: appointment.appointmentDate,
      time: `${appointment.startTime} - ${appointment.endTime}`
    });

    // Note: Google Calendar integration removed during Firebase migration
    // Calendar events can be added back later if needed
  } catch (error) {
    console.error('Error handling appointment update:', error);
  }
}

async function handleAppointmentDeleted(appointmentId) {
  try {
    console.log('Appointment deleted:', { appointmentId });

    // Note: Google Calendar integration removed during Firebase migration
    // Calendar events can be added back later if needed
  } catch (error) {
    console.error('Error handling appointment deletion:', error);
  }
}

module.exports = {
  handleAppointmentCreated,
  handleAppointmentUpdated,
  handleAppointmentDeleted,
};