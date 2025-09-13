-- Insert admin user
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('admin@analyn.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'Admin', 'User', '+63917123456', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert therapist users
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('maria.santos@analyn.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'Maria', 'Santos', '+63917234567', 'therapist'),
('john.dela.cruz@analyn.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'John', 'Dela Cruz', '+63917345678', 'therapist'),
('anna.reyes@analyn.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'Anna', 'Reyes', '+63917456789', 'therapist')
ON CONFLICT (email) DO NOTHING;

-- Insert client user
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES
('client@analyn.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'Test', 'Client', '+63917567890', 'client')
ON CONFLICT (email) DO NOTHING;

-- Insert therapist profiles
INSERT INTO therapists (user_id, specialties, experience, rating, hourly_rate, bio, location, profile_image, verified) VALUES
((SELECT id FROM users WHERE email = 'maria.santos@analyn.com'), 
 ARRAY['Swedish Massage', 'Deep Tissue', 'Hot Stone'], 
 5, 4.8, 1500.00, 
 'Certified massage therapist with 5 years of experience specializing in therapeutic and relaxation massage techniques.',
 'Makati City', '/professional-female-therapist.png', true),

((SELECT id FROM users WHERE email = 'john.dela.cruz@analyn.com'), 
 ARRAY['Sports Massage', 'Deep Tissue', 'Trigger Point'], 
 7, 4.9, 1800.00, 
 'Licensed physical therapist and sports massage specialist. Helping athletes and active individuals recover and perform better.',
 'BGC, Taguig', '/male-therapist.png', true),

((SELECT id FROM users WHERE email = 'anna.reyes@analyn.com'), 
 ARRAY['Aromatherapy', 'Swedish Massage', 'Prenatal Massage'], 
 3, 4.7, 1400.00, 
 'Holistic wellness practitioner specializing in aromatherapy and prenatal care. Creating peaceful healing experiences.',
 'Ortigas, Pasig', '/asian-female-therapist.png', true)
ON CONFLICT DO NOTHING;

-- Insert services
INSERT INTO services (name, description, duration, price, category, image) VALUES
('Swedish Massage', 'Classic relaxation massage using long, flowing strokes to promote relaxation and improve circulation.', 60, 1500.00, 'Relaxation', '/relaxing-swedish-massage.png'),
('Deep Tissue Massage', 'Therapeutic massage targeting deeper layers of muscle and connective tissue to relieve chronic tension.', 90, 2200.00, 'Therapeutic', '/deep-tissue-massage.png'),
('Hot Stone Massage', 'Luxurious massage using heated stones to melt away tension and promote deep relaxation.', 75, 2000.00, 'Luxury', '/hot-stone-massage.png'),
('Aromatherapy Massage', 'Relaxing massage combined with essential oils to enhance both physical and emotional well-being.', 60, 1800.00, 'Holistic', '/aromatherapy-massage-oils.png'),
('Sports Massage', 'Specialized massage for athletes focusing on injury prevention and performance enhancement.', 60, 1700.00, 'Sports', '/wellness-massage-therapy.png'),
('Prenatal Massage', 'Gentle, safe massage designed specifically for expecting mothers to relieve pregnancy discomfort.', 60, 1600.00, 'Specialized', '/wellness-massage-therapy.png')
ON CONFLICT DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (client_id, therapist_id, service_id, scheduled_at, duration, total_amount, status, payment_status, notes) VALUES
((SELECT id FROM users WHERE email = 'client@analyn.com'),
 (SELECT id FROM therapists WHERE user_id = (SELECT id FROM users WHERE email = 'maria.santos@analyn.com')),
 (SELECT id FROM services WHERE name = 'Swedish Massage'),
 '2024-01-15 14:00:00', 60, 1500.00, 'completed', 'paid', 'First time client, prefers medium pressure'),

((SELECT id FROM users WHERE email = 'client@analyn.com'),
 (SELECT id FROM therapists WHERE user_id = (SELECT id FROM users WHERE email = 'john.dela.cruz@analyn.com')),
 (SELECT id FROM services WHERE name = 'Deep Tissue Massage'),
 '2024-01-20 10:00:00', 90, 2200.00, 'confirmed', 'paid', 'Focus on lower back and shoulders'),

((SELECT id FROM users WHERE email = 'client@analyn.com'),
 (SELECT id FROM therapists WHERE user_id = (SELECT id FROM users WHERE email = 'anna.reyes@analyn.com')),
 (SELECT id FROM services WHERE name = 'Aromatherapy Massage'),
 '2024-01-25 16:00:00', 60, 1800.00, 'pending', 'pending', 'Lavender essential oil preferred')
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (booking_id, client_id, therapist_id, rating, comment) VALUES
((SELECT id FROM bookings WHERE status = 'completed' LIMIT 1),
 (SELECT id FROM users WHERE email = 'client@analyn.com'),
 (SELECT id FROM therapists WHERE user_id = (SELECT id FROM users WHERE email = 'maria.santos@analyn.com')),
 5, 'Amazing massage! Maria was very professional and the Swedish massage was exactly what I needed to relax.')
ON CONFLICT DO NOTHING;
