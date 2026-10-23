import mongoose from 'mongoose';

// ── Helper: derive a URL-safe slug from a name string ────────────────────────
function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Community chapter sub-schema ─────────────────────────────────────────────
const communitySchema = new mongoose.Schema({
  chapterName:   { type: String, default: '', trim: true },
  weeklyRunners: { type: Number, default: 0 },
  meetDay:       { type: String, default: '', trim: true },
  meetTime:      { type: String, default: '', trim: true },
  meetupPoint:   { type: String, default: '', trim: true },
  paceGroups:    { type: [String], default: [] },
  leads:         { type: [String], default: [] }
}, { _id: false });

// ── Main City schema ──────────────────────────────────────────────────────────
const citySchema = new mongoose.Schema({
  // ── Core identity ────────────────────────────────────────────────────────
  name: {
    type: String,
    required: [true, 'City name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
    // Auto-generated from name on pre-validate if not supplied
  },

  // ── Event details ─────────────────────────────────────────────────────────
  // "date" kept for backward compatibility (same as eventDate)
  date: {
    type: String,
    required: [true, 'Event date is required'],
    trim: true
  },
  eventDate: {
    type: String,
    default: '',
    trim: true
  },
  // "time" kept for backward compatibility (same as flagOffTime)
  time: {
    type: String,
    required: [true, 'Flag-off time is required'],
    trim: true
  },
  flagOffTime: {
    type: String,
    default: '',
    trim: true
  },
  gatesOpenTime: {
    type: String,
    default: '',
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Starting venue is required'],
    trim: true
  },

  // ── Presentation ─────────────────────────────────────────────────────────
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80'
  },
  badgeText: {
    type: String,
    default: 'Official Marathon Course',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },

  // ── Race categories offered in this city ──────────────────────────────────
  categories: {
    type: [String],
    default: ['1K', '3K', '5K', '10K', '21K']
  },

  // ── Status ───────────────────────────────────────────────────────────────
  // Both "status" (string) and "isActive" (boolean) are kept in sync.
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  displayOrder: {
    type: Number,
    default: 0
  },

  // ── Optional community chapter info ──────────────────────────────────────
  community: {
    type: communitySchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// ── Pre-validate hook: auto-generate slug + sync mirrored fields ─────────────
// NOTE: Mongoose 9 does not support the "next" callback. Use a plain function.
citySchema.pre('validate', function () {
  // Auto-slug from name if slug is missing
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }

  // Mirror date ↔ eventDate (keep both in sync)
  if (this.date && !this.eventDate)    this.eventDate    = this.date;
  if (this.eventDate && !this.date)    this.date         = this.eventDate;

  // Mirror time ↔ flagOffTime
  if (this.time && !this.flagOffTime)  this.flagOffTime  = this.time;
  if (this.flagOffTime && !this.time)  this.time         = this.flagOffTime;

  // Mirror status ↔ isActive
  if (this.isModified('status')) {
    this.isActive = this.status === 'active';
  } else if (this.isModified('isActive')) {
    this.status = this.isActive ? 'active' : 'inactive';
  }
});

const City = mongoose.model('City', citySchema);

export default City;