/**
 * Initial database schema migration
 */

/**
 * @param {import('knex')} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', function(table) {
      table.uuid('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('username', 100).notNullable();
      table.text('client_salt').notNullable();
      table.text('verifier').notNullable();
      table.timestamps(true, true);
    })
    
    // WebAuthn credentials table
    .createTable('webauthn_credentials', function(table) {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable();
      table.text('credential_id').notNullable();
      table.text('public_key').notNullable();
      table.integer('counter').unsigned().notNullable().defaultTo(0);
      table.string('credential_device_type', 32).notNullable();
      table.boolean('credential_backed_up').notNullable().defaultTo(false);
      table.text('transports');
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.unique(['user_id', 'credential_id']);
    })
    
    // Vault entries table
    .createTable('vault_entries', function(table) {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable();
      table.text('encrypted_data').notNullable();
      table.json('metadata').notNullable().defaultTo('{}');
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.index('user_id');
    });
};

/**
 * @param {import('knex')} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('vault_entries')
    .dropTableIfExists('webauthn_credentials')
    .dropTableIfExists('users');
};