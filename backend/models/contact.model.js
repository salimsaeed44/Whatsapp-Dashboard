/**
 * Contact Model
 * Database model for contacts table
 */

const { query } = require('../config/database');

/**
 * Create a new contact
 * @param {Object} contactData - Contact data object
 * @returns {Promise<Object>} Created contact
 */
const createContact = async (contactData) => {
  try {
    const {
      phone_number,
      name = null,
      email = null,
      custom_fields = {},
      metadata = {},
      is_active = true
    } = contactData;

    // Validate required fields
    if (!phone_number) {
      throw new Error('Phone number is required');
    }

    // Insert contact
    const result = await query(
      `INSERT INTO contacts (phone_number, name, email, custom_fields, metadata, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        phone_number,
        name,
        email,
        JSON.stringify(custom_fields),
        JSON.stringify(metadata),
        is_active
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to create contact');
    }

    // Parse JSONB fields
    const contact = result.rows[0];
    contact.custom_fields = typeof contact.custom_fields === 'string' ? JSON.parse(contact.custom_fields) : contact.custom_fields;
    contact.metadata = typeof contact.metadata === 'string' ? JSON.parse(contact.metadata) : contact.metadata;

    return contact;
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'contacts_phone_number_key') {
        throw new Error('Phone number already exists');
      }
    }
    throw error;
  }
};

/**
 * Find contact by ID
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object|null>} Contact object or null
 */
const findContactById = async (contactId) => {
  try {
    const result = await query(
      `SELECT * FROM contacts WHERE id = $1 AND deleted_at IS NULL`,
      [contactId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const contact = result.rows[0];
    contact.custom_fields = typeof contact.custom_fields === 'string' ? JSON.parse(contact.custom_fields) : contact.custom_fields;
    contact.metadata = typeof contact.metadata === 'string' ? JSON.parse(contact.metadata) : contact.metadata;

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Find contact by phone number
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object|null>} Contact object or null
 */
const findContactByPhoneNumber = async (phoneNumber) => {
  try {
    const result = await query(
      `SELECT * FROM contacts WHERE phone_number = $1 AND deleted_at IS NULL`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Parse JSONB fields
    const contact = result.rows[0];
    contact.custom_fields = typeof contact.custom_fields === 'string' ? JSON.parse(contact.custom_fields) : contact.custom_fields;
    contact.metadata = typeof contact.metadata === 'string' ? JSON.parse(contact.metadata) : contact.metadata;

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all contacts with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Object with contacts array and total count
 */
const getAllContacts = async (options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      search,
      is_active,
      includeDeleted = false
    } = options;

    // Build WHERE clause
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!includeDeleted) {
      conditions.push(`deleted_at IS NULL`);
    }

    if (search) {
      conditions.push(`(
        phone_number ILIKE $${paramIndex} OR 
        name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex}
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM contacts ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get contacts
    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM contacts 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    // Parse JSONB fields
    const contacts = result.rows.map(row => {
      row.custom_fields = typeof row.custom_fields === 'string' ? JSON.parse(row.custom_fields) : row.custom_fields;
      row.metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
      return row;
    });

    return {
      contacts,
      total,
      limit,
      offset
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update contact
 * @param {string} contactId - Contact ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated contact
 */
const updateContact = async (contactId, updateData) => {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(updateData.name);
      paramIndex++;
    }

    if (updateData.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(updateData.email);
      paramIndex++;
    }

    if (updateData.custom_fields !== undefined) {
      fields.push(`custom_fields = $${paramIndex}`);
      values.push(JSON.stringify(updateData.custom_fields));
      paramIndex++;
    }

    if (updateData.metadata !== undefined) {
      fields.push(`metadata = $${paramIndex}`);
      values.push(JSON.stringify(updateData.metadata));
      paramIndex++;
    }

    if (updateData.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(updateData.is_active);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(contactId);

    const result = await query(
      `UPDATE contacts 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Contact not found');
    }

    // Parse JSONB fields
    const contact = result.rows[0];
    contact.custom_fields = typeof contact.custom_fields === 'string' ? JSON.parse(contact.custom_fields) : contact.custom_fields;
    contact.metadata = typeof contact.metadata === 'string' ? JSON.parse(contact.metadata) : contact.metadata;

    return contact;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete contact (soft delete)
 * @param {string} contactId - Contact ID
 * @returns {Promise<boolean>} Success status
 */
const deleteContact = async (contactId) => {
  try {
    const result = await query(
      `UPDATE contacts
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [contactId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk create contacts
 * @param {Array} contactsData - Array of contact data objects
 * @returns {Promise<Array>} Created contacts
 */
const bulkCreateContacts = async (contactsData) => {
  try {
    const createdContacts = [];
    
    for (const contactData of contactsData) {
      try {
        const contact = await createContact(contactData);
        createdContacts.push(contact);
      } catch (error) {
        // Skip duplicates or log error
        console.error('Error creating contact:', error.message);
      }
    }

    return createdContacts;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createContact,
  findContactById,
  findContactByPhoneNumber,
  getAllContacts,
  updateContact,
  deleteContact,
  bulkCreateContacts
};

