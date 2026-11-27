import configPromise from "@payload-config";
import { getPayload } from "payload";

const categoryNames = [
  "Phones & Accessories", "Computers & Office", "Electronics", "Audio & Headphones",
  "Cameras & Photography", "Smart Home", "Home & Living", "Kitchen & Dining",
  "Furniture", "Fashion", "Shoes", "Bags & Travel", "Beauty & Personal Care",
  "Health & Wellness", "Sports & Outdoors", "Toys & Games", "Baby & Kids",
  "Automotive", "Tools & Hardware", "Books & Stationery", "Jewelry & Watches",
  "Pet Supplies", "Garden & Outdoors", "Gaming", "Lighting & Decor",
];

const productTypes = [
  "Wireless Earbuds", "Bluetooth Speaker", "Smart Watch", "Portable Charger",
  "USB-C Hub", "Mechanical Keyboard", "Wireless Mouse", "Laptop Stand",
  "Desk Lamp", "Travel Backpack", "Everyday Sneakers", "Insulated Bottle",
  "Phone Tripod", "Protective Phone Case", "Tablet Sleeve", "Webcam",
  "LED Light Strip", "Storage Organizer", "Kitchen Scale", "Coffee Grinder",
  "Water Filter Bottle", "Yoga Mat", "Resistance Band Set", "Running Belt",
  "Camping Lantern", "Travel Adapter", "Digital Thermometer", "Skincare Organizer",
  "Hair Styling Brush", "Sunglasses", "Analog Watch", "Wallet",
  "Packing Cube Set", "Car Phone Mount", "Tire Pressure Gauge", "Tool Kit",
  "Notebook Set", "Desk Organizer", "Gaming Controller", "Reading Light",
];

const adjectives = [
  "Aurora", "Nova", "Orbit", "Vertex", "Pulse", "Nimbus", "Echo", "Lumen",
  "Atlas", "Aero", "Zenith", "Prism", "Vivid", "Terra", "Cobalt", "Solis",
  "Mosaic", "Summit", "Drift", "Onyx", "Ember", "Halo", "Flux", "Aria", "Kinetic",
];

const images = [
  "photo-1511707171634-5f897ff02aa9","photo-1496181133206-80ce9b88a853","photo-1505740420928-5e560c06d30e",
  "photo-1505740420928-5e560c06d30e","photo-1516035069371-29a1b244cc32","photo-1543512214-318c7553f230",
  "photo-1505693416388-ac5ce068fe85","photo-1556911220-e15b29be8c8f","photo-1505693416388-ac5ce068fe85",
  "photo-1483985988355-763728e1935b","photo-1542291026-7eec264c27ff","photo-1553062407-98eeb64c6a62",
  "photo-1596462502278-27bfdc403348","photo-1547887538-e3a2f32cb1cc","photo-1517836357463-d25dfeac3438",
  "photo-1596462502278-27bfdc403348","photo-1519689680058-324335c77eba","photo-1492144534655-ae79c964c9d7",
  "photo-1530124566582-a618bc2615dc","photo-1455390582262-044cdead277a","photo-1523275335684-37898b6baf30",
  "photo-1583337130417-3346a1be7dee","photo-1416879595882-3373a0480b5b","photo-1542751371-adc38448a05e",
  "photo-1507473885765-e6ed057f782c",
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`);

const richText = (text: string) => ({
  root: {
    type: "root",
    children: [{
      type: "paragraph",
      children: [{ type: "text", text, detail: 0, format: 0, mode: "normal", style: "", version: 1 }],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    }],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  },
});

async function main() {
  // This script creates 1,000 demo products and up to 2,000 demo reviews.
  // Require an explicit opt-in so it cannot be run accidentally against a
  // production DATABASE_URL from a developer machine or deployment.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seeding is disabled in production.");
  }
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Demo seeding is opt-in. Set ALLOW_DEMO_SEED=true only after confirming DATABASE_URL points to the dedicated development Neon branch.",
    );
  }

  const payload = await getPayload({ config: configPromise });
  const categoryIds: number[] = [];

  for (const [index, title] of categoryNames.entries()) {
    const slug = title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await payload.find({ collection: "category", where: { slug: { equals: slug } }, limit: 1, depth: 0, overrideAccess: true });
    const doc = existing.docs[0] ?? await payload.create({
      collection: "category",
      overrideAccess: true,
      draft: false,
      data: {
        title,
        slug,
        description: richText(`Explore our sample ${title.toLowerCase()} collection. Every item in this collection is a demonstration listing created for the Sky View Store preview catalogue.`),
        meta: { title: `${title} | Sky View Store`, description: `Sample demo listings in ${title}.`, image: null },
        _status: "published",
      } as never,
    });
    categoryIds[index] = Number(doc.id);
  }

  const existingProducts = await payload.find({
    collection: "products",
    where: { isDemo: { equals: true } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  });
  const existingSlugs = new Set(existingProducts.docs.map((doc) => doc.slug));
  const jobs: Array<() => Promise<void>> = [];

  for (let index = 0; index < 1000; index++) {
    const categoryIndex = Math.floor(index / 40);
    const type = productTypes[index % productTypes.length];
    const adjective = adjectives[Math.floor(index / productTypes.length)];
    const series = String(index + 1).padStart(4, "0");
    const title = `${adjective} ${type} · Series ${series}`;
    const slug = `${adjective.toLowerCase()}-${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${series}`;
    if (existingSlugs.has(slug)) continue;

    jobs.push(async () => {
      const price = 450 + ((index * 173) % 24800);
      const imageUrl = images[categoryIndex] ?? images[0];
      const product = await payload.create({
        collection: "products",
        overrideAccess: true,
        draft: false,
        data: {
          title,
          slug,
          inventory: 25 + (index % 75),
          priceInUSDEnabled: true,
          priceInUSD: price,
          originalPriceInUSD: Math.round(price * 1.18),
          description: richText(`${title} is a demonstration catalogue item for exploring the Sky View Store shopping experience. Review the listed product details, compare available options, and explore the simulated checkout. This sample listing is not real inventory and is not a promise of availability.`),
          meta: { title, description: `Demonstration listing for ${title}. Sample catalogue item only.`, image: null },
          categories: [categoryIds[categoryIndex]],
          listingType: "own_store",
          isDemo: true,
          demoImageUrl: imageUrl,
          listingStatus: "approved",
          _status: "published",
        } as never,
      });

      const reviewSamples = [
        { authorName: "Demo shopper 01", title: "Sample review · easy to explore", body: "This is an illustrative demo review used to preview the review layout. It is not a genuine customer experience or verified purchase.", rating: 5 },
        { authorName: "Demo shopper 02", title: "Sample feedback · catalogue preview", body: "A second sample entry demonstrates how customer feedback may appear. This text is fictional and is clearly marked as demo content.", rating: 4 },
      ];
      for (const sample of reviewSamples) {
        await payload.create({
          collection: "reviews",
          overrideAccess: true,
          data: {
            product: product.id,
            ...sample,
            isDemo: true,
            verifiedPurchase: false,
          } as never,
        });
      }
    });
  }

  const concurrency = 12;
  for (let offset = 0; offset < jobs.length; offset += concurrency) {
    await Promise.all(jobs.slice(offset, offset + concurrency).map((job) => job()));
    payload.logger.info(`Demo catalogue progress: ${Math.min(offset + concurrency, jobs.length)} / ${jobs.length}`);
  }

  payload.logger.info(`Marketplace demo seed complete. New products: ${jobs.length}. Categories checked: ${categoryNames.length}.`);
  await payload.destroy();
}

main().catch((error) => {
  console.error("Marketplace demo seed failed", error);
  process.exitCode = 1;
});
