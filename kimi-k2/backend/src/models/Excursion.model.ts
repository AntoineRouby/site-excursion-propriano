import mongoose, { Schema, Document } from 'mongoose';

export interface IExcursion extends Document {
  name: {
    fr: string;
    en: string;
    it: string;
  };
  description: {
    fr: string;
    en: string;
    it: string;
  };
  shortDescription: {
    fr: string;
    en: string;
    it: string;
  };
  images: string[];
  price: number;
  duration: number; // in hours
  maxCapacity: number;
  minCapacity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  highlights: string[];
  includes: string[];
  meetingPoint: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions: string;
  };
  season: {
    start: Date;
    end: Date;
  };
  schedule: {
    departureTime: string;
    returnTime: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExcursionSchema = new Schema<IExcursion>({
  name: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    it: { type: String, required: true }
  },
  description: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    it: { type: String, required: true }
  },
  shortDescription: {
    fr: { type: String, required: true },
    en: { type: String, required: true },
    it: { type: String, required: true }
  },
  images: [{ type: String }],
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  maxCapacity: { type: Number, required: true },
  minCapacity: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  highlights: [{ type: String }],
  includes: [{ type: String }],
  meetingPoint: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    instructions: { type: String }
  },
  season: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  schedule: {
    departureTime: { type: String, required: true },
    returnTime: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IExcursion>('Excursion', ExcursionSchema);