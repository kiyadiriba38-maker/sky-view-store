"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiHeart, FiSearch, FiShoppingCart, FiUser, FiArrowUpRight, FiMonitor, FiGrid, FiSliders, FiStar } from "react-icons/fi";

import { useStoreLocale } from "@/lib/providers/intl";
import StorefrontImage from "@/components/storefront/storefront-image";

import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/catalog";

type CatalogProduct = {
  title: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice: number | null;
  listingType?: "own_store" | "marketplace_seller" | null;
  isDemo?: boolean;
  demoImageUrl?: string | null;
  productImageUrl?: string | null;
  category?: string;
  categorySlug?: string;
};

type Currency = "ETB" | "USD" | "EUR" | "GBP" | "AED";
type Language = "en" | "am" | "om";
type SavedProduct = { id: string; slug: string; title: string; image: string; priceETB: number; category: string; demo: boolean; href: string };

const copy = {
  en: {
    search: "Search products, brands and categories", hero: "A whole marketplace. A new way to shop.", sub: "Discover everyday essentials, technology, fashion and more — all in one place.", shop: "Explore marketplace", categories: "Shop by category", popular: "Popular discoveries", demo: "DEMO", real: "REAL PRODUCT", all: "All products", demoOnly: "Demo products", realOnly: "Real products", searchButton: "Search", browse: "Browse all products",
    navShop:"Shop",navCategories:"Categories",navTrending:"Trending",navDeals:"Deals",navHelp:"Help",signIn:"Sign in",cart:"Cart",popularPrefix:"Popular:",wireless:"Wireless",phoneAccessories:"Phone accessories",homeSearch:"Home",travel:"Travel",heroEyebrow:"THE SKY VIEW MARKETPLACE",metaETB:"ETB-first shopping",metaSellers:"Approved sellers",metaDemo:"Demo checkout",benefitDiscovery:"Wide product discovery",benefitLocal:"Local-first shopping",benefitSeller:"Seller marketplace",benefitSecure:"Secure account access",categoryEyebrow:"EXPLORE THE COLLECTIONS",viewAllCategories:"View all categories",catalogueEyebrow:"A MARKETPLACE OF POSSIBILITIES",catalogueDescription:"listings · sample listings are labelled clearly",allCategories:"All categories",demoNote:"Sample listing · simulated stock",realNote:"Published marketplace listing",emptyResults:"No products match your search. Try another term or category.",exchangeUnavailable:"Exchange rate unavailable — showing ETB values.",exchangeIndicative:"Converted using a reference exchange-rate feed; indicative only.",pricesETB:"Prices shown in Ethiopian birr.",promoEyebrow:"A BETTER WAY TO DISCOVER",promoTitle:"From everyday essentials to unexpected finds.",promoText:"Browse a growing catalogue built for Ethiopia, with a marketplace foundation ready to expand.",startExploring:"Start exploring",about:"About",shipping:"Shipping",returns:"Returns",privacy:"Privacy",helpCenter:"Help center",footerTagline:"Built for discovery. Starting in Ethiopia.",footerNote:"Demo listings are not real offers for sale.",mobileHome:"Home",mobileShop:"Shop",mobileCategories:"Categories",mobileCart:"Cart",mobileAccount:"Account",
    heroTitle: "Online Shopping,", heroTitleAccent: "Simplified.", heroDescription: "Discover verified electronics, fashion, lifestyle essentials and more — all in one beautifully simple marketplace, with delivery options across Ethiopia.", tabFeatures: "+ TOP FEATURES", tabGallery: "+ GALLERY", tabSpecs: "+ SPECS", tabReviews: "+ REVIEWS", featureTitle: "Discover more in one place", featureText: "Explore product collections, approved sellers and a simple shopping journey.", galleryTitle: "A world of everyday finds", galleryText: "Browse electronics, fashion, home essentials and lifestyle collections.", specsTitle: "Details that help you choose", specsText: "Compare options, product specifications, availability and seller information.", reviewsTitle: "More confidence in every choice", reviewsText: "Read buyer feedback and verified-purchase reviews on eligible listings.", metaApproved: "APPROVED SELLERS", metaNoPayments: "NO LIVE PAYMENT PROCESSING", showcaseCaption: "Find your next favourite thing.", ctaLook: "Get the look", ctaExplore: "DISCOVER THE COLLECTION", dealsEyebrow: "LIMITED-TIME DEMO PICKS", dealsTitle: "Super Deals", dealsPreview: "preview", dealsDescription: "Explore sample offers from the demo catalogue. Prices and timer are illustrative.", demoTimer: "DEMO TIMER", dealsExplore: "Explore deals", saved: "Saved", save: "Save", clearFilters: "Clear filters",
    categoryNames:{"phones-and-accessories":"Phones & Accessories","computers-and-office":"Computers & Office","electronics":"Consumer Electronics","home-and-living":"Home & Kitchen","fashion":"Fashion","shoes":"Shoes","beauty-and-personal-care":"Beauty & Personal Care","health-and-wellness":"Health & Fitness","sports-and-outdoors":"Sports & Outdoors","toys-and-games":"Toys & Hobbies","automotive":"Automotive","tools-and-hardware":"Tools & Hardware","furniture":"Furniture & Decor","jewelry-and-watches":"Jewelry & Watches","baby-and-kids":"Baby & Kids","books-and-stationery":"Books & Stationery","bags-and-travel":"Travel & Luggage","pet-supplies":"Pet Supplies","garden-and-outdoors":"Garden & Home Improvement","kitchen-and-dining":"Food & Grocery Accessories"}
  },
  am: {
    search: "ምርቶችን፣ ብራንዶችን እና ምድቦችን ይፈልጉ", hero: "ሙሉ የገበያ መድረክ። አዲስ የግዢ ልምድ።", sub: "የዕለት ተዕለት እቃዎችን፣ ቴክኖሎጂን፣ ፋሽንን እና ሌሎችንም በአንድ ቦታ ያግኙ።", shop: "ገበያውን ይመልከቱ", categories: "በምድብ ይግዙ", popular: "ተወዳጅ ምርቶች", demo: "የሙከራ", real: "እውነተኛ ምርት", all: "ሁሉም ምርቶች", demoOnly: "የሙከራ ምርቶች", realOnly: "እውነተኛ ምርቶች", searchButton: "ፈልግ", browse: "ሁሉንም ምርቶች ይመልከቱ",
    navShop:"መደብር",navCategories:"ምድቦች",navTrending:"ተወዳጅ",navDeals:"ቅናሾች",navHelp:"እገዛ",signIn:"ይግቡ",cart:"ጋሪ",popularPrefix:"ተወዳጅ:",wireless:"ገመድ አልባ",phoneAccessories:"የስልክ መለዋወጫዎች",homeSearch:"ቤት",travel:"ጉዞ",heroEyebrow:"የስካይ ቪው ገበያ",metaETB:"በብር የተመሰረተ ግዢ",metaSellers:"የተፈቀዱ ሻጮች",metaDemo:"የሙከራ ክፍያ",benefitDiscovery:"ሰፊ የምርት ምርጫ",benefitLocal:"አካባቢያዊ ግዢ",benefitSeller:"የሻጮች ገበያ",benefitSecure:"ደህንነቱ የተጠበቀ መለያ",categoryEyebrow:"ምድቦችን ይመልከቱ",viewAllCategories:"ሁሉንም ምድቦች ይመልከቱ",catalogueEyebrow:"የምርት ገበያ",catalogueDescription:"ምርቶች · የሙከራ ምርቶች በግልጽ ይለያሉ",allCategories:"ሁሉም ምድቦች",demoNote:"የሙከራ ዝርዝር · የሙከራ ክምችት",realNote:"የታተመ የገበያ ምርት",emptyResults:"የፍለጋ ውጤት የለም። ሌላ ቃል ወይም ምድብ ይሞክሩ።",exchangeUnavailable:"የምንዛሬ መጠን አልተገኘም — የብር ዋጋ ይታያል።",exchangeIndicative:"የሚታየው የምንዛሬ መጠን ግምታዊ ነው።",pricesETB:"ዋጋዎች በኢትዮጵያ ብር ናቸው።",promoEyebrow:"የተሻለ የምርት ፍለጋ",promoTitle:"ከዕለታዊ አስፈላጊ እቃዎች እስከ አዲስ ግኝቶች።",promoText:"ለኢትዮጵያ የተዘጋጀ እያደገ ያለ የምርት ስብስብ ይመልከቱ።",startExploring:"መጀመር",about:"ስለ እኛ",shipping:"መላኪያ",returns:"ተመላሽ",privacy:"ግላዊነት",helpCenter:"የእገዛ ማዕከል",footerTagline:"ለምርት ግኝት የተሰራ። ከኢትዮጵያ ይጀምራል።",footerNote:"የሙከራ ዝርዝሮች ለሽያጭ የቀረቡ እውነተኛ ምርቶች አይደሉም።",mobileHome:"መነሻ",mobileShop:"መደብር",mobileCategories:"ምድቦች",mobileCart:"ጋሪ",mobileAccount:"መለያ",
    heroTitle: "የመስመር ላይ ግዢ፣", heroTitleAccent: "ቀላል ሆኖ።", heroDescription: "የተረጋገጡ ኤሌክትሮኒክስ፣ ፋሽን፣ የአኗኗር አስፈላጊ እቃዎችን እና ሌሎችንም በአንድ ቀላል የገበያ መድረክ ያግኙ።", tabFeatures: "+ ዋና ባህሪያት", tabGallery: "+ ምስሎች", tabSpecs: "+ ዝርዝሮች", tabReviews: "+ ግምገማዎች", featureTitle: "ብዙ ነገሮችን በአንድ ቦታ ያግኙ", featureText: "የምርት ስብስቦችን፣ የተፈቀዱ ሻጮችን እና ቀላል የግዢ ሂደትን ይመልከቱ።", galleryTitle: "የዕለት ተዕለት ምርጫዎች", galleryText: "ኤሌክትሮኒክስ፣ ፋሽን፣ የቤት እቃዎችን እና የአኗኗር ምርቶችን ይመልከቱ።", specsTitle: "ለመምረጥ የሚረዱ ዝርዝሮች", specsText: "አማራጮችን፣ የምርት ዝርዝሮችን፣ ተገኝነትን እና የሻጭ መረጃን ያነጻጽሩ።", reviewsTitle: "በእያንዳንዱ ምርጫ የበለጠ እምነት", reviewsText: "የገዢዎችን አስተያየት እና የተረጋገጡ ግምገማዎችን ያንብቡ።", metaApproved: "የተፈቀዱ ሻጮች", metaNoPayments: "ቀጥታ ክፍያ የለም", showcaseCaption: "ቀጣዩን ተወዳጅ ምርትዎን ያግኙ።", ctaLook: "ምርቶችን ይመልከቱ", ctaExplore: "ስብስቡን ይመልከቱ", dealsEyebrow: "የሙከራ ልዩ ቅናሾች", dealsTitle: "ልዩ ቅናሾች", dealsPreview: "ቅድመ እይታ", dealsDescription: "ከሙከራ ካታሎግ የናሙና ቅናሾችን ይመልከቱ። ዋጋዎችና ሰዓቱ ለምሳሌ ብቻ ናቸው።", demoTimer: "የሙከራ ሰዓት", dealsExplore: "ቅናሾችን ይመልከቱ", saved: "ተቀምጧል", save: "አስቀምጥ", clearFilters: "ማጣሪያዎችን አጽዳ",
    categoryNames:{"phones-and-accessories":"ስልኮች እና መለዋወጫዎች","computers-and-office":"ኮምፒውተሮች እና ቢሮ","electronics":"የኤሌክትሮኒክስ እቃዎች","home-and-living":"ቤት እና ኩሽና","fashion":"ፋሽን","shoes":"ጫማዎች","beauty-and-personal-care":"ውበት እና የግል እንክብካቤ","health-and-wellness":"ጤና እና አካል ብቃት","sports-and-outdoors":"ስፖርት እና ውጭ እንቅስቃሴ","toys-and-games":"መጫወቻዎች እና ጨዋታዎች","automotive":"የመኪና መለዋወጫዎች","tools-and-hardware":"መሳሪያዎች እና ሃርድዌር","furniture":"የቤት ዕቃዎች እና ማስዋቢያ","jewelry-and-watches":"ጌጣጌጥ እና ሰዓቶች","baby-and-kids":"ህፃናት እና ልጆች","books-and-stationery":"መጻሕፍት እና የጽሕፈት እቃዎች","bags-and-travel":"ቦርሳዎች እና ጉዞ","pet-supplies":"የቤት እንስሳት እቃዎች","garden-and-outdoors":"አትክልት እና ውጭ አካባቢ","kitchen-and-dining":"ኩሽና እና ምግብ ዝግጅት"}
  },
  om: {
    search: "Oomisha, maqaa daldalaa fi ramaddii barbaadi", hero: "Gabaa guutuu. Muuxannoo bittaa haaraa.", sub: "Meeshaalee guyyaa guyyaa, teeknooloojii, faashinii fi kanneen biroo bakka tokkotti argadhu.", shop: "Gabaa ilaali", categories: "Ramaddii irratti bitadhu", popular: "Oomisha beekamoo", demo: "YAALII", real: "OOMISHA DHUGAA", all: "Oomisha hunda", demoOnly: "Oomisha yaalii", realOnly: "Oomisha dhugaa", searchButton: "Barbaadi", browse: "Oomisha hunda ilaali",
    navShop:"Suuqii",navCategories:"Ramaddiiwwan",navTrending:"Beekamoo",navDeals:"Gatii hir'ate",navHelp:"Gargaarsa",signIn:"Seeni",cart:"Gaarii",popularPrefix:"Beekamoo:",wireless:"Wayaa malee",phoneAccessories:"Meeshaalee bilbilaa",homeSearch:"Mana",travel:"Imala",heroEyebrow:"GABAA SKY VIEW",metaETB:"Bittaa Birriin",metaSellers:"Gurgurtoota raggaasifaman",metaDemo:"Kaffaltii yaalii",benefitDiscovery:"Filannoo oomishaa bal'aa",benefitLocal:"Bittaa naannoo",benefitSeller:"Gabaa gurgurtootaa",benefitSecure:"Herrega nageenya qabu",categoryEyebrow:"WALITTI QABAMA SAKATTA'I",viewAllCategories:"Ramaddii hunda ilaali",catalogueEyebrow:"GABAA FILANNOO",catalogueDescription:"tarree · oomishni yaalii ifatti mallatteeffameera",allCategories:"Ramaddii hunda",demoNote:"Tarree yaalii · kuusaa fakkeessaa",realNote:"Tarree gabaa maxxanfame",emptyResults:"Oomishni barbaadde hin argamne. Jecha yookaan ramaddii biraa yaali.",exchangeUnavailable:"Gatiin jijjiirraa hin argamne — gatii ETB agarsiisaa.",exchangeIndicative:"Gatiin jijjiirraa agarsiifame tilmaama qofa.",pricesETB:"Gatiin Birrii Itoophiyaatiin agarsiifameera.",promoEyebrow:"KARAAN SAKATTA'UU FOYYAA'AA",promoTitle:"Meeshaalee guyyaa guyyaa irraa hanga argannoo haaraatti.",promoText:"Kuusaa oomishaa Itoophiyaaf qophaa'e kan guddachaa jiru ilaali.",startExploring:"Sakatta'uu jalqabi",about:"Waa'ee keenya",shipping:"Geejjiba",returns:"Deebisuu",privacy:"Iccitii",helpCenter:"Giddugala gargaarsaa",footerTagline:"Sakatta'uuf ijaarame. Itoophiyaa irraa jalqaba.",footerNote:"Tarreewwan yaalii gurgurtaa dhugaa miti.",mobileHome:"Jalqaba",mobileShop:"Suuqii",mobileCategories:"Ramaddii",mobileCart:"Gaarii",mobileAccount:"Herrega",
    heroTitle: "Bittaa interneetii,", heroTitleAccent: "Salphaa.", heroDescription: "Elektirooniksii mirkanaa'an, faashinii, meeshaalee jireenyaa fi kanneen biroo gabaa salphaa tokko keessatti argadhu; Itoophiyaa keessatti filannoo geejjibaa waliin.", tabFeatures: "+ AMALOOTA", tabGallery: "+ SUURAA", tabSpecs: "+ IBSA", tabReviews: "+ YAADA", featureTitle: "Waan hedduu bakka tokkotti argadhu", featureText: "Kuusaa oomishaa, gurgurtoota raggaasifamanii fi adeemsa bittaa salphaa ilaali.", galleryTitle: "Oomishaalee guyyaa guyyaa", galleryText: "Elektirooniksii, faashinii, meeshaalee mana keessaa fi jireenyaa sakatta'i.", specsTitle: "Odeeffannoo filannoo si gargaaru", specsText: "Filannoowwan, ibsa oomishaa, argama fi odeeffannoo gurguraa wal bira qabi.", reviewsTitle: "Filannoo kee irratti amantaa dabalataa", reviewsText: "Yaada bitattootaa fi madaallii bittaa mirkanaa'e dubbisi.", metaApproved: "GURGURTOOTA RAGGAASIFAMAN", metaNoPayments: "KAFFALTIIN DHUGAA HIN JIRU", showcaseCaption: "Oomisha itti aanu jaallattu argadhu.", ctaLook: "Oomisha ilaali", ctaExplore: "KUUSAA SAKATTA'I", dealsEyebrow: "FILANNOO YAALII ADDaa", dealsTitle: "Gatii Addaa", dealsPreview: "mul'ata", dealsDescription: "Gatiiwwan fakkeenyaa kuusaa yaalii irraa ilaali. Gatiin fi sa'aatiin fakkeenya qofa.", demoTimer: "SA'AATII YAALII", dealsExplore: "Gatiiwwan ilaali", saved: "Olkaa'ameera", save: "Olkaa'i", clearFilters: "Calallii qulqulleessi",
    categoryNames:{"phones-and-accessories":"Bilbiloota fi meeshaalee isaanii","computers-and-office":"Kompiitara fi meeshaalee waajjiraa","electronics":"Meeshaalee elektirooniksii","home-and-living":"Mana fi kushiinaa","fashion":"Faashinii","shoes":"Kophee","beauty-and-personal-care":"Bareedina fi kunuunsa dhuunfaa","health-and-wellness":"Fayyaa fi sochii qaamaa","sports-and-outdoors":"Ispoortii fi alaa","toys-and-games":"Meeshaalee taphaa fi taphoota","automotive":"Meeshaalee konkolaataa","tools-and-hardware":"Meeshaalee hojii fi hardwaarii","furniture":"Meeshaalee mana keessaa fi miidhagina","jewelry-and-watches":"Faaya fi sa'aatii","baby-and-kids":"Daa'imman fi ijoollee","books-and-stationery":"Kitaabota fi meeshaalee barreessuu","bags-and-travel":"Boorsaa fi imala","pet-supplies":"Meeshaalee bineensota manaa","garden-and-outdoors":"Maasii fi alaa","kitchen-and-dining":"Kushiinaa fi qophii nyaataa"}
  },
};

const formatPrice = (amount: number, currency: Currency, rates: Record<string, number>, locale: Language) => {
  const hasRate = currency === "ETB" || (Number.isFinite(rates[currency]) && rates[currency] > 0);
  const displayCurrency: Currency = hasRate ? currency : "ETB";
  const converted = displayCurrency === "ETB" ? amount : amount * rates[displayCurrency];
  const localeTag = locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : displayCurrency === "ETB" ? "en-ET" : "en-US";
  return new Intl.NumberFormat(localeTag, {
    style: "currency", currency: displayCurrency, maximumFractionDigits: displayCurrency === "ETB" ? 0 : 2,
  }).format(converted);
};

export default function HomeExperience({ catalogProducts = [] }: { catalogProducts?: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [kind, setKind] = useState<"all" | "demo" | "real">("all");
  const [currency, setCurrency] = useState<Currency>("ETB");
  const { locale, setLocale } = useStoreLocale();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateReady, setRateReady] = useState(false);
  const [heroTab, setHeroTab] = useState<"features" | "gallery" | "specs" | "reviews">("features");
  const [cartCount, setCartCount] = useState(0);
  const [dealSecondsRemaining, setDealSecondsRemaining] = useState(8 * 60 * 60);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const t = copy[locale];

  useEffect(() => {
    const timer = window.setInterval(() => setDealSecondsRemaining((seconds) => seconds > 0 ? seconds - 1 : 8 * 60 * 60), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateHeaderScroll = () => setIsHeaderScrolled(window.scrollY > 50);
    updateHeaderScroll();
    window.addEventListener("scroll", updateHeaderScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderScroll);
  }, []);

  useEffect(() => {
    if (!quickSearchOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setQuickSearchOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [quickSearchOpen]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("sv-wishlist") || "[]") as SavedProduct[];
      setWishlist(saved.map((item) => item.id));
    } catch { setWishlist([]); }
    const refreshCartCount = () => {
      try {
        const lines = JSON.parse(window.localStorage.getItem("sv-demo-cart") || "[]") as { quantity?: number }[];
        setCartCount(lines.reduce((total, line) => total + (Number.isFinite(line.quantity) ? Math.max(0, Number(line.quantity)) : 0), 0));
      } catch {
        setCartCount(0);
      }
    };
    refreshCartCount();
    window.addEventListener("sv-demo-cart-change", refreshCartCount);
    window.addEventListener("storage", refreshCartCount);
    return () => {
      window.removeEventListener("sv-demo-cart-change", refreshCartCount);
      window.removeEventListener("storage", refreshCartCount);
    };
  }, []);

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem("sv-currency");
    if (savedCurrency && ["ETB", "USD", "EUR", "GBP", "AED"].includes(savedCurrency)) setCurrency(savedCurrency as Currency);
    const controller = new AbortController();
    fetch("https://open.er-api.com/v6/latest/ETB", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { result?: string; rates?: Record<string, number> }) => {
        if (data.result === "success" && data.rates) setRates(data.rates);
      })
      .catch(() => undefined)
      .finally(() => setRateReady(true));
    return () => controller.abort();
  }, []);

  function toggleWishlist(product: { id: string; slug: string; title: string; image: string | null; priceETB: number; category: string; demo: boolean }) {
    const safeImage = product.image || DEMO_CATEGORIES[2].image;
    let saved: SavedProduct[] = [];
    try { saved = JSON.parse(window.localStorage.getItem("sv-wishlist") || "[]") as SavedProduct[]; } catch { saved = []; }
    const exists = saved.some((item) => item.id === product.id);
    const next = exists ? saved.filter((item) => item.id !== product.id) : [...saved, { ...product, image: safeImage, href: product.id.startsWith("database-") ? `/product/${product.slug}` : `/demo-product/${product.slug}` }];
    window.localStorage.setItem("sv-wishlist", JSON.stringify(next));
    setWishlist(next.map((item) => item.id));
    window.dispatchEvent(new Event("sv-wishlist-change"));
  }

  const realProducts = useMemo(() => catalogProducts.map((product) => {
    const demo = Boolean(product.isDemo);
    return {
      id: `database-${product.slug}`, slug: product.slug, title: product.title,
      category: product.category ?? "Marketplace", categorySlug: product.categorySlug ?? "marketplace",
      priceETB: product.price, originalPriceETB: product.originalPrice ?? product.price,
      image: demo ? DEMO_CATEGORIES.find((item) => item.slug === product.categorySlug)?.image ?? DEMO_CATEGORIES[2].image : product.productImageUrl || product.image || DEMO_CATEGORIES[2].image,
      demo,
      databaseBacked: true as const,
    };
  }), [catalogProducts]);

  const products = useMemo(() => {
    const demoFallback = realProducts.some((product) => product.demo) ? [] : DEMO_PRODUCTS;
    const combined = [...realProducts, ...demoFallback];
    return combined.filter((product) => {
      const matchesQuery = `${product.title} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesKind = kind === "all" || (kind === "demo" ? product.demo : !product.demo);
      return matchesQuery && matchesCategory && matchesKind;
    });
  }, [realProducts, query, category, kind]);

  const categories = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const product of realProducts) {
      if (product.categorySlug && product.category && product.category !== "Marketplace") {
        bySlug.set(product.categorySlug, product.category);
      }
    }
    if (!bySlug.size) return DEMO_CATEGORIES;
    return [...bySlug.entries()].map(([slug, name], index) => ({
      slug,
      name,
      description: `Explore ${name.toLowerCase()} listings.`,
      image: DEMO_CATEGORIES.find((item) => item.slug === slug)?.image ?? DEMO_CATEGORIES[index % DEMO_CATEGORIES.length].image,
    }));
  }, [realProducts]);

  return (
    <main className="sv-marketplace sv-home-viewport min-h-screen sv-dark">
      <div className="sv-market-topline">ETHIOPIA FIRST <span>✦</span> DISCOVER MORE. SHOP SMARTER.</div>
      <header className={`sv-market-header sv-amber-header${isHeaderScrolled ? " is-scrolled" : ""}`} data-scrolled={isHeaderScrolled}>
        <Link href="/" className="sv-brand" aria-label="Sky View Store home">
          <span className="sv-brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48" role="img" focusable="false"><path d="M6 34.5 19.2 13l8.1 13.2 4.3-6.4L42 34.5H6Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M10 38h28M15 30.5l4.2-6.8 4.5 7.2 4-5.9 5.6 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="34.5" cy="11.5" r="3" fill="#fff0c2"/></svg></span><span className="sv-brand-wordmark"><strong>SKY VIEW</strong><b>STORE</b></span>
        </Link>
        <div className="sv-amber-navigation">
          <Link href="/deals" className={`sv-super-deals${isHeaderScrolled ? " is-hidden" : ""}`} aria-label="Explore current deals">SUPER DEALS <FiArrowUpRight aria-hidden="true" /></Link>
          <nav className="sv-main-nav" aria-label="Main navigation">
            <Link className="active" href="/" aria-current="page">HOME</Link>
            <Link href="/shop?category=electronics">ELECTRONICS</Link>
            <Link href="/shop?category=fashion">FASHION</Link>
            <Link href="/shop?category=automotive">VEHICLES</Link>
            <Link href="/categories">ACCESSORIES</Link>
            <Link href="/categories">ALL CATEGORIES</Link>
          </nav>
        </div>
        <div className="sv-header-actions sv-amber-actions">
          <button type="button" aria-label="Open quick search" title="Search products" aria-expanded={quickSearchOpen} aria-controls="sv-quick-search-overlay" onClick={() => setQuickSearchOpen((open) => !open)} className="sv-utility-button"><FiSearch /></button>
          <Link href="/wishlist" aria-label={`Wishlist, ${wishlist.length} saved items`} title="Wishlist" className="sv-utility-button relative"><FiHeart />{wishlist.length > 0 ? <i className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold not-italic text-black">{wishlist.length > 99 ? "99+" : wishlist.length}</i> : null}</Link>
          <Link href="/demo-cart" aria-label={cartCount ? `Shopping cart, ${cartCount} items` : "Shopping cart"} title="Shopping cart" className="sv-utility-button sv-icon-cart"><FiShoppingCart />{cartCount > 0 ? <i>{cartCount > 99 ? "99+" : cartCount}</i> : null}</Link>
          <Link href="/account" aria-label="User profile" title="Account" className="sv-utility-button"><FiUser /></Link>
          <select aria-label="Language" value={locale} onChange={(event) => setLocale(event.target.value as Language)}>
            <option value="en">EN</option><option value="am">አማ</option><option value="om">OR</option>
          </select>
          <select aria-label="Currency" value={currency} onChange={(event) => { const value = event.target.value as Currency; setCurrency(value); window.localStorage.setItem("sv-currency", value); }}>
            <option value="ETB">ETB</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option>
          </select>
        </div>
        {quickSearchOpen ? (
          <div id="sv-quick-search-overlay" className="sv-quick-search-overlay" role="dialog" aria-label="Quick product search">
            <div className="sv-quick-search-field"><FiSearch aria-hidden="true" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setQuickSearchOpen(false); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); } }} placeholder={t.search} aria-label={t.search} /><button type="button" onClick={() => { setQuickSearchOpen(false); document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" }); }}>{t.searchButton}</button><button type="button" className="sv-quick-search-close" aria-label="Close quick search" onClick={() => setQuickSearchOpen(false)}>×</button></div>
            <p>Search the marketplace by product, brand or category.</p>
          </div>
        ) : null}
      </header>

      <section className="sv-market-searchbar sv-amber-search">
        <div className="sv-search-wrap"><span aria-hidden="true">⌕</span><input id="catalogue-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /><button type="button" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>{t.searchButton}</button></div>
        <div className="sv-quick-links"><span>{t.popularPrefix}</span><button onClick={() => setQuery("wireless")}>{t.wireless}</button><button onClick={() => setQuery("phone")}>{t.phoneAccessories}</button><button onClick={() => setQuery("home")}>{t.homeSearch}</button><button onClick={() => setQuery("travel")}>{t.travel}</button></div>
      </section>

      <section className="sv-cinematic-hero" aria-label="Sky View Store featured marketplace">
        <div className="sv-cinematic-watermark" aria-hidden="true"><span>SKY VIEW</span><b>2026</b></div>
        <div className="sv-cinematic-spotlight" aria-hidden="true" />
        <div className="sv-cinematic-inner">
          <div className="sv-cinematic-copy">
            <span className="sv-cinematic-eyebrow"><i /> {t.heroEyebrow}</span>
            <h1>{t.heroTitle}<br /><em>{t.heroTitleAccent}</em></h1>
            <p>{t.heroDescription}</p>
            <div className="sv-cinematic-tabs" role="tablist" aria-label={t.heroEyebrow}>
              <button type="button" role="tab" aria-selected={heroTab === "features"} className={heroTab === "features" ? "active" : ""} onClick={() => setHeroTab("features")}>{t.tabFeatures}</button>
              <button type="button" role="tab" aria-selected={heroTab === "gallery"} className={heroTab === "gallery" ? "active" : ""} onClick={() => setHeroTab("gallery")}>{t.tabGallery}</button>
              <button type="button" role="tab" aria-selected={heroTab === "specs"} className={heroTab === "specs" ? "active" : ""} onClick={() => setHeroTab("specs")}>{t.tabSpecs}</button>
              <button type="button" role="tab" aria-selected={heroTab === "reviews"} className={heroTab === "reviews" ? "active" : ""} onClick={() => setHeroTab("reviews")}>{t.tabReviews}</button>
            </div>
            <div className="sv-cinematic-tab-panel" role="tabpanel" aria-live="polite">
              {heroTab === "features" ? <><b><FiGrid /> {t.featureTitle}</b><span>{t.featureText}</span></> : null}
              {heroTab === "gallery" ? <><b><FiMonitor /> {t.galleryTitle}</b><span>{t.galleryText}</span></> : null}
              {heroTab === "specs" ? <><b><FiSliders /> {t.specsTitle}</b><span>{t.specsText}</span></> : null}
              {heroTab === "reviews" ? <><b><FiStar /> {t.reviewsTitle}</b><span>{t.reviewsText}</span></> : null}
            </div>
            <div className="sv-cinematic-meta"><span>ETB-FIRST SHOPPING</span><span>{t.metaApproved}</span><span>{t.metaNoPayments}</span></div>
          </div>
          <div className="sv-cinematic-showcase" aria-label="Featured marketplace collections">
            <div className="sv-cinematic-orbit sv-orbit-a" /><div className="sv-cinematic-orbit sv-orbit-b" />
            <div className="sv-float-product sv-float-laptop"><StorefrontImage src={DEMO_CATEGORIES[1].image} fallbackSrc={DEMO_CATEGORIES[0].image} alt="Computers and laptop collection" sizes="(max-width: 800px) 48vw, 30vw" /></div>
            <div className="sv-float-product sv-float-vr"><StorefrontImage src={DEMO_CATEGORIES[2].image} fallbackSrc={DEMO_CATEGORIES[1].image} alt="Electronics collection" sizes="(max-width: 800px) 30vw, 18vw" /></div>
            <div className="sv-float-product sv-float-fashion"><StorefrontImage src={DEMO_CATEGORIES[4].image} fallbackSrc={DEMO_CATEGORIES[3].image} alt="Fashion collection" sizes="(max-width: 800px) 34vw, 20vw" /></div>
            <div className="sv-float-product sv-float-home"><StorefrontImage src={DEMO_CATEGORIES[3].image} fallbackSrc={DEMO_CATEGORIES[4].image} alt="Home and lifestyle collection" sizes="(max-width: 800px) 28vw, 17vw" /></div>
            <div className="sv-float-product sv-float-delivery"><StorefrontImage src={DEMO_CATEGORIES[16].image} fallbackSrc={DEMO_CATEGORIES[15].image} alt="Travel and delivery essentials" sizes="(max-width: 800px) 28vw, 17vw" /></div>
            <div className="sv-showcase-caption"><small>CURATED DISCOVERIES / 001</small><b>{t.showcaseCaption}</b></div>
          </div>
          <div className="sv-cinematic-cta"><button type="button" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>{t.ctaLook} <FiArrowUpRight aria-hidden="true" /></button><span>{t.ctaExplore}</span></div>
        </div>
        <div className="sv-cinematic-bottom-tabs" aria-label="Hero highlight selector">
          <button type="button" className={heroTab === "features" ? "active" : ""} onClick={() => setHeroTab("features")}>{t.tabFeatures}</button>
          <button type="button" className={heroTab === "gallery" ? "active" : ""} onClick={() => setHeroTab("gallery")}>{t.tabGallery}</button>
          <button type="button" className={heroTab === "specs" ? "active" : ""} onClick={() => setHeroTab("specs")}>{t.tabSpecs}</button>
          <button type="button" className={heroTab === "reviews" ? "active" : ""} onClick={() => setHeroTab("reviews")}>{t.tabReviews}</button>
        </div>
        <a className="sv-cinematic-more" href="#catalogue"><span /> MORE TO LOVE <b>↓</b></a>
      </section>

      <section className="sv-deals-section" aria-labelledby="sv-deals-heading">
        <div className="sv-deals-heading">
          <div><span className="sv-eyebrow">{t.dealsEyebrow}</span><h2 id="sv-deals-heading">{t.dealsTitle} <em>{t.dealsPreview}</em></h2><p>{t.dealsDescription}</p></div>
          <div className="sv-deal-timer" aria-label="Demo countdown timer"><small>{t.demoTimer}</small><div><b>{String(Math.floor(dealSecondsRemaining / 3600)).padStart(2,"0")}</b><span>:</span><b>{String(Math.floor((dealSecondsRemaining % 3600) / 60)).padStart(2,"0")}</b><span>:</span><b>{String(dealSecondsRemaining % 60).padStart(2,"0")}</b></div></div>
          <Link href="/deals">{t.dealsExplore} ↗</Link>
        </div>
        <div className="sv-deals-grid">
          {DEMO_PRODUCTS.slice(0,4).map((product) => {
            const discount = product.originalPriceETB > product.priceETB ? Math.round((1 - product.priceETB / product.originalPriceETB) * 100) : 0;
            return <article className="sv-deal-card" key={product.id}>
              <Link href={`/demo-product/${product.slug}`} className="sv-deal-image"><StorefrontImage src={product.image} fallbackSrc={DEMO_CATEGORIES[2].image} alt={product.title} sizes="(max-width: 700px) 45vw, 22vw" />{discount > 0 ? <span className="sv-deal-discount">-{discount}%</span> : <span className="sv-deal-discount">DEMO</span>}</Link>
              <div className="sv-deal-info"><small>{product.category}</small><Link href={`/demo-product/${product.slug}`}>{product.title}</Link><b>{formatPrice(product.priceETB,currency,rates,locale)}</b><del>{product.originalPriceETB > product.priceETB ? formatPrice(product.originalPriceETB,currency,rates,locale) : ""}</del></div>
              <button type="button" aria-label={wishlist.includes(product.id) ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`} aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product)}><FiHeart /> {wishlist.includes(product.id) ? t.saved : t.save}</button>
            </article>;
          })}
        </div>
      </section>

      <section className="sv-benefit-strip"><div><b>01</b><span>{t.benefitDiscovery}</span></div><div><b>02</b><span>{t.benefitLocal}</span></div><div><b>03</b><span>{t.benefitSeller}</span></div><div><b>04</b><span>{t.benefitSecure}</span></div></section>

      <section className="sv-category-section">
        <div className="sv-section-heading"><div><span className="sv-eyebrow">{t.categoryEyebrow}</span><h2>{t.categories}</h2></div><Link href="/categories">{t.viewAllCategories} ↗</Link></div>
        <div className="sv-category-grid">
          {categories.slice(0, 8).map((item) => <Link href={`/shop?category=${item.slug}`} className="sv-category-tile" key={item.slug}><StorefrontImage src={item.image} fallbackSrc={DEMO_CATEGORIES[2].image} alt={`${item.name} category`} sizes="(max-width: 640px) 50vw, 25vw" /><span className="sv-category-shade" /><span className="sv-category-name">{t.categoryNames[item.slug as keyof typeof t.categoryNames] ?? item.name}</span><span className="sv-category-arrow">↗</span></Link>)}
        </div>
      </section>

      <section id="catalogue" className="sv-product-section">
        <div className="sv-section-heading"><div><span className="sv-eyebrow">{t.catalogueEyebrow}</span><h2 id="popular">{t.popular}</h2><p>{products.length.toLocaleString()} {t.catalogueDescription}</p></div><Link href="/shop">{t.browse} ↗</Link></div>
        <div className="sv-catalog-controls">
          <div className="sv-filter-pills"><button className={kind === "all" ? "active" : ""} onClick={() => setKind("all")}>{t.all}</button><button className={kind === "demo" ? "active" : ""} onClick={() => setKind("demo")}>{t.demoOnly}</button><button className={kind === "real" ? "active" : ""} onClick={() => setKind("real")}>{t.realOnly}</button></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="All">{t.allCategories}</option>{categories.map((item) => <option key={item.slug} value={item.name}>{t.categoryNames[item.slug as keyof typeof t.categoryNames] ?? item.name}</option>)}<option value="Real products">Real products</option></select>
        </div>
        <div className="sv-product-grid">
          {products.slice(0, 24).map((product) => {
            const href = product.demo && !("databaseBacked" in product && product.databaseBacked) ? `/demo-product/${product.slug}` : `/product/${product.slug}`;
            return <article className="sv-product-card relative" key={product.id}><Link href={href} className="sv-product-image"><StorefrontImage src={product.image} fallbackSrc={DEMO_CATEGORIES[2].image} alt={product.title} sizes="(max-width: 640px) 50vw, 25vw" /><span className={product.demo ? "sv-label-demo" : "sv-label-real"}>{product.demo ? t.demo : t.real}</span></Link><button type="button" aria-label={wishlist.includes(product.id) ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`} aria-pressed={wishlist.includes(product.id)} onClick={() => toggleWishlist(product)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:border-amber-300/70" style={{ color: wishlist.includes(product.id) ? "#fbbf24" : undefined }}><FiHeart /></button><div className="sv-product-info"><small>{t.categoryNames[product.categorySlug as keyof typeof t.categoryNames] ?? product.category}</small><Link href={href} className="sv-product-title">{product.title}</Link><div className="sv-price-row"><b>{formatPrice(product.priceETB, currency, rates, locale)}</b>{product.originalPriceETB > product.priceETB ? <del>{formatPrice(product.originalPriceETB, currency, rates, locale)}</del> : null}</div><span className="sv-demo-note">{product.demo ? t.demoNote : t.realNote}</span></div></article>;
          })}
        </div>
        {products.length === 0 ? <div className="sv-empty">{t.emptyResults}</div> : null}
        <div className="sv-catalog-footer"><span>{rateReady && currency !== "ETB" && !rates[currency] ? t.exchangeUnavailable : currency !== "ETB" ? t.exchangeIndicative : t.pricesETB}</span><Link href="/shop" className="sv-primary-button">{t.browse} ↗</Link></div>
      </section>

      <section className="sv-promo-band"><div><span className="sv-eyebrow">{t.promoEyebrow}</span><h2>{t.promoTitle}</h2><p>{t.promoText}</p></div><Link href="/shop" className="sv-primary-button">{t.startExploring} ↗</Link></section>

      <footer className="sv-market-footer"><div className="sv-brand"><span className="sv-brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="M6 34.5 19.2 13l8.1 13.2 4.3-6.4L42 34.5H6Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M10 38h28M15 30.5l4.2-6.8 4.5 7.2 4-5.9 5.6 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="34.5" cy="11.5" r="3" fill="#fff0c2"/></svg></span><span className="sv-brand-wordmark"><strong>SKY VIEW</strong><b>STORE</b></span></div><p>{t.footerTagline}</p><div><Link href="/about">{t.about}</Link><Link href="/shipping">{t.shipping}</Link><Link href="/returns">{t.returns}</Link><Link href="/privacy">{t.privacy}</Link><Link href="/help">{t.helpCenter}</Link></div><small>© {new Date().getFullYear()} Sky View Store · {t.footerNote}</small></footer>
      <nav className="sv-mobile-nav" aria-label="Mobile navigation"><Link href="/">⌂<span>{t.mobileHome}</span></Link><Link href="/shop">⌕<span>{t.mobileShop}</span></Link><Link href="/categories">▦<span>{t.mobileCategories}</span></Link><Link href="/demo-cart">▣<span>{t.mobileCart}</span></Link><Link href="/account">◎<span>{t.mobileAccount}</span></Link></nav>
    </main>
  );
}
