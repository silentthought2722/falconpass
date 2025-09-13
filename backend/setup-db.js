const knex = require('knex');
const path = require('path');

// Database configuration
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'falcon_pass.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};

async function setupDatabase() {
  const db = knex(dbConfig);
  
  try {
    console.log('Setting up database...');
    
    // Run migrations
    await db.migrate.latest();
    console.log('Migrations completed successfully');
    
    // Check if tables exist
    const tables = await db.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables created:', tables.map(t => t.name));
    
    await db.destroy();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error);
    await db.destroy();
    process.exit(1);
  }
}

setupDatabase();
