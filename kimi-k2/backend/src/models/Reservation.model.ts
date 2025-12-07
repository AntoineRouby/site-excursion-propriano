import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  reservationNumber: string;
  client: mongoose.Types.ObjectId;
  excursion: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  numberOfPeople: number;
  options: {
    lunch: boolean;
    equipment: boolean;
    privateGuide: boolean;
  };
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  qrCode: string;
  notes: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  checkInTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
  reservationNumber: { type: String, unique: true, required: true },
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  excursion: { type: Schema.Types.ObjectId, ref: 'Excursion', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  numberOfPeople: { type: Number, required: true, min: 1 },
  options: {
    lunch: { type: Boolean, default: false },
    equipment: { type: Boolean, default: false },
    privateGuide: { type: Boolean, default: false }
  },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
    required: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  qrCode: { type: String },
  notes: { type: String },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  checkInTime: { type: Date }
}, {
  timestamps: true
});

// Generate reservation number before saving
ReservationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.reservationNumber = `EDV${year}${month}${day}${random}`;
  }
  next();
});

export default mongoose.model<IReservation>('Reservation', ReservationSchema);