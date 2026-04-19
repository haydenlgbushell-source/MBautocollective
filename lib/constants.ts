export const BUSINESS = {
  name: 'MB Auto Collective',
  director: 'Matt',
  phone: '0400 003 994',
  phoneHref: 'tel:+61400003994',
  whatsappHref: 'https://wa.me/61400003994',
  email: 'matt@mbautocollective.com',
  address: '1/267 Young Street, Waterloo NSW 2017',
  mapsUrl: 'https://maps.app.goo.gl/4UTj9iU3cf6JrDpr5',
  abn: '44 637 706 953',
  licence: 'MD081672',
  reviewCount: 126,
  reviewScore: '5.0',
  tagline: 'Buy. Sell. Drive.',
  domain: 'mbautocollective.com',
  siteUrl: 'https://mbautocollective.com',
} as const;

export const GOOGLE_REVIEWS = [
  {
    text: "Couldn't speak more highly of the service Matt offers. Knows the business inside out and stopped at nothing until we found the car we were after.",
    author: 'Edward Simpson',
    stars: 5,
  },
  {
    text: "Matt has been fantastic from start to finish. I thought customer service wasn't a thing anymore but these guys go above and beyond.",
    author: 'William Killen',
    stars: 5,
  },
  {
    text: 'I had an amazing experience from start to finish with Matt. He was welcoming, professional, and very knowledgeable. All their cars look in showroom condition.',
    author: 'Vince Rocs',
    stars: 5,
  },
  {
    text: "The best car buying experience ever. Matt was beyond helpful and none of my questions were too dumb. I love my car!",
    author: 'Sheona Devin',
    stars: 5,
  },
  {
    text: 'Purchased a Cupra and had it sent to Perth. Matt made the whole process super simple. Car arrived just as good as promised.',
    author: 'Kyle',
    stars: 5,
  },
  {
    text: 'Matt made the experience so easy. A one stop shop and a five star service. I would recommend MB Auto Collective to anyone.',
    author: 'Brian Meadows',
    stars: 5,
  },
] as const;

export const BODY_TYPES = ['Sedan', 'SUV', 'Coupé', 'Convertible', 'Wagon', 'Hatchback', 'Ute'] as const;
export const TRANSMISSIONS = ['Automatic', 'Manual'] as const;
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;
export const STATUSES = ['available', 'reserved', 'sold'] as const;

export const STANDARD_FEATURES: { category: string; features: string[] }[] = [
  {
    category: 'Safety',
    features: [
      'Adaptive Cruise Control',
      'Autonomous Emergency Braking',
      'Blind Spot Monitoring',
      'Cross Traffic Alert',
      'Curtain Airbags',
      'Dual Front Airbags',
      'Driver Knee Airbag',
      'Hill Descent Control',
      'Hill Start Assist',
      'Lane Keeping Assist',
      'Park Assist (Front & Rear)',
      'Rear Collision Warning',
      'Side Airbags',
      'Traffic Jam Assist',
      'Traffic Sign Recognition',
      'Tyre Pressure Monitoring',
    ],
  },
  {
    category: 'Technology',
    features: [
      'Apple CarPlay',
      'Android Auto',
      'Bluetooth',
      'DAB Digital Radio',
      'Digital Instrument Cluster',
      'Navigation System',
      'Premium Sound System',
      'Remote Start',
      'Reversing Camera',
      'Surround View Camera',
      'Touchscreen Infotainment',
      'USB Ports',
      'Voice Recognition',
      'Wireless Charging',
      'Telematics',
    ],
  },
  {
    category: 'Comfort & Convenience',
    features: [
      'Auto Climate Control',
      'Dual Zone Climate Control',
      'Heated Front Seats',
      'Heated Rear Seats',
      'Heated Steering Wheel',
      'Keyless Entry',
      'Power Driver Seat',
      'Power Passenger Seat',
      'Driver Memory Seat',
      'Power Lumbar Support (Driver)',
      'Power Lumbar Support (Passenger)',
      'Power Tailgate',
      'Rain Sensing Wipers',
      'Ventilated Front Seats',
    ],
  },
  {
    category: 'Exterior & Wheels',
    features: [
      '18 Inch Alloy Wheels',
      '19 Inch Alloy Wheels',
      '20 Inch Alloy Wheels',
      '21 Inch Alloy Wheels',
      'LED Headlights',
      'LED Tail Lights',
      'Power Folding Mirrors',
      'Roof Rails',
      'Sunroof',
      'Panoramic Sunroof',
      'Tow Bar Preparation',
    ],
  },
];
