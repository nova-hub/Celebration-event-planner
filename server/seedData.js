const { seedData } = require('./database');

function getSampleData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Dates relative to today
  const addDays = (d) => {
    const target = new Date(now);
    target.setDate(target.getDate() + d);
    return target.toISOString().split('T')[0];
  };

  const events = [
    {
      id: 'ev-wedding-01',
      title: 'Elena & Marcus Luxe Garden Wedding',
      category: 'wedding',
      date: addDays(14),
      time: '16:30',
      venue: 'The Grand Wisteria Pavilion & Conservatory, Napa Valley',
      description: 'An elegant twilight wedding ceremony followed by a black-tie champagne dinner, live jazz quartet, and floral installation under the stars.',
      targetBudget: 18500,
      coverTheme: 'purple-pink',
      status: 'planning',
      themeColor: '#ec4899',
      notes: 'Dress code: Midnight black-tie with botanical accents. Valet service arranged.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ev-birthday-02',
      title: 'Julian’s 30th Neon & Velvet Birthday Soiree',
      category: 'birthday',
      date: addDays(6),
      time: '20:00',
      venue: 'Skyline Glass Penthouse Loft, Downtown',
      description: 'Celebrating the big 3-0 with custom craft cocktails, DJ set, customized dessert bar, and interactive photo booth.',
      targetBudget: 4500,
      coverTheme: 'purple',
      status: 'confirmed',
      themeColor: '#a855f7',
      notes: 'Surprise video tribute planned at 21:30! Signature cocktail: Violet Mirage.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ev-anniversary-03',
      title: 'Golden 25th Silver-Luxe Wedding Anniversary',
      category: 'anniversary',
      date: addDays(28),
      time: '18:00',
      venue: 'Château Belleview Ballroom & Terrace',
      description: 'Renewing vows and celebrating 25 years of devotion with close family and lifelong friends over a 5-course gourmet tasting menu.',
      targetBudget: 9000,
      coverTheme: 'soft-pink',
      status: 'planning',
      themeColor: '#f472b6',
      notes: 'Archival family slide show to be projected on the grand marble fireplace.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ev-party-04',
      title: 'Obsidian Midnight Rooftop Masquerade Party',
      category: 'party',
      date: addDays(35),
      time: '21:00',
      venue: 'Nebula Rooftop Lounge & Solarium',
      description: 'An immersive Venetian masquerade evening with dramatic lighting, deep house music, illuminated ice sculptures, and champagne fountains.',
      targetBudget: 6200,
      coverTheme: 'purple-pink',
      status: 'planning',
      themeColor: '#c084fc',
      notes: 'Masks mandatory at entrance. Glow wristbands for VIP balcony.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const expenses = [
    // Wedding expenses
    {
      id: 'exp-w-1',
      eventId: 'ev-wedding-01',
      title: 'Venue Rental & Glass Marquee',
      category: 'Venue',
      amount: 6500,
      status: 'paid',
      date: addDays(-10),
      notes: 'Deposit and full day reservation confirmed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-w-2',
      eventId: 'ev-wedding-01',
      title: 'Fine Dining Catering & French Champagne',
      category: 'Catering',
      amount: 5200,
      status: 'pending',
      date: addDays(10),
      notes: '5-course plated dinner for 85 guests',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-w-3',
      eventId: 'ev-wedding-01',
      title: 'Luxe Floral Arch & Table Centerpieces',
      category: 'Decor',
      amount: 2800,
      status: 'paid',
      date: addDays(-3),
      notes: 'Fresh orchids, white wisteria, and blush roses',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-w-4',
      eventId: 'ev-wedding-01',
      title: 'Master Photographer & Cinematic Drone Video',
      category: 'Photography',
      amount: 2400,
      status: 'pending',
      date: addDays(14),
      notes: '10 hours coverage + raw 4k footage',
      createdAt: new Date().toISOString()
    },

    // Birthday expenses
    {
      id: 'exp-b-1',
      eventId: 'ev-birthday-02',
      title: 'Skyline Penthouse Venue Fee',
      category: 'Venue',
      amount: 1800,
      status: 'paid',
      date: addDays(-5),
      notes: 'Includes rooftop access and cleaning fee',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-b-2',
      eventId: 'ev-birthday-02',
      title: 'Custom 3-Tier Obsidian & Violet Cake',
      category: 'Cake',
      amount: 450,
      status: 'paid',
      date: addDays(-2),
      notes: 'Salted caramel & dark chocolate truffle',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-b-3',
      eventId: 'ev-birthday-02',
      title: 'Live DJ & Club Sound Rig',
      category: 'Entertainment',
      amount: 950,
      status: 'pending',
      date: addDays(5),
      notes: 'Sound equipment & lighting package included',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-b-4',
      eventId: 'ev-birthday-02',
      title: 'Mixologist & Premium Spirits Bar',
      category: 'Catering',
      amount: 1100,
      status: 'pending',
      date: addDays(6),
      notes: 'Custom mocktails + cocktail menu',
      createdAt: new Date().toISOString()
    },

    // Anniversary expenses
    {
      id: 'exp-a-1',
      eventId: 'ev-anniversary-03',
      title: 'Château Ballroom Booking',
      category: 'Venue',
      amount: 3800,
      status: 'paid',
      date: addDays(-12),
      notes: 'Historic estate private garden access',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-a-2',
      eventId: 'ev-anniversary-03',
      title: 'Acoustic Cello & Violin Duo',
      category: 'Entertainment',
      amount: 1200,
      status: 'pending',
      date: addDays(20),
      notes: 'Classical & romantic pop arrangements',
      createdAt: new Date().toISOString()
    },

    // Party expenses
    {
      id: 'exp-p-1',
      eventId: 'ev-party-04',
      title: 'Nebula Rooftop Exclusive Rental',
      category: 'Venue',
      amount: 3200,
      status: 'paid',
      date: addDays(-7),
      notes: 'Security staff included',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-p-2',
      eventId: 'ev-party-04',
      title: 'Laser Lighting & Fog Visual Effects',
      category: 'Decor',
      amount: 1400,
      status: 'pending',
      date: addDays(30),
      notes: 'Includes light operator for the night',
      createdAt: new Date().toISOString()
    }
  ];

  const guests = [
    // Wedding guests
    {
      id: 'gst-w-1',
      eventId: 'ev-wedding-01',
      name: 'Victoria Hawthorne',
      email: 'victoria.h@luxe.org',
      phone: '+1 (555) 234-8901',
      rsvpStatus: 'attending',
      plusOnes: 1,
      dietaryRestrictions: 'Gluten-Free',
      tableGroup: 'Table 1 - Family VIP',
      invitationSent: true,
      notes: 'Maid of honor',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gst-w-2',
      eventId: 'ev-wedding-01',
      name: 'Alexander Sterling',
      email: 'alex.sterling@apex.io',
      phone: '+1 (555) 345-6789',
      rsvpStatus: 'attending',
      plusOnes: 1,
      dietaryRestrictions: 'Vegetarian',
      tableGroup: 'Table 1 - Family VIP',
      invitationSent: true,
      notes: 'Best man',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gst-w-3',
      eventId: 'ev-wedding-01',
      name: 'Dr. Evelyn Chen',
      email: 'evelyn.chen@hospital.org',
      phone: '+1 (555) 890-1234',
      rsvpStatus: 'pending',
      plusOnes: 0,
      dietaryRestrictions: 'None',
      tableGroup: 'Table 3 - University Colleagues',
      invitationSent: true,
      notes: 'Awaiting flight confirmation',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gst-w-4',
      eventId: 'ev-wedding-01',
      name: 'Harrison Brooks',
      email: 'h.brooks@creative.net',
      phone: '+1 (555) 901-2345',
      rsvpStatus: 'declined',
      plusOnes: 0,
      dietaryRestrictions: 'None',
      tableGroup: 'Table 4 - Friends',
      invitationSent: true,
      notes: 'Overseas conference',
      createdAt: new Date().toISOString()
    },

    // Birthday guests
    {
      id: 'gst-b-1',
      eventId: 'ev-birthday-02',
      name: 'Maya Lin',
      email: 'maya.lin@design.co',
      phone: '+1 (555) 456-7890',
      rsvpStatus: 'attending',
      plusOnes: 1,
      dietaryRestrictions: 'Vegan',
      tableGroup: 'Lounge Area A',
      invitationSent: true,
      notes: 'Bringing Polaroid camera for memory book',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gst-b-2',
      eventId: 'ev-birthday-02',
      name: 'Lucas Romero',
      email: 'lucas.r@music.fm',
      phone: '+1 (555) 567-8901',
      rsvpStatus: 'attending',
      plusOnes: 0,
      dietaryRestrictions: 'None',
      tableGroup: 'DJ Booth Section',
      invitationSent: true,
      notes: 'Helping with audio playlist',
      createdAt: new Date().toISOString()
    },
    {
      id: 'gst-b-3',
      eventId: 'ev-birthday-02',
      name: 'Chloe Davenport',
      email: 'chloe.d@studio.com',
      phone: '+1 (555) 678-9012',
      rsvpStatus: 'pending',
      plusOnes: 1,
      dietaryRestrictions: 'Pescatarian',
      tableGroup: 'Lounge Area B',
      invitationSent: true,
      notes: 'Following up this Friday',
      createdAt: new Date().toISOString()
    },

    // Anniversary guests
    {
      id: 'gst-a-1',
      eventId: 'ev-anniversary-03',
      name: 'Grandmother Alice Sterling',
      email: 'alice.sterling@family.com',
      phone: '+1 (555) 789-0123',
      rsvpStatus: 'attending',
      plusOnes: 0,
      dietaryRestrictions: 'Low Sodium',
      tableGroup: 'Honorary Table',
      invitationSent: true,
      notes: 'Wheelchair access requested at entrance',
      createdAt: new Date().toISOString()
    },

    // Party guests
    {
      id: 'gst-p-1',
      eventId: 'ev-party-04',
      name: 'Zane Vance',
      email: 'zane.vance@tech.co',
      phone: '+1 (555) 890-4321',
      rsvpStatus: 'attending',
      plusOnes: 2,
      dietaryRestrictions: 'None',
      tableGroup: 'VIP Table 1',
      invitationSent: true,
      notes: 'VIP Pass holder',
      createdAt: new Date().toISOString()
    }
  ];

  const tasks = [
    // Wedding tasks
    {
      id: 'tsk-w-1',
      eventId: 'ev-wedding-01',
      title: 'Finalize seating chart & table namecards',
      category: 'Invitations',
      dueDate: addDays(4),
      priority: 'high',
      completed: true,
      assignedTo: 'Elena',
      notes: 'Printed on soft rose gold cardstock',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-w-2',
      eventId: 'ev-wedding-01',
      title: 'Confirm floral delivery and arch setup timing',
      category: 'Decor',
      dueDate: addDays(7),
      priority: 'high',
      completed: false,
      assignedTo: 'Marcus',
      notes: 'Florist arriving at 11:00 AM on wedding day',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-w-3',
      eventId: 'ev-wedding-01',
      title: 'Send final headcount to caterer and confirm vegan meals',
      category: 'Food & Drink',
      dueDate: addDays(8),
      priority: 'high',
      completed: false,
      assignedTo: 'Elena',
      notes: 'Need 85 plates + 4 vendor meals',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-w-4',
      eventId: 'ev-wedding-01',
      title: 'Schedule final dress and tuxedo fitting',
      category: 'Attire',
      dueDate: addDays(2),
      priority: 'medium',
      completed: true,
      assignedTo: 'Elena & Marcus',
      notes: 'Both outfits pressed and ready',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-w-5',
      eventId: 'ev-wedding-01',
      title: 'Prepare wedding favors & custom thank-you candles',
      category: 'General',
      dueDate: addDays(10),
      priority: 'low',
      completed: false,
      assignedTo: 'Victoria (Maid of Honor)',
      notes: 'Lavender & vanilla hand-poured candles',
      createdAt: new Date().toISOString()
    },

    // Birthday tasks
    {
      id: 'tsk-b-1',
      eventId: 'ev-birthday-02',
      title: 'Pick up 3-tier cake from patisserie at 2 PM',
      category: 'Food & Drink',
      dueDate: addDays(6),
      priority: 'high',
      completed: false,
      assignedTo: 'Maya',
      notes: 'Keep cake refrigerated until 21:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-b-2',
      eventId: 'ev-birthday-02',
      title: 'Send digital DJ playlist & song blacklists',
      category: 'Entertainment',
      dueDate: addDays(3),
      priority: 'medium',
      completed: true,
      assignedTo: 'Julian',
      notes: '90s R&B, modern disco house, synthwave',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-b-3',
      eventId: 'ev-birthday-02',
      title: 'Test photo booth lighting & backdrop setup',
      category: 'General',
      dueDate: addDays(5),
      priority: 'medium',
      completed: false,
      assignedTo: 'Lucas',
      notes: 'Neon sign: "Forever 30 & Fabulous"',
      createdAt: new Date().toISOString()
    },

    // Anniversary tasks
    {
      id: 'tsk-a-1',
      eventId: 'ev-anniversary-03',
      title: 'Compile 25-year family photo slideshow and video',
      category: 'Entertainment',
      dueDate: addDays(15),
      priority: 'medium',
      completed: false,
      assignedTo: 'Daughter Sarah',
      notes: 'Format into 1080p MP4 file on flash drive',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tsk-a-2',
      eventId: 'ev-anniversary-03',
      title: 'Finalize wine pairing with sommelier',
      category: 'Food & Drink',
      dueDate: addDays(20),
      priority: 'high',
      completed: false,
      assignedTo: 'Marcus',
      notes: 'Select 1999 vintage champagne toast',
      createdAt: new Date().toISOString()
    },

    // Party tasks
    {
      id: 'tsk-p-1',
      eventId: 'ev-party-04',
      title: 'Order 150 Venetian masquerade masks for guest arrivals',
      category: 'Decor',
      dueDate: addDays(12),
      priority: 'high',
      completed: true,
      assignedTo: 'Zane',
      notes: 'Delivered and inspected',
      createdAt: new Date().toISOString()
    }
  ];

  return { events, expenses, guests, tasks };
}

function loadInitialSeed(force = false) {
  const fs = require('fs');
  const path = require('path');
  const DATA_FILE = path.join(__dirname, '..', 'data', 'events.json');

  if (force || !fs.existsSync(DATA_FILE)) {
    const data = getSampleData();
    seedData(data);
    console.log('Sample celebration data seeded successfully!');
    return data;
  }
  return null;
}

module.exports = {
  getSampleData,
  loadInitialSeed
};
