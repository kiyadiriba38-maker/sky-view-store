export type DemoCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type DemoProduct = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  priceETB: number;
  originalPriceETB: number;
  image: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  variants: string[];
  demo: true;
};

const photo = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const DEMO_CATEGORIES: DemoCategory[] = [
  { name: "Phones & Accessories", slug: "phones-and-accessories", description: "Phones, cases, chargers and everyday mobile essentials.", image: photo("photo-1511707171634-5f897ff02aa9") },
  { name: "Computers & Office", slug: "computers-and-office", description: "Laptops, keyboards, monitors and workspace gear.", image: photo("photo-1498050108023-c5249f4df085") },
  { name: "Consumer Electronics", slug: "electronics", description: "Smart devices, audio, cameras and connected living.", image: photo("photo-1498049794561-7780e7231661") },
  { name: "Home & Kitchen", slug: "home-and-living", description: "Useful tools and thoughtful pieces for your home.", image: photo("photo-1556911220-bff31c812dba") },
  { name: "Fashion", slug: "fashion", description: "Everyday clothing, bags and personal accessories.", image: photo("photo-1483985988355-763728e1935b") },
  { name: "Shoes", slug: "shoes", description: "Casual, sport and everyday footwear.", image: photo("photo-1542291026-7eec264c27ff") },
  { name: "Beauty & Personal Care", slug: "beauty-and-personal-care", description: "Beauty tools and daily personal-care accessories.", image: photo("photo-1596462502278-27bfdc403348") },
  { name: "Health & Fitness", slug: "health-and-wellness", description: "Fitness accessories and active-lifestyle equipment.", image: photo("photo-1517836357463-d25dfeac3438") },
  { name: "Sports & Outdoors", slug: "sports-and-outdoors", description: "Outdoor essentials and recreational equipment.", image: photo("photo-1476480862126-209bfaa8edc8") },
  { name: "Toys & Hobbies", slug: "toys-and-games", description: "Creative play, hobby supplies and games.", image: photo("photo-1558060370-d644479cb6f7") },
  { name: "Automotive", slug: "automotive", description: "Car accessories, travel gear and maintenance tools.", image: photo("photo-1492144534655-ae79c964c9d7") },
  { name: "Tools & Hardware", slug: "tools-and-hardware", description: "Workshop tools and practical home-improvement gear.", image: photo("photo-1504148455328-c376907d081c") },
  { name: "Furniture & Decor", slug: "furniture", description: "Furniture, lighting and decorative details.", image: photo("photo-1616486338812-3dadae4b4ace") },
  { name: "Jewelry & Watches", slug: "jewelry-and-watches", description: "Watches, jewelry and finishing touches.", image: photo("photo-1523275335684-37898b6baf30") },
  { name: "Baby & Kids", slug: "baby-and-kids", description: "Family essentials, kids' accessories and nursery items.", image: photo("photo-1516627145497-ae6968895b74") },
  { name: "Books & Stationery", slug: "books-and-stationery", description: "Books, notebooks and tools for learning.", image: photo("photo-1455390582262-044cdead277a") },
  { name: "Travel & Luggage", slug: "bags-and-travel", description: "Bags, organizers and travel accessories.", image: photo("photo-1553062407-98eeb64c6a62") },
  { name: "Pet Supplies", slug: "pet-supplies", description: "Everyday accessories for pets and their people.", image: photo("photo-1450778869180-41d0601e046e") },
  { name: "Garden & Home Improvement", slug: "garden-and-outdoors", description: "Garden tools and practical outdoor accessories.", image: photo("photo-1416879595882-3373a0480b5b") },
  { name: "Food & Grocery Accessories", slug: "kitchen-and-dining", description: "Reusable kitchen, storage and food-preparation accessories.", image: photo("photo-1543168256-418811576931") },
];

const productsByCategory: Record<string, string[]> = {
  "Phones & Accessories": ["Protective phone case", "Fast charging adapter", "Braided USB cable", "Wireless charging stand", "Screen protection kit", "Portable phone tripod", "Bluetooth phone grip", "Travel charging pouch", "Car phone mount", "Compact power bank"],
  "Computers & Office": ["Mechanical keyboard", "Wireless mouse", "Laptop stand", "USB-C hub", "Desk monitor light", "Laptop sleeve", "Webcam privacy cover", "Ergonomic wrist rest", "Portable SSD enclosure", "Cable organizer"],
  "Consumer Electronics": ["Wireless headphones", "Portable Bluetooth speaker", "Digital camera strap", "Smart home sensor", "LED desk lamp", "Compact action camera", "USB microphone", "Streaming remote", "Smart plug", "Travel power adapter"],
  "Home & Kitchen": ["Insulated water bottle", "Kitchen storage set", "Digital kitchen scale", "Reusable food container", "Coffee brewing set", "Silicone cooking tools", "Countertop organizer", "Stainless steel kettle", "Compact food chopper", "Dish drying rack"],
  "Fashion": ["Everyday shoulder bag", "Classic cotton shirt", "Lightweight jacket", "Minimal wallet", "Travel crossbody bag", "Everyday sunglasses", "Canvas tote bag", "Knit scarf", "Casual belt", "Compact card holder"],
  "Shoes": ["Everyday running shoes", "Canvas sneakers", "Walking shoes", "Lightweight trainers", "Casual slip-ons", "Outdoor sandals", "Training shoes", "Classic low-top shoes", "Trail walking shoes", "Everyday socks set"],
  "Beauty & Personal Care": ["Makeup organizer", "Travel toiletry bag", "LED vanity mirror", "Cosmetic brush set", "Hair styling brush", "Reusable skincare pads", "Compact manicure kit", "Bathroom organizer", "Makeup travel case", "Personal care pouch"],
  "Health & Fitness": ["Resistance band set", "Yoga mat carrier", "Digital sports timer", "Training gloves", "Foam roller", "Jump rope", "Gym water bottle", "Workout towel set", "Fitness organizer", "Stretching strap"],
  "Sports & Outdoors": ["Camping lantern", "Outdoor picnic blanket", "Travel compass", "Hiking daypack", "Foldable water container", "Cycling bottle holder", "Compact binoculars", "Portable folding stool", "Rain cover", "Outdoor utility pouch"],
  "Toys & Hobbies": ["Building block set", "Creative drawing kit", "Remote control car", "Puzzle collection", "Model craft tools", "Beginner art supplies", "Magnetic learning tiles", "Board game organizer", "DIY science kit", "Miniature model set"],
  "Automotive": ["Car phone holder", "Seat organizer", "Portable tire inflator", "Microfiber cleaning kit", "Car sunshade", "Trunk storage organizer", "Dashboard accessory mount", "Emergency tool pouch", "Car vacuum accessory", "Travel seat cushion"],
  "Tools & Hardware": ["Precision screwdriver set", "Measuring tape", "Tool organizer case", "Adjustable wrench set", "Cordless work light", "Digital multimeter case", "Hex key set", "Utility storage box", "Clamp set", "Workshop gloves"],
  "Furniture & Decor": ["Modern table lamp", "Decorative cushion cover", "Floating wall shelf", "Minimal wall clock", "Desk organizer tray", "Ceramic planter", "Storage basket set", "Accent mirror", "LED ambient light", "Small side table"],
  "Jewelry & Watches": ["Minimal wristwatch", "Stainless steel bracelet", "Jewelry travel case", "Classic pendant necklace", "Watch storage box", "Everyday earrings", "Adjustable ring set", "Watch strap", "Jewelry organizer", "Minimal chain bracelet"],
  "Baby & Kids": ["Nursery storage basket", "Kids' lunch container", "Soft toy organizer", "Baby changing pouch", "Kids' water bottle", "Stroller organizer", "Children's art apron", "Nursery night light", "Kids' travel backpack", "Reusable snack pouch"],
  "Books & Stationery": ["Hardcover notebook", "Study desk planner", "Pen and pencil set", "Book reading light", "Document organizer", "Sticky note collection", "Desk calendar", "Book storage stand", "Creative journal kit", "Stationery travel case"],
  "Travel & Luggage": ["Cabin travel backpack", "Packing cube set", "Luggage tag set", "Travel toiletry organizer", "Compact neck pillow", "Passport wallet", "Foldable duffel bag", "Cable travel organizer", "Digital luggage scale", "Travel laundry pouch"],
  "Pet Supplies": ["Pet travel bowl", "Pet grooming brush", "Adjustable pet lead", "Pet toy storage", "Portable pet mat", "Pet food container", "Pet travel carrier accessory", "Pet water bottle", "Pet collar accessory", "Pet cleaning pouch"],
  "Garden & Home Improvement": ["Garden hand tool set", "Plant watering can", "Seed organizer box", "Garden gloves", "Plant support clips", "Outdoor solar light", "Garden hose nozzle", "Plant mister bottle", "Potting mat", "Garden storage pouch"],
  "Food & Grocery Accessories": ["Reusable produce bags", "Glass storage jar set", "Lunch prep containers", "Insulated food flask", "Reusable coffee filter", "Kitchen label set", "Bamboo serving tray", "Food storage organizer", "Reusable shopping bags", "Pantry storage basket"],
};

const adjectives = ["Everyday", "Modern", "Compact", "Premium-style", "Portable", "Minimal", "Smart", "Lightweight", "Essential", "Travel-ready"];

export const DEMO_PRODUCTS: DemoProduct[] = DEMO_CATEGORIES.flatMap((category, categoryIndex) => {
  const names = productsByCategory[category.name] ?? [];
  return Array.from({ length: 50 }, (_, index) => {
    const sequence = categoryIndex * 50 + index;
    const base = names[index % names.length] ?? "Everyday accessory";
    const title = `${adjectives[index % adjectives.length]} ${base}`;
    const price = 180 + ((sequence * 137 + categoryIndex * 83) % 14800);
    return {
      id: `demo-${sequence + 1}`,
      slug: `demo-${category.slug}-${String(index + 1).padStart(2, "0")}`,
      title,
      category: category.name,
      categorySlug: category.slug,
      priceETB: price,
      originalPriceETB: Math.round(price * 1.18),
      image: category.image,
      description: `${title} is a sample marketplace listing created for the Sky View Store demo catalogue. This listing demonstrates the product detail, shopping, delivery and checkout experience. Product availability, specifications and fulfilment details are illustrative only and are not a real offer for sale.`,
      specifications: [
        { label: "Listing type", value: "Demo product" },
        { label: "Category", value: category.name },
        { label: "Catalogue reference", value: `SV-DEMO-${String(sequence + 1).padStart(4, "0")}` },
        { label: "Fulfilment", value: "Simulated delivery" },
      ],
      variants: ["Standard", "Premium"],
      demo: true as const,
    };
  });
});

export const getDemoProduct = (slug: string) =>
  DEMO_PRODUCTS.find((product) => product.slug === slug) ?? null;
