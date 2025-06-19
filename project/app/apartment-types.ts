export const APARTMENT_TYPES = [
  {
    id: "Lavender",
    name: "Lavender Apartment",
    description: "Brings serenity into every corner.",
    thumbnail: "/images/Gallery/La(1).jpg",
    color: "#9333ea", // Purple
  },
  {
    id: "Terracotta",
    name: "Terracotta Apartment",
    description: "Energizes and refreshes your senses.",
    thumbnail: "/images/Gallery/T(1).jpg",
    color: "#ea580c", // Orange
  },
  {
    id: "Limelight",
    name: "Limelight Apartment",
    description: "Boldness pulses through your space.",
    thumbnail: "/images/Gallery/L(1).jpg",
    color: "#65a30d", // Green
  },
];

export const APARTMENT_PANORAMAS = {
  Terracotta: [
    {
      id: "bathroom",
      title: "BATHROOM",
      url: "/images/panoramas/TP(3).jpg",
      hotspots: [
        // { roomId: "master_room", label: "Master Room", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "lobby", label: "Lobby", position: "-1 1.5 4", rotation: "0 0 0" },
      ],
    },
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/TP(1).jpg",
      hotspots: [
        { roomId: "lobby", label: "Lobby", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "laundry_room", label: "Laundry", position: "-3 1.5 -2", rotation: "0 0 0" },
        { roomId: "master_room", label: "Master Room", position: "0 1.5 3", rotation: "0 0 0" },
      ],
    },
    {
      id: "laundry_room",
      title: "LAUNDRY ROOM",
      url: "/images/panoramas/TP(5).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "toilette", label: "Toilette", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "lobby",
      title: "LOBBY",
      url: "/images/panoramas/TP(6).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "bathroom", label: "Bathroom", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "master_room",
      title: "MASTER ROOM",
      url: "/images/panoramas/TP(2).jpg",
      hotspots: [
        { roomId: "bathroom", label: "Bathroom", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-3 1.5 -2", rotation: "0 0 0" },
      ],
    },
    {
      id: "toilette",
      title: "TOILETTE",
      url: "/images/panoramas/TP(4).jpg",
      hotspots: [
        { roomId: "laundry_room", label: "Laundry", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "lobby", label: "Lobby", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
  ],
  Lavender: [
    {
      id: "bedroom",
      title: "BEDROOM",
      url: "/images/panoramas/LaP(1).jpg",
      hotspots: [
        { roomId: "bathroom", label: "Bathroom", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "living_room", label: "Living Room", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "entrance",
      title: "ENTRANCE",
      url: "/images/panoramas/LaP(2).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "bedroom", label: "Bedroom", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/LaP(3).jpg",
      hotspots: [
        { roomId: "entrance", label: "Entrance", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "living_room", label: "Living Room", position: "-3 1.5 -2", rotation: "0 0 0" },
        { roomId: "laundry", label: "Laundry", position: "0 1.5 3", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom",
      title: "BATHROOM",
      url: "/images/panoramas/LaP(4).jpg",
      hotspots: [
        { roomId: "bedroom", label: "Bedroom", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "toilette", label: "Toilette", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "toilette",
      title: "TOILETTE",
      url: "/images/panoramas/LaP(5).jpg",
      hotspots: [
        { roomId: "bathroom", label: "Bathroom", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "laundry", label: "Laundry", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "laundry",
      title: "LAUNDRY",
      url: "/images/panoramas/LaP(6).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "toilette", label: "Toilette", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "living_room",
      title: "LIVING ROOM",
      url: "/images/panoramas/LaP(7).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "bedroom", label: "Bedroom", position: "-3 1.5 -2", rotation: "0 0 0" },
      ],
    },
  ],
  Limelight: [
    {
      id: "bathroom_1",
      title: "BATHROOM 1",
      url: "/images/panoramas/LP(3).jpg",
      hotspots: [
        { roomId: "bedroom", label: "Bedroom", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "dressing_room", label: "Dressing Room", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "bathroom_2",
      title: "BATHROOM 2",
      url: "/images/panoramas/LP(2).jpg",
      hotspots: [
        { roomId: "living_room", label: "Living Room", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "dressing_room",
      title: "DRESSING ROOM",
      url: "/images/panoramas/LP(4).jpg",
      hotspots: [
        { roomId: "bedroom", label: "Bedroom", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "bathroom_1", label: "Bathroom 1", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "bedroom",
      title: "BEDROOM",
      url: "/images/panoramas/LP(5).jpg",
      hotspots: [
        { roomId: "dressing_room", label: "Dressing Room", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "bathroom_1", label: "Bathroom 1", position: "-3 1.5 -2", rotation: "0 0 0" },
        { roomId: "living_room", label: "Living Room", position: "0 1.5 3", rotation: "0 0 0" },
      ],
    },
    {
      id: "kitchen_living_room",
      title: "KITCHEN & LIVING ROOM",
      url: "/images/panoramas/LP(6).jpg",
      hotspots: [
        { roomId: "living_room", label: "Living Room", position: "2 1.5 -3", rotation: "0 0 0" },
        { roomId: "bathroom_2", label: "Bathroom 2", position: "-2 1.5 -3", rotation: "0 0 0" },
      ],
    },
    {
      id: "living_room",
      title: "LIVING ROOM",
      url: "/images/panoramas/LP(1).jpg",
      hotspots: [
        { roomId: "kitchen_living_room", label: "Kitchen & Living", position: "3 1.5 -2", rotation: "0 0 0" },
        { roomId: "bedroom", label: "Bedroom", position: "-3 1.5 -2", rotation: "0 0 0" },
        { roomId: "bathroom_2", label: "Bathroom 2", position: "0 1.5 3", rotation: "0 0 0" },
      ],
    },
  ],
};