/**
 * Heritage Location Configuration
 * Defines all Smart Heritage Canopies pilot sites in Metro Manila
 */

export const LOCATIONS = {
  luneta: {
    id: 'luneta',
    name: 'Luneta Park',
    displayName: 'Luneta Park (Rizal Park)',
    shortName: 'Luneta',
    coordinates: [120.9794, 14.5826], // [lng, lat]
    zoom: 15.5,
    polygon: [
      [120.9757, 14.5856],
      [120.9820, 14.5870],
      [120.9835, 14.5815],
      [120.9772, 14.5801],
      [120.9757, 14.5856]
    ],
    bounds: {
      minLng: 120.9757,
      maxLng: 120.9835,
      minLat: 14.5801,
      maxLat: 14.5870
    },
    district: 'Ermita, Manila',
    description: 'Luneta Park is a national heritage landscape featuring iconic monuments, cultural venues, and civic spaces. Smart Heritage Canopies aim to protect comfort and walkability while preserving sightlines and historical integrity.',
    highlights: [
      {
        title: 'Globe 5G Network Infrastructure',
        desc: 'High-speed 5G connectivity powers real-time sensor data transmission, enabling instant environmental monitoring and visitor analytics across the entire heritage site.'
      },
      {
        title: 'Rizal Monument',
        desc: 'Central obelisk and statue marking Dr. José Rizal\'s resting place. Preserved sightlines and ambient lighting.'
      },
      {
        title: 'Open-Air Auditorium',
        desc: 'Community events venue with optional canopy shade and adjacent AQ sensing.'
      },
      {
        title: 'Museum Cluster',
        desc: 'National Museum complex perimeter with improved walkability and microclimate nodes.'
      }
    ],
    heritageComponents: [
      {
        title: 'Cooling Canopy',
        img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
        desc: 'Dynamic shade structures that adjust to sun position, providing optimal thermal comfort for visitors throughout the day.'
      },
      {
        title: 'Solar Tree',
        img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=800&fit=crop',
        desc: 'Photovoltaic canopy generating clean energy while providing shade, powering sensors and ambient lighting.'
      },
      {
        title: 'Water Feature',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        desc: 'Evaporative cooling systems integrated with heritage fountains, reducing ambient temperature by 2-3°C.'
      },
      {
        title: 'Garden Walk',
        img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
        desc: 'Native plant corridors with misting systems, enhancing biodiversity while cooling pedestrian pathways.'
      },
      {
        title: 'Pavilion',
        img: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop',
        desc: 'Historic rest pavilions upgraded with smart ventilation and ambient environmental monitoring.'
      },
      {
        title: 'Monument Plaza',
        img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
        desc: 'Open civic space with adaptive shading and crowd comfort analytics for major gatherings.'
      }
    ],
    sensors: [
      {
        title: 'AI-Powered Smart Canopy',
        description: 'This dynamic canopy adjusts its axis in real-time, tracking the sun\'s path to provide maximum shade throughout the day. Integrated sensors continuously gather environmental data via Globe\'s 5G network, transmitting real-time analytics to the central control system.',
        image: 'https://picsum.photos/seed/canopy/1200/700'
      },
      {
        title: 'Air Quality Node',
        description: 'Distributed AQ nodes monitor PM2.5, humidity, and temperature to adapt park ventilation and shade logic. All data streams through Globe\'s ultra-fast 5G infrastructure for instant analysis and response.',
        image: 'https://picsum.photos/seed/aqnode/1200/700'
      },
      {
        title: 'Foot Traffic Vision',
        description: 'Anonymous computer vision counts and directionality support crowd-comfort routing and safety alerts. Globe 5G ensures millisecond-latency data transmission for real-time crowd management.',
        image: 'https://picsum.photos/seed/traffic/1200/700'
      }
    ],
    carouselImages: [
      'https://images.unsplash.com/photo-1555881622-2cdf0ede8e84?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
    ]
  },

  binondo: {
    id: 'binondo',
    name: 'Binondo',
    displayName: 'Binondo Chinatown Heritage District',
    shortName: 'Binondo',
    coordinates: [120.9745, 14.6000],
    zoom: 15.5,
    polygon: [
      [120.9710, 14.6040],
      [120.9780, 14.6050],
      [120.9780, 14.5950],
      [120.9720, 14.5940],
      [120.9710, 14.6040]
    ],
    bounds: {
      minLng: 120.9710,
      maxLng: 120.9780,
      minLat: 14.5940,
      maxLat: 14.6050
    },
    district: 'Binondo, Manila',
    description: 'Binondo, established in 1594, is the world\'s oldest Chinatown and a vibrant commercial heritage district. Smart Heritage Canopies enhance pedestrian comfort along historic commercial corridors while preserving the district\'s cultural character and supporting sustainable urban commerce.',
    highlights: [
      {
        title: 'Globe 5G Smart District Network',
        desc: 'Globe\'s 5G infrastructure powers a mesh network of IoT sensors across Binondo\'s commercial corridors, enabling real-time foot traffic analytics, air quality monitoring, and smart canopy coordination.'
      },
      {
        title: 'Ongpin Street',
        desc: 'Historic commercial spine with traditional shophouses. Smart canopies provide shade while maintaining street character.'
      },
      {
        title: 'Binondo Church',
        desc: 'Minor Basilica of San Lorenzo Ruiz plaza with heritage-sensitive cooling and visitor comfort monitoring.'
      },
      {
        title: 'Escolta Street',
        desc: 'Art Deco heritage buildings with adaptive shading for renewed pedestrian activity and cultural events.'
      }
    ],
    heritageComponents: [
      {
        title: 'Market Canopy',
        img: 'https://images.unsplash.com/photo-1555881622-2cdf0ede8e84?w=1200&h=800&fit=crop',
        desc: 'Modular shade structures over traditional wet markets, improving vendor and customer comfort during peak trading hours.'
      },
      {
        title: 'Street Corridor Shade',
        img: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=800&fit=crop',
        desc: 'Retractable canopy systems along narrow commercial streets, balancing shade provision with historic facades.'
      },
      {
        title: 'Heritage Plaza Cooling',
        img: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=1200&h=800&fit=crop',
        desc: 'Church plaza misting systems activated during festivals and high-temperature events.'
      },
      {
        title: 'Solar Streetlight',
        img: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&h=800&fit=crop',
        desc: 'Heritage-style lamp posts with integrated solar panels and environmental sensors for safety and monitoring.'
      },
      {
        title: 'Food Street Pavilion',
        img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop',
        desc: 'Outdoor dining areas with smart ventilation and temperature control supporting culinary tourism.'
      },
      {
        title: 'Cultural Center',
        img: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=1200&h=800&fit=crop',
        desc: 'Community cultural spaces with adaptive climate control for year-round programming.'
      }
    ],
    sensors: [
      {
        title: 'Commercial Activity Monitor',
        description: 'Foot traffic analytics support business district planning while respecting privacy. Anonymized counts help optimize shade deployment during peak shopping hours. Globe 5G network ensures real-time data streaming from all monitoring points.',
        image: '/renders/binondo/binondo4.png'
      },
      {
        title: 'Heritage Climate Node',
        description: 'Discrete environmental sensors mounted on heritage structures monitor microclimate without visual intrusion. All sensor data is transmitted instantly via Globe\'s 5G infrastructure for coordinated climate control responses.',
        image: '/renders/binondo/binondo5.png'
      },
      {
        title: 'Street-Level AQ Station',
        description: 'Air quality monitoring at pedestrian height tracks pollution from vehicle traffic, informing ventilation strategies. Globe 5G enables continuous, high-bandwidth data transmission for comprehensive air quality mapping.',
        image: '/renders/binondo/binondo6.png'
      },
      {
        title: 'Smart Heritage Canopy',
        description: 'Integrated L.I.L.O.M units provide shade, environmental monitoring, and visitor comfort throughout the heritage district. Powered by Globe 5G for seamless IoT connectivity and edge computing capabilities.',
        image: '/renders/binondo/binondo7.png'
      },
      {
        title: 'Urban Microclimate Network',
        description: 'Distributed sensors create a comprehensive environmental monitoring network across the heritage commercial zone. Globe\'s 5G network backbone enables synchronized multi-sensor data fusion and predictive analytics.',
        image: '/renders/binondo/binondo8.png'
      },
      {
        title: 'Heritage Integration System',
        description: 'Technology seamlessly blends with historic architecture to enhance visitor experience without compromising cultural character. Globe 5G infrastructure powers invisible connectivity with minimal visual impact.',
        image: '/renders/binondo/binondo9.png'
      }
    ],
    carouselImages: [
      '/renders/binondo/binondo1.png',
      '/renders/binondo/binondo2.png',
      '/renders/binondo/binondo3.png'
    ]
  },

  intramuros: {
    id: 'intramuros',
    name: 'Intramuros',
    displayName: 'Intramuros Walled City',
    shortName: 'Intramuros',
    coordinates: [120.9750, 14.5890],
    zoom: 15.5,
    polygon: [
      [120.9710, 14.5930],
      [120.9790, 14.5940],
      [120.9800, 14.5840],
      [120.9720, 14.5830],
      [120.9710, 14.5930]
    ],
    bounds: {
      minLng: 120.9710,
      maxLng: 120.9800,
      minLat: 14.5830,
      maxLat: 14.5940
    },
    district: 'Intramuros, Manila',
    description: 'Intramuros, the historic walled city built in 1571, represents Spanish colonial heritage in the Philippines. Smart Heritage Canopies balance archaeological preservation with visitor comfort, supporting sustainable heritage tourism while protecting UNESCO-endorsed structures and maintaining historical sight lines.',
    highlights: [
      {
        title: 'Globe 5G Heritage Network',
        desc: 'Globe\'s 5G infrastructure provides ultra-reliable connectivity for heritage conservation sensors, tourist comfort systems, and archaeological site monitoring while respecting the historic character of the walled city.'
      },
      {
        title: 'Fort Santiago',
        desc: 'Spanish citadel with strategic shading along visitor paths and climate monitoring for artifact preservation.'
      },
      {
        title: 'Manila Cathedral',
        desc: 'Baroque cathedral plaza with heritage-sensitive cooling for religious and cultural gatherings.'
      },
      {
        title: 'San Agustin Church',
        desc: 'UNESCO World Heritage site with microclimate monitoring supporting conservation efforts.'
      }
    ],
    heritageComponents: [
      {
        title: 'Fortress Wall Shade',
        img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=1200&h=800&fit=crop',
        desc: 'Minimal-impact shade structures along historic walls, protecting visitors without obscuring centuries-old stone.'
      },
      {
        title: 'Courtyard Pavilion',
        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop',
        desc: 'Temporary canopies in historic courtyards, deployable for events while respecting architectural heritage.'
      },
      {
        title: 'Plaza Cooling Station',
        img: 'https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=1200&h=800&fit=crop',
        desc: 'Misting systems in major plazas activated during peak tourist hours and religious processions.'
      },
      {
        title: 'Archaeological Shelter',
        img: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=1200&h=800&fit=crop',
        desc: 'Climate-controlled protective canopies over excavation sites, extending research season comfort.'
      },
      {
        title: 'Heritage Trail Markers',
        img: 'https://images.unsplash.com/photo-1566408669687-9e4867e26f5b?w=1200&h=800&fit=crop',
        desc: 'Solar-powered interpretive stations with integrated shade and rest areas along heritage walking routes.'
      },
      {
        title: 'Garden Promenade',
        img: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1200&h=800&fit=crop',
        desc: 'Restored colonial gardens with native plantings and adaptive irrigation supporting urban biodiversity.'
      }
    ],
    sensors: [
      {
        title: 'Heritage Conservation Monitor',
        description: 'Multi-sensor arrays track temperature, humidity, and structural vibration to support preventive conservation of UNESCO heritage structures. Globe 5G network enables real-time alerts for critical conservation parameters.',
        image: '/renders/intramuros/intramuros4.png'
      },
      {
        title: 'Tourist Comfort Analytics',
        description: 'Visitor flow and comfort metrics optimize tour routing and shade deployment for sustainable heritage tourism. Powered by Globe 5G for instant crowd analytics and dynamic route guidance.',
        image: '/renders/intramuros/intramuros3.png'
      }
    ],
    carouselImages: [
      '/renders/intramuros/intramuros1.png',
      '/renders/intramuros/intramuros2.png',
      '/renders/intramuros/intramuros5.png'
    ]
  },

  pasigRiver: {
    id: 'pasigRiver',
    name: 'Pasig River',
    displayName: 'Pasig River Esplanade',
    shortName: 'Pasig River',
    coordinates: [120.9860, 14.5950],
    zoom: 14.5,
    polygon: [
      [120.9780, 14.6000],
      [120.9950, 14.6020],
      [120.9950, 14.5880],
      [120.9780, 14.5900],
      [120.9780, 14.6000]
    ],
    bounds: {
      minLng: 120.9780,
      maxLng: 120.9950,
      minLat: 14.5880,
      maxLat: 14.6020
    },
    district: 'Manila-Makati Corridor',
    description: 'The Pasig River, historically Manila\'s lifeline, is undergoing ecological restoration. Smart Heritage Canopies along the esplanade enhance riverfront accessibility, support active mobility tracking, and create comfortable public spaces that reconnect communities with their river heritage.',
    highlights: [
      {
        title: 'Globe 5G Riverfront Network',
        desc: 'Globe\'s 5G connectivity powers an integrated waterfront monitoring system, transmitting real-time environmental data, weather conditions, active mobility analytics, and visitor safety information to enhance public engagement.'
      },
      {
        title: 'Escolta Pier',
        desc: 'Historic ferry landing revitalized with shade pavilions and real-time transportation displays for river tourism and ferry commuters.'
      },
      {
        title: 'Lawton Esplanade',
        desc: 'Linear waterfront park with cooling canopies and environmental education stations about river ecology.'
      },
      {
        title: 'Jones Bridge',
        desc: 'Heritage bridge approaches with pedestrian comfort zones and historical interpretation about river commerce.'
      }
    ],
    heritageComponents: [
      {
        title: 'Waterfront Pavilion',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        desc: 'Elevated viewing platforms with integrated shade, offering panoramic river views while providing smart lighting and public WiFi connectivity.'
      },
      {
        title: 'Esplanade Canopy Walk',
        img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
        desc: 'Continuous shade corridor along riverfront jogging paths, encouraging active recreation at all hours.'
      },
      {
        title: 'Ferry Terminal Shade',
        img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop',
        desc: 'Smart waiting areas at ferry stops with real-time transit info and climate control for commuter comfort.'
      },
      {
        title: 'Ecology Learning Garden',
        img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=800&fit=crop',
        desc: 'Educational gardens demonstrating riparian restoration with native plants and stormwater management.'
      },
      {
        title: 'Riverside Event Plaza',
        img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=800&fit=crop',
        desc: 'Multipurpose civic space with deployable canopies for cultural festivals and environmental awareness events.'
      },
      {
        title: 'Fishing Heritage Node',
        img: 'https://images.unsplash.com/photo-1445962125599-30f582ac21f4?w=1200&h=800&fit=crop',
        desc: 'Historic fishing community support areas with shade and water access, honoring traditional river livelihoods.'
      }
    ],
    sensors: [
      {
        title: 'Smart Lighting & Safety Monitor',
        description: 'Intelligent streetlight systems with integrated security cameras monitor the esplanade for public safety. Globe 5G network enables real-time video analytics, automated emergency alerts, and adaptive lighting based on pedestrian presence and ambient conditions.',
        image: '/renders/pasig/pasig4.png'
      },
      {
        title: 'Riverbank Climate Station',
        description: 'Weather stations along the esplanade measure wind, temperature, and humidity to optimize shade deployment and predict flood conditions. Globe\'s 5G infrastructure enables real-time weather data integration with citywide alert systems.',
        image: '/renders/pasig/pasig5.png'
      },
      {
        title: 'Esplanade Activity Tracker',
        description: 'Vision-based counting systems measure pedestrian and cyclist usage, informing infrastructure investment and maintenance schedules. Powered by Globe 5G for edge AI processing and instant analytics.',
        image: '/renders/pasig/pasig6.png'
      },
      {
        title: 'Riverfront L.I.L.O.M Network',
        description: 'Smart canopy installations along the esplanade provide shade while monitoring environmental conditions and visitor comfort. Globe 5G network backbone connects all L.I.L.O.M units into a coordinated smart infrastructure system with solar energy tracking and microgrid management.',
        image: '/renders/pasig/pasig7.png'
      }
    ],
    carouselImages: [
      '/renders/pasig/pasig1.png',
      '/renders/pasig/pasig2.png',
      '/renders/pasig/pasig3.png'
    ]
  }
}

// Helper: Get location by ID
export function getLocation(locationId) {
  return LOCATIONS[locationId] || null
}

// Helper: Get all locations as array (excluding Luneta for now)
export function getAllLocations() {
  return Object.values(LOCATIONS).filter(loc => loc.id !== 'luneta')
}

// Helper: Get Manila center point for initial map view
export const MANILA_CENTER = [120.9842, 14.5995]

// Helper: Get location for legacy "Luneta" references
export function getLunetaLocation() {
  return LOCATIONS.luneta
}
