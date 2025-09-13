const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs")

// Ensure database directory exists
const dbDir = path.join(process.cwd(), "database")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, "analyn.db")

console.log("🗄️  Setting up SQLite database...")

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message)
    process.exit(1)
  }
  console.log("✅ Connected to SQLite database")
})

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT CHECK(role IN ('client', 'therapist', 'admin')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Therapists table
      CREATE TABLE IF NOT EXISTS therapists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        specialties TEXT,
        experience_years INTEGER,
        hourly_rate DECIMAL(10,2),
        bio TEXT,
        location TEXT,
        availability TEXT,
        rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        profile_image TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      -- Services table
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        category TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        therapist_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        duration INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
        payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users (id),
        FOREIGN KEY (therapist_id) REFERENCES therapists (id),
        FOREIGN KEY (service_id) REFERENCES services (id)
      );

      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        therapist_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings (id),
        FOREIGN KEY (client_id) REFERENCES users (id),
        FOREIGN KEY (therapist_id) REFERENCES therapists (id)
      );
    `

    db.exec(schema, (err) => {
      if (err) {
        reject(err)
      } else {
        console.log("✅ Database tables created")
        resolve()
      }
    })
  })
}

// Insert sample data
const insertSampleData = async () => {
  console.log("📝 Inserting sample data...")

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Insert users
  const users = [
    [1, "admin@analyn.com", hashedPassword, "Admin", "User", "+63917123456", "admin"],
    [2, "maria.santos@analyn.com", hashedPassword, "Maria", "Santos", "+63917234567", "therapist"],
    [3, "john.dela.cruz@analyn.com", hashedPassword, "John", "Dela Cruz", "+63917345678", "therapist"],
    [4, "anna.reyes@analyn.com", hashedPassword, "Anna", "Reyes", "+63917456789", "therapist"],
    [5, "client@analyn.com", hashedPassword, "Test", "Client", "+63917567890", "client"],
  ]

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password, first_name, last_name, phone, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  users.forEach((user) => {
    insertUser.run(user)
  })
  insertUser.finalize()

  // Insert therapists
  const therapists = [
    [
      1,
      2,
      "Swedish Massage, Deep Tissue, Hot Stone",
      5,
      2500.0,
      "Experienced massage therapist specializing in relaxation and therapeutic treatments.",
      "Makati City, Metro Manila",
      "Mon-Fri 9AM-6PM",
      4.8,
      127,
      "/professional-female-therapist.png",
      1,
    ],
    [
      2,
      3,
      "Sports Massage, Deep Tissue, Trigger Point",
      8,
      3000.0,
      "Sports massage specialist with extensive experience working with athletes.",
      "BGC, Taguig",
      "Mon-Sat 8AM-8PM",
      4.9,
      89,
      "/male-therapist.png",
      1,
    ],
    [
      3,
      4,
      "Aromatherapy, Swedish, Prenatal Massage",
      3,
      2200.0,
      "Gentle and caring therapist specializing in aromatherapy and prenatal care.",
      "Quezon City",
      "Tue-Sun 10AM-7PM",
      4.7,
      156,
      "/asian-female-therapist.png",
      1,
    ],
  ]

  const insertTherapist = db.prepare(`
    INSERT OR REPLACE INTO therapists (id, user_id, specialties, experience_years, hourly_rate, bio, location, availability, rating, total_reviews, profile_image, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  therapists.forEach((therapist) => {
    insertTherapist.run(therapist)
  })
  insertTherapist.finalize()

  // Insert services
  const services = [
    [
      1,
      "Swedish Massage",
      "A gentle, relaxing massage using long strokes and kneading techniques.",
      60,
      2500.0,
      "Relaxation",
      "/relaxing-swedish-massage.png",
      1,
    ],
    [
      2,
      "Deep Tissue Massage",
      "Therapeutic massage targeting deeper muscle layers and connective tissue.",
      60,
      3000.0,
      "Therapeutic",
      "/deep-tissue-massage.png",
      1,
    ],
    [
      3,
      "Hot Stone Massage",
      "Relaxing massage using heated stones to ease muscle tension.",
      90,
      3500.0,
      "Relaxation",
      "/hot-stone-massage.png",
      1,
    ],
    [
      4,
      "Aromatherapy Massage",
      "Therapeutic massage combined with essential oils for relaxation.",
      75,
      2800.0,
      "Relaxation",
      "/aromatherapy-massage-oils.png",
      1,
    ],
    [
      5,
      "Sports Massage",
      "Specialized massage for athletes and active individuals.",
      60,
      3200.0,
      "Therapeutic",
      "/wellness-massage-therapy.png",
      1,
    ],
    [
      6,
      "Prenatal Massage",
      "Gentle massage designed specifically for pregnant women.",
      60,
      2600.0,
      "Specialized",
      "/wellness-massage-therapy.png",
      1,
    ],
  ]

  const insertService = db.prepare(`
    INSERT OR REPLACE INTO services (id, name, description, duration, base_price, category, image_url, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  services.forEach((service) => {
    insertService.run(service)
  })
  insertService.finalize()

  // Insert sample bookings
  const bookings = [
    [1, 5, 1, 1, "2024-12-25", "14:00", 60, 2500.0, "confirmed", "paid", "First time client, prefers medium pressure"],
    [2, 5, 2, 2, "2024-12-26", "10:00", 60, 3000.0, "pending", "pending", "Sports massage for shoulder tension"],
    [3, 5, 3, 4, "2024-12-27", "16:00", 75, 2800.0, "confirmed", "paid", "Aromatherapy with lavender oil preferred"],
  ]

  const insertBooking = db.prepare(`
    INSERT OR REPLACE INTO bookings (id, client_id, therapist_id, service_id, booking_date, booking_time, duration, total_amount, status, payment_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  bookings.forEach((booking) => {
    insertBooking.run(booking)
  })
  insertBooking.finalize()

  // Insert sample reviews
  const reviews = [
    [1, 1, 5, 1, 5, "Amazing massage! Maria was very professional and the Swedish massage was exactly what I needed."],
    [2, 3, 5, 3, 4, "Great aromatherapy session. Anna created a very relaxing atmosphere."],
  ]

  const insertReview = db.prepare(`
    INSERT OR REPLACE INTO reviews (id, booking_id, client_id, therapist_id, rating, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  reviews.forEach((review) => {
    insertReview.run(review)
  })
  insertReview.finalize()

  console.log("✅ Sample data inserted")
}

// Main setup function
const setupDatabase = async () => {
  try {
    await createTables()
    await insertSampleData()

    console.log("🎉 Database setup complete!")
    console.log("")
    console.log("🧪 Test accounts created:")
    console.log("Admin: admin@analyn.com / password123")
    console.log("Therapist: maria.santos@analyn.com / password123")
    console.log("Client: client@analyn.com / password123")
    console.log("")
    console.log('🚀 Run "npm run dev" to start the application')
  } catch (error) {
    console.error("❌ Error setting up database:", error)
  } finally {
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message)
      } else {
        console.log("✅ Database connection closed")
      }
    })
  }
}

setupDatabase()
