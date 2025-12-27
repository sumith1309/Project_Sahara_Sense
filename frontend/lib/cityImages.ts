// High-quality UAE city images with matching location names
// Each image is paired with its exact location name

export interface CityImageData {
  url: string;
  location: string;
}

export const cityImageData: Record<string, CityImageData[]> = {
  dubai: [
    { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=90', location: 'Burj Khalifa at Night' },
    { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=90', location: 'Dubai Marina' },
    { url: 'https://images.unsplash.com/photo-1546412414-e1885259563a?w=1200&q=90', location: 'Dubai Skyline' },
    { url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&q=90', location: 'Burj Al Arab' },
    { url: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=90', location: 'Palm Jumeirah Aerial View' },
  ],
  abu_dhabi: [
    { url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=90', location: 'Sheikh Zayed Grand Mosque' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90', location: 'Mosque Interior Dome' },
    { url: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=90', location: 'Abu Dhabi Skyline' },
    { url: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1200&q=90', location: 'Louvre Abu Dhabi' },
    { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=90', location: 'Abu Dhabi Corniche' },
  ],
  sharjah: [
    { url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=90', location: 'Sharjah Mosque' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90', location: 'Al Noor Mosque' },
    { url: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=90', location: 'Sharjah Heritage Area' },
    { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=90', location: 'Sharjah Waterfront' },
  ],
  al_ain: [
    { url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=1200&q=90', location: 'Jebel Hafeet Mountains' },
    { url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=90', location: 'Al Ain Oasis' },
    { url: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1200&q=90', location: 'Desert Landscape' },
    { url: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1200&q=90', location: 'Mountain Road' },
    { url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=90', location: 'Desert Sunset' },
  ],
  ajman: [
    { url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1200&q=90', location: 'Ajman Beach Sunset' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=90', location: 'Ajman Corniche Beach' },
    { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=90', location: 'Ajman Coastal View' },
    { url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=90', location: 'Ajman Beach Resort' },
  ],
  ras_al_khaimah: [
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90', location: 'Hajar Mountains' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=90', location: 'Jebel Jais Peak' },
    { url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=90', location: 'Mountain Sunrise' },
    { url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=90', location: 'RAK Mountain Range' },
    { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=90', location: 'Mountains at Night' },
  ],
  fujairah: [
    { url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=90', location: 'Fujairah Beach Waves' },
    { url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=90', location: 'Fujairah Coastal Cliffs' },
    { url: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=1200&q=90', location: 'Rocky Coastline' },
    { url: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=1200&q=90', location: 'Fujairah Beach Sunset' },
  ],
  umm_al_quwain: [
    { url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=90', location: 'UAQ Ocean Waves' },
    { url: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=1200&q=90', location: 'UAQ Lagoon' },
    { url: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=1200&q=90', location: 'UAQ Sunset Beach' },
    { url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=90', location: 'UAQ Mangroves' },
  ],
};

// Helper functions to get images and locations separately (for backward compatibility)
export const cityImages: Record<string, string[]> = Object.fromEntries(
  Object.entries(cityImageData).map(([city, data]) => [city, data.map(d => d.url)])
);

export const cityLandmarks: Record<string, string[]> = Object.fromEntries(
  Object.entries(cityImageData).map(([city, data]) => [city, data.map(d => d.location)])
);

export default cityImageData;
