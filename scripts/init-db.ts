import { getDatabase } from '../lib/db'
import { seedDatabase } from '../lib/db/seed'

async function initDatabase() {
  try {
    console.log('Initializing database...')
    const db = getDatabase()
    console.log('Database connection established')
    
    console.log('Seeding database...')
    seedDatabase()
    console.log('Database initialized and seeded successfully!')
    
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()

