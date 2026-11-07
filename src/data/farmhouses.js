export const farmhouses = [
  {
    id: 1,

    name: "The Vedika Garden Villa",

    location: "Moinabad, Hyderabad",

    rating: 4.9,

    reviews: 124,

    guests: 15,

    bedrooms: 4,

    bathrooms: 4,

    price: 12000,

    weekendPrice: 16000,
      extraGuestPrice: 500,
 specialPrices: {
    "2026-10-27": 16000,
    "2026-10-28": 14000,
  },

    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],

    amenities: [
      "Private Pool",
      "AC Rooms",
      "WiFi",
      "Parking",
      "Kitchen",
      "BBQ",
      "Bonfire",
      "Indoor Games"
    ],
addOns: [
  {
    id: "gasCooking",
    name: "Gas Cooking Access",
    description: "Gas stove and basic cooking access",
    price: 500,
    pricingType: "perStay",
    available: true,
  },
  {
    id: "foodPackage",
    name: "Food Package",
    description: "Food arranged for each guest",
    price: 350,
    pricingType: "perGuest",
    available: true,
  },
  {
    id: "barbecue",
    name: "Barbecue Setup",
    description: "Barbecue grill and setup",
    price: 1500,
    pricingType: "perStay",
    available: true,
  },
],
checkInTime: "14:00",
checkOutTime: "11:00",
minimumGuests: 5,
extraGuestPrice: 500,
    description:
      "A beautiful private farmhouse surrounded by greenery, perfect for family gatherings, birthdays and weekend getaways."
  },

  {
    id: 2,

    name: "Green Valley Farmhouse",

    location: "Shamshabad, Hyderabad",

    rating: 4.8,

    reviews: 86,

    guests: 20,

    bedrooms: 5,

    bathrooms: 5,

    price: 15000,

    weekendPrice: 19000,

    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],

    amenities: [
      "Private Pool",
      "Large Lawn",
      "AC Rooms",
      "Parking",
      "BBQ",
      "Music System"
    ],

    description:
      "A spacious luxury farmhouse with a private swimming pool and beautiful outdoor lawn."
  },

  {
    id: 3,

    name: "Palm Breeze Farm Stay",

    location: "Chevella, Hyderabad",

    rating: 4.7,

    reviews: 62,

    guests: 10,

    bedrooms: 3,

    bathrooms: 3,

    price: 8500,

    weekendPrice: 11000,

    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
    ],

    amenities: [
      "Swimming Pool",
      "Garden",
      "AC Rooms",
      "Parking",
      "WiFi",
      "Bonfire"
    ],

    description:
      "A peaceful farm stay for families and friends looking for a relaxing weekend away from the city."
  }
];