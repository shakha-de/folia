export type Tree = {
  slug: string;
  commonName: string;
  scientificName: string;
  family: string;
  regions: string[];
  waterNeed: "low" | "medium" | "high";
  height: string;
  spread: string;
  summary: string;
  description: string;
  tags: string[];
  climate: string;
  image: string;
  imageAuthor: string;
  imageAlt: string;
  care: string[];
  threats: string[];
  wikipediaArticle: string;
};

export const trees: Tree[] = [
  {
    slug: "siberian-elm",
    commonName: "Siberian Elm",
    scientificName: "Ulmus pumila",
    family: "Ulmaceae",
    regions: ["Central Asia", "Steppe cities"],
    waterNeed: "low",
    height: "12-20 m",
    spread: "10-15 m",
    summary: "Fast-growing, drought-tolerant elm suited for arid streets when managed well.",
    description:
      "Tolerates heat and wind, offering quick canopy in dry cities. Needs structured pruning to avoid weak crotches and regular monitoring for pests.",
    tags: ["drought-hardy", "street-safe", "fast canopy"],
    climate: "Hot dry summers, cold winters",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Ulmus_pumila_leaves.jpg",
    imageAuthor: "By Melburnian - Self-photographed, CC BY 2.5, https://commons.wikimedia.org/w/index.php?curid=1355203",
    imageAlt: "Mature elm tree with wide canopy in sunlight",
    care: [
      "Deep water every 10–14 days in summer for young trees; taper after year 3.",
      "Structural pruning in years 2–4 to prevent weak forks.",
      "Mulch 5–8 cm to reduce evaporation and soil heat.",
    ],
    threats: ["Elm leaf beetle", "Storm breakage if unpruned"],
    wikipediaArticle: "https://en.wikipedia.org/wiki/Ulmus_pumila"
  },
  {
    slug: "honey-locust",
    commonName: "Honey Locust",
    scientificName: "Gleditsia triacanthos var. inermis",
    family: "Fabaceae",
    regions: ["Temperate", "Semi-arid"],
    waterNeed: "medium",
    height: "12-18 m",
    spread: "10-15 m",
    summary: "Light, dappled shade; fixes nitrogen and handles urban compaction.",
    description:
      "Great for streets and courtyards. Its fine leaflets give cooling without heavy litter. Choose thornless cultivars for public spaces.",
    tags: ["street-safe", "light shade", "nitrogen fixer"],
    climate: "Hot summers, cold winters",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f2/Gleditsia_triacanthos_%28Honeylocust%29_%2838246396371%29.jpg",
    imageAuthor: "By Plant Image Library from Boston, USA - Gleditsia triacanthos (Honeylocust), CC BY-SA 2.0, https://commons.wikimedia.org/w/index.php?curid=84938405",
    imageAlt: "Sunlit tree canopy with dappled light",
    care: [
      "Deep water weekly in first 2 summers; then every 2–3 weeks in heat.",
      "Formative pruning to keep strong central leader.",
      "Inspect for webworm; remove early nests.",
    ],
    threats: ["Webworm", "Canker on stressed trees"],
    wikipediaArticle: "https://en.wikipedia.org/wiki/Honey_locust"
  },
  {
    slug: "pistache",
    commonName: "Chinese Pistache",
    scientificName: "Pistacia chinensis",
    family: "Anacardiaceae",
    regions: ["Mediterranean", "Semi-arid"],
    waterNeed: "low",
    height: "9-15 m",
    spread: "9-12 m",
    summary: "Colorful fall display, strong drought tolerance once established.",
    description:
      "Excellent for boulevards and plazas. Thrives in heat, with deep roots that help sidewalk stability when planted with space.",
    tags: ["drought-hardy", "fall color", "urban tough"],
    climate: "Hot dry summers, mild to cold winters",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Pistacia_chinensis.jpg/960px-Pistacia_chinensis.jpg?20060303190448",
    imageAuthor: "Public Domain, https://commons.wikimedia.org/w/index.php?curid=610482",
    imageAlt: "Tree with bright red-orange autumn foliage",
    care: [
      "Water weekly first summer; biweekly second; then only during long droughts.",
      "Mulch and keep trunk flare exposed to avoid rot.",
      "Prune lightly in winter to maintain balanced scaffold branches.",
    ],
    threats: ["Root rot in poorly drained soils"],
    wikipediaArticle: "https://en.wikipedia.org/wiki/Pistacia_chinensis"
  },
];
