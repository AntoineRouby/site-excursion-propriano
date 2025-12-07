import sgMail from '@sendgrid/mail';
import ejs from 'ejs';
import path from 'path';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data?: any;
}

export const sendEmail = async ({ to, subject, template, data = {} }: EmailData) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, data);

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Reservation confirmation email
export const sendReservationConfirmation = async (reservation: any, client: any) => {
  const { QRCodeService } = require('./qr.service');
  const qrCodeDataUrl = await QRCodeService.generate(reservation.reservationNumber);

  await sendEmail({
    to: client.email,
    subject: `Confirmation de réservation - ${reservation.reservationNumber}`,
    template: 'reservation-confirmation',
    data: {
      firstName: client.firstName,
      reservationNumber: reservation.reservationNumber,
      excursionName: reservation.excursion.name.fr,
      date: new Date(reservation.date).toLocaleDateString('fr-FR'),
      time: reservation.timeSlot,
      numberOfPeople: reservation.numberOfPeople,
      totalAmount: reservation.totalAmount,
      meetingPoint: reservation.excursion.meetingPoint,
      qrCode: qrCodeDataUrl,
    },
  });
};

// Reminder email (24h before)
export const sendReminderEmail = async (reservation: any, client: any) => {
  await sendEmail({
    to: client.email,
    subject: 'Rappel: Votre excursion demain',
    template: 'reminder',
    data: {
      firstName: client.firstName,
      excursionName: reservation.excursion.name.fr,
      date: new Date(reservation.date).toLocaleDateString('fr-FR'),
      time: reservation.timeSlot,
      meetingPoint: reservation.excursion.meetingPoint,
      weather: reservation.weatherForecast,
      thingsToBring: reservation.excursion.thingsToBring,
    },
  });
};