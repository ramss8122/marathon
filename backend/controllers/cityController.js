import City from '../models/City.js';
import Registration from '../models/Registration.js';

// ── Slug helper ───────────────────────────────────────────────────────────────
function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Chennai seed (only inserted if cities collection is empty) ────────────────
const CHENNAI_SEED = {
  name: 'Chennai',
  slug: 'chennai',
  date: 'Sunday, 15 Nov 2026',
  eventDate: 'Sunday, 15 Nov 2026',
  time: '5:30 AM IST',
  flagOffTime: '5:30 AM IST',
  gatesOpenTime: '4:30 AM IST',
  venue: 'Besant Nagar Promenade',
  imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
  badgeText: 'Certified coastal course',
  description: 'Experience the excitement of marathon running along the Chennai coastline, bringing runners together for a memorable sunrise sporting event.',
  categories: ['1K', '3K', '5K', '10K', '21K'],
  status: 'active',
  isActive: true,
  displayOrder: 1,
  community: {
    chapterName: 'Chennai Runners',
    weeklyRunners: 120,
    meetDay: 'Sunday',
    meetTime: '6:00 AM',
    meetupPoint: 'Besant Nagar Beach Entrance',
    paceGroups: ['4:30 min/km', '5:30 min/km', '7:00 min/km'],
    leads: ['Rajesh Kumar', 'Priya Nair']
  }
};

/**
 * seedDefaultCities()
 * Inserts Chennai ONLY when the cities collection is completely empty.
 * Existing cities are never touched.
 */
export async function seedDefaultCities() {
  try {
    const count = await City.countDocuments();
    if (count === 0) {
      await City.create(CHENNAI_SEED);
      console.log('[CitySeeder] Empty collection – seeded Chennai.');
    }
    // If cities already exist we leave them entirely untouched.
  } catch (err) {
    console.error('[CitySeeder Error]', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/cities
 * Returns only active cities, sorted by displayOrder then createdAt.
 */
export async function getCities(req, res) {
  try {
    const cities = await City.find({ status: 'active' }).sort({ displayOrder: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    console.error('[getCities]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
}

/**
 * GET /api/cities/:slug
 * Returns one active city by slug.
 */
export async function getCityBySlug(req, res) {
  try {
    const cleanSlug = slugify(req.params.slug || '');
    const city = await City.findOne({ slug: cleanSlug, status: 'active' });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: `City '${cleanSlug}' not found or is currently inactive.`
      });
    }

    res.status(200).json({ success: true, data: city });
  } catch (err) {
    console.error('[getCityBySlug]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve city.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES (protected by requireAdminAuth in router)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/cities
 * Returns ALL cities (active + inactive), sorted by displayOrder.
 */
export async function adminGetCities(req, res) {
  try {
    const cities = await City.find().sort({ displayOrder: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: cities.length, data: cities });
  } catch (err) {
    console.error('[adminGetCities]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
}

/**
 * POST /api/admin/cities
 * Creates a new city. Slug is auto-derived from name if not supplied.
 *
 * Required body fields: name, date (or eventDate), time (or flagOffTime), venue
 * Optional: slug, imageUrl, badgeText, description, categories, status, displayOrder,
 *           gatesOpenTime, community.*
 */
export async function adminCreateCity(req, res) {
  try {
    const {
      name, slug,
      date, eventDate,
      time, flagOffTime, gatesOpenTime,
      venue,
      imageUrl, badgeText, description,
      categories,
      status, isActive,
      displayOrder,
      community
    } = req.body;

    // ── Required field validation ───────────────────────────────────────────
    const resolvedDate  = (date || eventDate || '').trim();
    const resolvedTime  = (time || flagOffTime || '').trim();
    if (!name || !resolvedDate || !resolvedTime || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, date (or eventDate), time (or flagOffTime), venue.'
      });
    }

    // ── Slug uniqueness check ───────────────────────────────────────────────
    const resolvedSlug = slug ? slugify(slug) : slugify(name);
    const clash = await City.findOne({ slug: resolvedSlug });
    if (clash) {
      return res.status(409).json({
        success: false,
        message: `A city with slug '${resolvedSlug}' already exists.`
      });
    }

    // ── Determine display order ─────────────────────────────────────────────
    const nextOrder = displayOrder !== undefined
      ? Number(displayOrder)
      : (await City.countDocuments()) + 1;

    // ── Determine status ────────────────────────────────────────────────────
    const resolvedStatus = status === 'inactive' ? 'inactive' : 'active';

    const newCity = await City.create({
      name: name.trim(),
      slug: resolvedSlug,
      date: resolvedDate,
      eventDate: resolvedDate,
      time: resolvedTime,
      flagOffTime: resolvedTime,
      gatesOpenTime: (gatesOpenTime || '').trim(),
      venue: venue.trim(),
      imageUrl: (imageUrl || '').trim() || undefined,
      badgeText: (badgeText || '').trim() || undefined,
      description: (description || '').trim(),
      categories: Array.isArray(categories) && categories.length ? categories : ['1K', '3K', '5K', '10K', '21K'],
      status: resolvedStatus,
      isActive: resolvedStatus === 'active',
      displayOrder: nextOrder,
      community: community || {}
    });

    res.status(201).json({
      success: true,
      message: `City '${newCity.name}' created successfully.`,
      data: newCity
    });
  } catch (err) {
    console.error('[adminCreateCity]', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A city with that slug already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to create city.' });
  }
}

/**
 * PUT /api/admin/cities/:id
 * Full update of a city. All fields are optional in the body; only provided
 * fields are updated.
 */
export async function adminUpdateCity(req, res) {
  try {
    const { id } = req.params;
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const {
      name, slug,
      date, eventDate,
      time, flagOffTime, gatesOpenTime,
      venue,
      imageUrl, badgeText, description,
      categories,
      status, isActive,
      displayOrder,
      community
    } = req.body;

    // ── Slug uniqueness check ───────────────────────────────────────────────
    if (slug !== undefined) {
      const cleanSlug = slugify(slug);
      const clash = await City.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (clash) {
        return res.status(409).json({
          success: false,
          message: `Slug '${cleanSlug}' is already used by another city.`
        });
      }
      city.slug = cleanSlug;
    } else if (name && name.trim() !== city.name) {
      // Auto-reslug only if name changed AND no explicit slug provided AND
      // the auto-derived slug is not already taken.
      const autoSlug = slugify(name);
      const clash = await City.findOne({ slug: autoSlug, _id: { $ne: id } });
      if (!clash) city.slug = autoSlug;
    }

    if (name        !== undefined) city.name         = name.trim();

    // Date / eventDate (keep in sync)
    const newDate = (date || eventDate || '').trim();
    if (newDate) { city.date = newDate; city.eventDate = newDate; }

    // Time / flagOffTime (keep in sync)
    const newTime = (time || flagOffTime || '').trim();
    if (newTime) { city.time = newTime; city.flagOffTime = newTime; }

    if (gatesOpenTime !== undefined) city.gatesOpenTime = gatesOpenTime.trim();
    if (venue         !== undefined) city.venue         = venue.trim();
    if (imageUrl      !== undefined) city.imageUrl      = imageUrl.trim();
    if (badgeText     !== undefined) city.badgeText     = badgeText.trim();
    if (description   !== undefined) city.description   = description.trim();
    if (displayOrder  !== undefined) city.displayOrder  = Number(displayOrder);

    if (Array.isArray(categories) && categories.length) {
      city.categories = categories;
    }

    // Status / isActive sync
    if (status !== undefined) {
      city.status   = status === 'inactive' ? 'inactive' : 'active';
      city.isActive = city.status === 'active';
    } else if (isActive !== undefined) {
      city.isActive = Boolean(isActive);
      city.status   = city.isActive ? 'active' : 'inactive';
    }

    // Community fields – merge rather than replace
    if (community && typeof community === 'object') {
      city.community = { ...(city.community?.toObject?.() ?? city.community ?? {}), ...community };
    }

    await city.save();

    res.status(200).json({
      success: true,
      message: `City '${city.name}' updated successfully.`,
      data: city
    });
  } catch (err) {
    console.error('[adminUpdateCity]', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A city with that slug already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to update city.' });
  }
}

/**
 * PATCH /api/admin/cities/:id/status
 * Toggles or sets the city status between "active" / "inactive".
 * Body: { status: "active" | "inactive" }  OR  { isActive: true | false }
 */
export async function adminToggleCityStatus(req, res) {
  try {
    const { id } = req.params;
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const { status, isActive } = req.body;

    if (status !== undefined) {
      city.status   = status === 'inactive' ? 'inactive' : 'active';
      city.isActive = city.status === 'active';
    } else if (isActive !== undefined) {
      city.isActive = Boolean(isActive);
      city.status   = city.isActive ? 'active' : 'inactive';
    } else {
      // No body provided → toggle
      city.isActive = !city.isActive;
      city.status   = city.isActive ? 'active' : 'inactive';
    }

    await city.save();

    res.status(200).json({
      success: true,
      message: `City '${city.name}' is now ${city.status}.`,
      data: { id: city._id, name: city.name, status: city.status, isActive: city.isActive }
    });
  } catch (err) {
    console.error('[adminToggleCityStatus]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update city status.' });
  }
}

/**
 * DELETE /api/admin/cities/:id
 * Permanently deletes a city.
 * BLOCKED if any Registration documents reference this city (by city name or slug).
 */
export async function adminDeleteCity(req, res) {
  try {
    const { id } = req.params;
    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    // ── Registration guard ─────────────────────────────────────────────────
    // Registrations store the city as a free-text name (e.g. "Chennai").
    // We also check against the slug in case that was used.
    const regCount = await Registration.countDocuments({
      $or: [
        { city: { $regex: new RegExp(`^${city.name}$`, 'i') } },
        { city: { $regex: new RegExp(`^${city.slug}$`, 'i') } },
        { selectedEvent: { $regex: city.slug, $options: 'i' } }
      ]
    });

    if (regCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete '${city.name}' — ${regCount} registration${regCount === 1 ? '' : 's'} exist${regCount === 1 ? 's' : ''} for this city. Deactivate it instead.`
      });
    }

    await City.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `City '${city.name}' deleted successfully.`
    });
  } catch (err) {
    console.error('[adminDeleteCity]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete city.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy exports kept so existing public cityRoutes.js still compiles
// (city routes will be cleaned up in the next step)
// ─────────────────────────────────────────────────────────────────────────────
export const createCity = adminCreateCity;
export const updateCity = adminUpdateCity;
export const deleteCity = adminDeleteCity;

