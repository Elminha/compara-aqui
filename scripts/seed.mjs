/**
 * Seed do catálogo do Compara Aqui.
 * Popula: stores, products, offers, priceHistory, specDictionary.
 * Rodar com: DATABASE_URL=... node scripts/seed.mjs
 */
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);
console.log("Connected.");

/* ======= Limpar dados (mantém users) ======= */
await conn.query("SET FOREIGN_KEY_CHECKS = 0");
await conn.query("TRUNCATE TABLE priceHistory");
await conn.query("TRUNCATE TABLE offers");
await conn.query("TRUNCATE TABLE products");
await conn.query("TRUNCATE TABLE stores");
await conn.query("TRUNCATE TABLE specDictionary");
await conn.query("SET FOREIGN_KEY_CHECKS = 1");
console.log("Tabelas limpas.");

/* ======= Lojas ======= */
const stores = [
  { slug: "amazon-br", name: "Amazon",            logoEmoji: "📦", reclameAquiScore: 8.2, proconScore: 8.0, userScore: 8.4, totalReviews: 18450, description: "Marketplace global com ampla oferta e entrega rápida." },
  { slug: "mercado-livre", name: "Mercado Livre", logoEmoji: "🛍️", reclameAquiScore: 7.6, proconScore: 7.2, userScore: 7.8, totalReviews: 25310, description: "Maior marketplace da América Latina." },
  { slug: "magazine-luiza", name: "Magazine Luiza", logoEmoji: "🏬", reclameAquiScore: 7.9, proconScore: 7.5, userScore: 8.0, totalReviews: 14020, description: "Rede brasileira de varejo com forte presença online." },
  { slug: "casas-bahia", name: "Casas Bahia",     logoEmoji: "🏠", reclameAquiScore: 6.1, proconScore: 5.8, userScore: 6.3, totalReviews: 9820,  description: "Varejista tradicional de eletros e móveis." },
  { slug: "fast-shop", name: "Fast Shop",         logoEmoji: "⚡", reclameAquiScore: 7.4, proconScore: 7.0, userScore: 7.5, totalReviews: 4210,  description: "Especializada em eletrônicos premium." },
  { slug: "kabum", name: "KaBuM!",                logoEmoji: "💻", reclameAquiScore: 8.5, proconScore: 8.1, userScore: 8.6, totalReviews: 11220, description: "Referência em tecnologia e informática." },
  { slug: "ponto", name: "Ponto",                 logoEmoji: "🏷️", reclameAquiScore: 5.9, proconScore: 5.5, userScore: 6.1, totalReviews: 7140,  description: "Rede de varejo com ampla rede física." },
  { slug: "tech-deal", name: "TechDeal",          logoEmoji: "🎯", reclameAquiScore: 4.1, proconScore: 3.8, userScore: 4.3, totalReviews: 820,   description: "Loja com histórico de reclamações pendentes." },
];

for (const s of stores) {
  await conn.query(
    "INSERT INTO stores (slug, name, logoEmoji, reclameAquiScore, proconScore, userScore, totalReviews, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [s.slug, s.name, s.logoEmoji, s.reclameAquiScore, s.proconScore, s.userScore, s.totalReviews, s.description],
  );
}
const [storeRows] = await conn.query("SELECT id, slug FROM stores");
const storeBySlug = Object.fromEntries(storeRows.map((r) => [r.slug, r.id]));
console.log(`Lojas: ${storeRows.length}`);

/* ======= Dicionário de jargão técnico ======= */
const dictionary = [
  ["Snapdragon 8 Gen 3", "Processador topo de linha da Qualcomm, excelente para jogos pesados e multitarefa."],
  ["Snapdragon 7 Gen 3", "Processador intermediário rápido, bom para uso diário e jogos medianos."],
  ["A17 Pro", "Chip topo de linha da Apple, muito eficiente em bateria e performance."],
  ["Dimensity 9300", "Processador topo da MediaTek, competitivo com o Snapdragon em jogos."],
  ["Dimensity 7200", "Processador intermediário da MediaTek, bom para tarefas do dia a dia."],
  ["Exynos 2400", "Processador da Samsung, desempenho similar ao Snapdragon 8 Gen 3 em muitas tarefas."],
  ["AMOLED", "Tela com cores vivas e pretos perfeitos, consome menos bateria em modo escuro."],
  ["LCD IPS", "Tela com cores naturais e bom custo, porém pretos menos profundos que AMOLED."],
  ["120Hz", "Tela super fluida: animações e jogos ficam bem mais suaves do que em 60Hz."],
  ["90Hz", "Tela fluida, perceptivelmente mais suave que a padrão de 60Hz."],
  ["60Hz", "Taxa de atualização padrão, suficiente para uso comum."],
  ["IP68", "Resistente a poeira e pode ficar submerso em até 1,5m de água por 30 minutos."],
  ["IP67", "Resistente a poeira e respingos, aguenta submersão leve."],
  ["5G", "Internet móvel muito mais rápida que o 4G, onde houver cobertura."],
  ["OLED 4K", "Tela de altíssima qualidade: pretos perfeitos, cores vibrantes e resolução 4K."],
  ["QLED 4K", "Tela brilhante com cores vivas, ideal para ambientes iluminados."],
  ["Mini-LED", "Evolução do LED: mais brilho e contraste, próximo ao OLED em qualidade."],
  ["HDR10+", "Cores e contraste aprimorados em filmes e séries compatíveis."],
  ["Dolby Vision", "Padrão HDR premium, usado em conteúdos de streaming e Blu-ray."],
  ["Intel Core i5 13ª geração", "Processador intermediário moderno, bom para estudo e trabalho."],
  ["Intel Core i7 13ª geração", "Processador potente, excelente para edição de vídeo e multitarefa pesada."],
  ["AMD Ryzen 5 7000", "Processador intermediário da AMD, forte concorrente do Core i5."],
  ["AMD Ryzen 7 7000", "Processador potente, ideal para tarefas pesadas."],
  ["Apple M3", "Chip da Apple muito eficiente: performance alta com bateria longa."],
  ["SSD NVMe", "Armazenamento bem mais rápido que HDs comuns; o sistema abre em segundos."],
  ["16GB RAM", "Memória suficiente para multitarefa pesada e uso profissional."],
  ["8GB RAM", "Memória suficiente para uso cotidiano e trabalho leve."],
  ["Inverter", "Compressor mais econômico e silencioso, com menos vibração."],
  ["Frost Free", "Geladeira que não forma gelo no congelador; menos manutenção."],
  ["Classe A", "Selo Procel de alta eficiência energética: consome menos luz."],
];
for (const [term, plain] of dictionary) {
  await conn.query("INSERT INTO specDictionary (term, plainLanguage) VALUES (?, ?)", [term, plain]);
}
console.log(`Dicionário: ${dictionary.length}`);

/* ======= Produtos (catálogo real) ======= */
const products = [
  /* === SMARTPHONES === */
  {
    slug: "iphone-15-pro-256gb",
    name: "Apple iPhone 15 Pro 256GB Titânio Natural",
    brand: "Apple",
    category: "smartphones",
    shortDescription: "Flagship da Apple com chip A17 Pro, câmera de 48MP e corpo em titânio.",
    imageEmoji: "📱",
    referencePrice: 8999.0,
    specs: {
      "Processador": "A17 Pro",
      "Tela": "6,1\" OLED ProMotion 120Hz",
      "Memória RAM": "8GB RAM",
      "Armazenamento": "256GB",
      "Câmera Principal": "48MP + 12MP ultrawide + 12MP tele 3x",
      "Bateria": "3274 mAh",
      "Resistência": "IP68",
      "Conectividade": "5G",
    },
    promoMonths: [5, 11, 1],
    popularity: 98,
  },
  {
    slug: "samsung-galaxy-s24-ultra-512gb",
    name: "Samsung Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    category: "smartphones",
    shortDescription: "Topo de linha Samsung com S Pen, câmera de 200MP e Inteligência Artificial Galaxy AI.",
    imageEmoji: "📱",
    referencePrice: 9499.0,
    specs: {
      "Processador": "Snapdragon 8 Gen 3",
      "Tela": "6,8\" AMOLED 120Hz",
      "Memória RAM": "12GB RAM",
      "Armazenamento": "512GB",
      "Câmera Principal": "200MP + 50MP tele 5x + 10MP tele 3x + 12MP ultrawide",
      "Bateria": "5000 mAh",
      "Resistência": "IP68",
      "Conectividade": "5G",
    },
    promoMonths: [5, 11, 1],
    popularity: 96,
  },
  {
    slug: "motorola-edge-50-fusion-256gb",
    name: "Motorola Edge 50 Fusion 256GB",
    brand: "Motorola",
    category: "smartphones",
    shortDescription: "Intermediário premium com tela curva, câmera de 50MP e carregamento TurboPower 68W.",
    imageEmoji: "📱",
    referencePrice: 2799.0,
    specs: {
      "Processador": "Snapdragon 7 Gen 3",
      "Tela": "6,7\" AMOLED 144Hz",
      "Memória RAM": "8GB RAM",
      "Armazenamento": "256GB",
      "Câmera Principal": "50MP + 13MP ultrawide",
      "Bateria": "5000 mAh",
      "Resistência": "IP68",
      "Conectividade": "5G",
    },
    promoMonths: [11, 12, 5],
    popularity: 78,
  },
  {
    slug: "xiaomi-redmi-note-13-pro-256gb",
    name: "Xiaomi Redmi Note 13 Pro 256GB",
    brand: "Xiaomi",
    category: "smartphones",
    shortDescription: "Câmera de 200MP, tela AMOLED 120Hz e carregamento turbo de 67W.",
    imageEmoji: "📱",
    referencePrice: 2199.0,
    specs: {
      "Processador": "Snapdragon 7s Gen 2",
      "Tela": "6,67\" AMOLED 120Hz",
      "Memória RAM": "8GB RAM",
      "Armazenamento": "256GB",
      "Câmera Principal": "200MP + 8MP ultrawide + 2MP macro",
      "Bateria": "5100 mAh",
      "Resistência": "IP54",
      "Conectividade": "4G",
    },
    promoMonths: [11, 7, 3],
    popularity: 88,
  },
  {
    slug: "samsung-galaxy-a55-256gb",
    name: "Samsung Galaxy A55 5G 256GB",
    brand: "Samsung",
    category: "smartphones",
    shortDescription: "Intermediário com moldura de alumínio, câmera 50MP e 4 anos de atualizações.",
    imageEmoji: "📱",
    referencePrice: 2499.0,
    specs: {
      "Processador": "Exynos 1480",
      "Tela": "6,6\" AMOLED 120Hz",
      "Memória RAM": "8GB RAM",
      "Armazenamento": "256GB",
      "Câmera Principal": "50MP + 12MP ultrawide + 5MP macro",
      "Bateria": "5000 mAh",
      "Resistência": "IP67",
      "Conectividade": "5G",
    },
    promoMonths: [11, 5, 9],
    popularity: 82,
  },

  /* === NOTEBOOKS === */
  {
    slug: "macbook-air-m3-13-256gb",
    name: "Apple MacBook Air M3 13\" 256GB 8GB",
    brand: "Apple",
    category: "notebooks",
    shortDescription: "Ultrafino com chip Apple M3, 18h de bateria e tela Liquid Retina.",
    imageEmoji: "💻",
    referencePrice: 10999.0,
    specs: {
      "Processador": "Apple M3",
      "Tela": "13,6\" Liquid Retina 60Hz",
      "Memória RAM": "8GB RAM",
      "Armazenamento": "256GB SSD NVMe",
      "Placa de Vídeo": "GPU integrada Apple 8-core",
      "Bateria": "Até 18h",
      "Sistema": "macOS Sonoma",
      "Peso": "1,24 kg",
    },
    promoMonths: [11, 3, 7],
    popularity: 92,
  },
  {
    slug: "dell-inspiron-15-3520-i5",
    name: "Dell Inspiron 15 3520 i5 16GB 512GB",
    brand: "Dell",
    category: "notebooks",
    shortDescription: "Notebook versátil para trabalho e estudo, com Intel Core i5 e SSD rápido.",
    imageEmoji: "💻",
    referencePrice: 4299.0,
    specs: {
      "Processador": "Intel Core i5 13ª geração",
      "Tela": "15,6\" LCD IPS 60Hz",
      "Memória RAM": "16GB RAM",
      "Armazenamento": "512GB SSD NVMe",
      "Placa de Vídeo": "Intel Iris Xe Graphics",
      "Bateria": "Até 7h",
      "Sistema": "Windows 11 Home",
      "Peso": "1,65 kg",
    },
    promoMonths: [11, 3, 1],
    popularity: 80,
  },
  {
    slug: "lenovo-ideapad-3i-i7",
    name: "Lenovo IdeaPad 3i i7 16GB 512GB",
    brand: "Lenovo",
    category: "notebooks",
    shortDescription: "Produtivo com Core i7 de 13ª geração e leitor biométrico.",
    imageEmoji: "💻",
    referencePrice: 5199.0,
    specs: {
      "Processador": "Intel Core i7 13ª geração",
      "Tela": "15,6\" LCD IPS 60Hz",
      "Memória RAM": "16GB RAM",
      "Armazenamento": "512GB SSD NVMe",
      "Placa de Vídeo": "Intel Iris Xe Graphics",
      "Bateria": "Até 8h",
      "Sistema": "Windows 11 Home",
      "Peso": "1,70 kg",
    },
    promoMonths: [11, 3, 9],
    popularity: 74,
  },
  {
    slug: "acer-nitro-5-ryzen-7-rtx-4060",
    name: "Acer Nitro 5 Ryzen 7 RTX 4060 16GB 1TB",
    brand: "Acer",
    category: "notebooks",
    shortDescription: "Notebook gamer com RTX 4060 e tela 165Hz para jogos em alta.",
    imageEmoji: "💻",
    referencePrice: 7799.0,
    specs: {
      "Processador": "AMD Ryzen 7 7000",
      "Tela": "15,6\" LCD IPS 165Hz",
      "Memória RAM": "16GB RAM",
      "Armazenamento": "1TB SSD NVMe",
      "Placa de Vídeo": "NVIDIA RTX 4060 8GB",
      "Bateria": "Até 5h",
      "Sistema": "Windows 11 Home",
      "Peso": "2,5 kg",
    },
    promoMonths: [11, 12, 7],
    popularity: 70,
  },

  /* === TVs === */
  {
    slug: "lg-oled-evo-c3-55",
    name: "LG OLED evo C3 55\" 4K 120Hz",
    brand: "LG",
    category: "tvs",
    shortDescription: "TV OLED com brilho aprimorado, 120Hz nativo e Dolby Vision IQ.",
    imageEmoji: "📺",
    referencePrice: 7999.0,
    specs: {
      "Tela": "55\" OLED 4K 120Hz",
      "HDR": "Dolby Vision",
      "Processador": "α9 Gen6 AI Processor",
      "Sistema": "webOS 23",
      "HDMI": "4x HDMI 2.1",
      "Som": "40W 2.2ch com Dolby Atmos",
      "Conectividade": "Wi-Fi 6, Bluetooth 5.0",
    },
    promoMonths: [11, 6, 3],
    popularity: 85,
  },
  {
    slug: "samsung-qled-q80c-65",
    name: "Samsung QLED Q80C 65\" 4K 120Hz",
    brand: "Samsung",
    category: "tvs",
    shortDescription: "QLED com tecnologia Direct Full Array e processador Neural Quantum 4K.",
    imageEmoji: "📺",
    referencePrice: 7499.0,
    specs: {
      "Tela": "65\" QLED 4K 120Hz",
      "HDR": "HDR10+",
      "Processador": "Neural Quantum Processor 4K",
      "Sistema": "Tizen OS",
      "HDMI": "4x HDMI 2.1",
      "Som": "40W 2.2ch com Object Tracking Sound",
      "Conectividade": "Wi-Fi 5, Bluetooth 5.2",
    },
    promoMonths: [11, 6, 1],
    popularity: 80,
  },
  {
    slug: "tcl-mini-led-c755-55",
    name: "TCL Mini-LED C755 55\" 4K 144Hz",
    brand: "TCL",
    category: "tvs",
    shortDescription: "Mini-LED com alto brilho e 144Hz nativo, ótima para jogos.",
    imageEmoji: "📺",
    referencePrice: 5299.0,
    specs: {
      "Tela": "55\" Mini-LED 4K 144Hz",
      "HDR": "Dolby Vision",
      "Processador": "AiPQ Processor 3.0",
      "Sistema": "Google TV",
      "HDMI": "4x HDMI 2.1",
      "Som": "60W 2.1ch com Dolby Atmos",
      "Conectividade": "Wi-Fi 6, Bluetooth 5.2",
    },
    promoMonths: [11, 12, 6],
    popularity: 68,
  },
  {
    slug: "aoc-smart-led-50",
    name: "AOC Smart TV LED 50\" 4K",
    brand: "AOC",
    category: "tvs",
    shortDescription: "TV 4K acessível com Google TV e HDR10.",
    imageEmoji: "📺",
    referencePrice: 2399.0,
    specs: {
      "Tela": "50\" LED 4K 60Hz",
      "HDR": "HDR10",
      "Processador": "Quad Core",
      "Sistema": "Google TV",
      "HDMI": "3x HDMI 2.0",
      "Som": "20W 2.0ch",
      "Conectividade": "Wi-Fi 5, Bluetooth 5.0",
    },
    promoMonths: [11, 6, 1],
    popularity: 72,
  },

  /* === ELETRODOMESTICOS === */
  {
    slug: "geladeira-brastemp-frost-free-375l",
    name: "Geladeira Brastemp Frost Free Inverse 375L",
    brand: "Brastemp",
    category: "eletrodomesticos",
    shortDescription: "Frost Free duplex com tecnologia Inverter e Turbo Ice.",
    imageEmoji: "🧊",
    referencePrice: 3899.0,
    specs: {
      "Capacidade": "375 litros",
      "Tipo": "Frost Free",
      "Compressor": "Inverter",
      "Eficiência": "Classe A",
      "Voltagem": "110V / 220V",
      "Altura": "185 cm",
      "Consumo": "37 kWh/mês",
    },
    promoMonths: [11, 5, 1],
    popularity: 76,
  },
  {
    slug: "lava-e-seca-lg-11kg",
    name: "Lava e Seca LG VC4 11kg Inverter",
    brand: "LG",
    category: "eletrodomesticos",
    shortDescription: "Lavadora e secadora com motor Inverter Direct Drive e Wi-Fi.",
    imageEmoji: "🧺",
    referencePrice: 4499.0,
    specs: {
      "Capacidade Lavagem": "11 kg",
      "Capacidade Secagem": "7 kg",
      "Motor": "Inverter Direct Drive",
      "Eficiência": "Classe A",
      "Programas": "14 programas",
      "Conectividade": "Wi-Fi (ThinQ)",
      "Voltagem": "127V / 220V",
    },
    promoMonths: [11, 5, 7],
    popularity: 70,
  },
  {
    slug: "microondas-electrolux-mb38g-32l",
    name: "Micro-ondas Electrolux MB38G 32L Inox",
    brand: "Electrolux",
    category: "eletrodomesticos",
    shortDescription: "Grill e menu pré-programado com 32L de capacidade.",
    imageEmoji: "♨️",
    referencePrice: 899.0,
    specs: {
      "Capacidade": "32 litros",
      "Potência": "900W",
      "Funções": "Grill + 15 menus automáticos",
      "Eficiência": "Classe A",
      "Voltagem": "127V / 220V",
      "Cor": "Inox",
    },
    promoMonths: [11, 5, 12],
    popularity: 66,
  },
  {
    slug: "ar-condicionado-samsung-wind-free-12000",
    name: "Ar-Condicionado Samsung WindFree 12.000 BTUs Inverter",
    brand: "Samsung",
    category: "eletrodomesticos",
    shortDescription: "WindFree com distribuição silenciosa e compressor Digital Inverter.",
    imageEmoji: "❄️",
    referencePrice: 3699.0,
    specs: {
      "Capacidade": "12.000 BTUs",
      "Tipo": "Split Inverter",
      "Tecnologia": "WindFree",
      "Eficiência": "Classe A",
      "Voltagem": "220V",
      "Conectividade": "Wi-Fi (SmartThings)",
      "Ruído": "37 dB",
    },
    promoMonths: [10, 11, 9],
    popularity: 74,
  },
];

const productIdBySlug = {};
for (const p of products) {
  const [r] = await conn.query(
    "INSERT INTO products (slug, name, brand, category, shortDescription, imageEmoji, referencePrice, specs, promoMonths, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?)",
    [
      p.slug, p.name, p.brand, p.category, p.shortDescription, p.imageEmoji, p.referencePrice,
      JSON.stringify(p.specs), JSON.stringify(p.promoMonths), p.popularity,
    ],
  );
  productIdBySlug[p.slug] = r.insertId;
}
console.log(`Produtos: ${products.length}`);

/* ======= Ofertas e histórico ======= */
const offerPlans = {
  // Cada produto recebe ofertas em várias lojas, com fatores relativos ao referencePrice.
  // Inclui ao menos 1 caso de "desconto falso" (listPrice muito acima da média histórica).
  "iphone-15-pro-256gb": [
    { store: "amazon-br",      factor: 0.92, shipping: 0,   days: 3,  warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.94, shipping: 29.9, days: 5, warranty: 12, fakeList: 1.25 }, // desconto falso
    { store: "fast-shop",      factor: 0.97, shipping: 0,   days: 6,  warranty: 18, fakeList: null },
    { store: "mercado-livre",  factor: 0.91, shipping: 39.9, days: 7, warranty: 12, fakeList: null },
    { store: "tech-deal",      factor: 0.88, shipping: 49.9, days: 15, warranty: 3, fakeList: 1.35 },
  ],
  "samsung-galaxy-s24-ultra-512gb": [
    { store: "amazon-br",      factor: 0.89, shipping: 0,   days: 4,  warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.91, shipping: 0,   days: 6,  warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.95, shipping: 39.9, days: 9, warranty: 12, fakeList: 1.28 },
    { store: "mercado-livre",  factor: 0.88, shipping: 0,   days: 5,  warranty: 12, fakeList: null },
  ],
  "motorola-edge-50-fusion-256gb": [
    { store: "amazon-br",      factor: 0.94, shipping: 0,   days: 4,  warranty: 12, fakeList: null },
    { store: "mercado-livre",  factor: 0.91, shipping: 19.9, days: 5, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.96, shipping: 0,   days: 7,  warranty: 12, fakeList: null },
    { store: "ponto",          factor: 0.99, shipping: 29.9, days: 9, warranty: 12, fakeList: 1.22 },
  ],
  "xiaomi-redmi-note-13-pro-256gb": [
    { store: "amazon-br",      factor: 0.92, shipping: 19.9, days: 6, warranty: 12, fakeList: null },
    { store: "mercado-livre",  factor: 0.89, shipping: 0,    days: 5, warranty: 12, fakeList: null },
    { store: "kabum",          factor: 0.9,  shipping: 0,    days: 4, warranty: 12, fakeList: null },
    { store: "tech-deal",      factor: 0.85, shipping: 39.9, days: 18, warranty: 3, fakeList: 1.4 },
  ],
  "samsung-galaxy-a55-256gb": [
    { store: "magazine-luiza", factor: 0.93, shipping: 0,   days: 5,  warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.95, shipping: 0,   days: 4,  warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.98, shipping: 19.9, days: 9, warranty: 12, fakeList: 1.2 },
  ],
  "macbook-air-m3-13-256gb": [
    { store: "fast-shop",      factor: 0.96, shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.94, shipping: 0,   days: 4, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.98, shipping: 0,   days: 6, warranty: 12, fakeList: 1.18 },
    { store: "mercado-livre",  factor: 0.93, shipping: 0,   days: 7, warranty: 12, fakeList: null },
  ],
  "dell-inspiron-15-3520-i5": [
    { store: "kabum",          factor: 0.92, shipping: 0,   days: 4, warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.94, shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.96, shipping: 19.9, days: 6, warranty: 12, fakeList: null },
    { store: "ponto",          factor: 0.99, shipping: 39.9, days: 10, warranty: 12, fakeList: 1.24 },
  ],
  "lenovo-ideapad-3i-i7": [
    { store: "kabum",          factor: 0.9,  shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.93, shipping: 0,   days: 6, warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.95, shipping: 0,   days: 5, warranty: 12, fakeList: null },
  ],
  "acer-nitro-5-ryzen-7-rtx-4060": [
    { store: "kabum",          factor: 0.91, shipping: 0,   days: 4, warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.94, shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "tech-deal",      factor: 0.87, shipping: 79.9, days: 20, warranty: 3, fakeList: 1.33 },
  ],
  "lg-oled-evo-c3-55": [
    { store: "fast-shop",      factor: 0.95, shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.93, shipping: 0,   days: 7, warranty: 12, fakeList: 1.2 },
    { store: "amazon-br",      factor: 0.92, shipping: 0,   days: 6, warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.98, shipping: 99.9, days: 10, warranty: 12, fakeList: null },
  ],
  "samsung-qled-q80c-65": [
    { store: "magazine-luiza", factor: 0.92, shipping: 0,   days: 6, warranty: 12, fakeList: null },
    { store: "fast-shop",      factor: 0.95, shipping: 0,   days: 5, warranty: 18, fakeList: null },
    { store: "amazon-br",      factor: 0.93, shipping: 0,   days: 7, warranty: 12, fakeList: null },
    { store: "ponto",          factor: 0.99, shipping: 89.9, days: 12, warranty: 12, fakeList: 1.25 },
  ],
  "tcl-mini-led-c755-55": [
    { store: "amazon-br",      factor: 0.9,  shipping: 0,   days: 6, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.94, shipping: 0,   days: 7, warranty: 12, fakeList: null },
    { store: "kabum",          factor: 0.92, shipping: 0,   days: 5, warranty: 12, fakeList: null },
  ],
  "aoc-smart-led-50": [
    { store: "magazine-luiza", factor: 0.95, shipping: 0,   days: 5, warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.98, shipping: 59.9, days: 8, warranty: 12, fakeList: 1.22 },
    { store: "amazon-br",      factor: 0.96, shipping: 0,   days: 6, warranty: 12, fakeList: null },
  ],
  "geladeira-brastemp-frost-free-375l": [
    { store: "magazine-luiza", factor: 0.93, shipping: 0,   days: 7,  warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.96, shipping: 89.9, days: 10, warranty: 12, fakeList: null },
    { store: "amazon-br",      factor: 0.95, shipping: 0,   days: 8,  warranty: 12, fakeList: null },
    { store: "ponto",          factor: 0.98, shipping: 99.9, days: 12, warranty: 12, fakeList: 1.27 },
  ],
  "lava-e-seca-lg-11kg": [
    { store: "fast-shop",      factor: 0.94, shipping: 0,    days: 6, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.95, shipping: 0,    days: 8, warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.97, shipping: 79.9, days: 9, warranty: 12, fakeList: 1.2 },
  ],
  "microondas-electrolux-mb38g-32l": [
    { store: "amazon-br",      factor: 0.92, shipping: 0,    days: 5, warranty: 12, fakeList: null },
    { store: "magazine-luiza", factor: 0.95, shipping: 0,    days: 6, warranty: 12, fakeList: null },
    { store: "casas-bahia",    factor: 0.98, shipping: 29.9, days: 8, warranty: 12, fakeList: null },
  ],
  "ar-condicionado-samsung-wind-free-12000": [
    { store: "magazine-luiza", factor: 0.93, shipping: 0,    days: 7, warranty: 12, fakeList: null },
    { store: "fast-shop",      factor: 0.96, shipping: 0,    days: 5, warranty: 18, fakeList: null },
    { store: "casas-bahia",    factor: 0.99, shipping: 99.9, days: 9, warranty: 12, fakeList: 1.22 },
  ],
};

/**
 * Gera histórico de preços dos últimos 180 dias para cada oferta,
 * simulando volatilidade e injetando "desconto falso" antes da oferta atual.
 */
function round2(v) { return Math.round(v * 100) / 100; }

const DAYS = 180;
const now = Date.now();
let historyCount = 0;
let offerCount = 0;

for (const slug in offerPlans) {
  const productId = productIdBySlug[slug];
  const ref = products.find((p) => p.slug === slug).referencePrice;

  for (const plan of offerPlans[slug]) {
    const storeId = storeBySlug[plan.store];
    const base = ref * plan.factor;
    const currentPrice = round2(base);
    const listPrice = plan.fakeList ? round2(ref * plan.fakeList) : null;

    const [r] = await conn.query(
      "INSERT INTO offers (productId, storeId, currentPrice, shippingCost, deliveryDays, warrantyMonths, listPrice, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [productId, storeId, currentPrice, plan.shipping, plan.days, plan.warranty, listPrice, `https://example.com/${plan.store}/${slug}`],
    );
    offerCount++;

    // Histórico: amostras a cada ~6 dias
    const samples = [];
    for (let d = DAYS; d >= 0; d -= 6) {
      const t = new Date(now - d * 24 * 3600 * 1000);
      // Onda suave + ruído + efeito Black Friday em novembro
      const angle = (d / DAYS) * Math.PI * 2;
      const seasonal = Math.sin(angle + slug.length) * 0.04;
      const noise = (Math.sin(d * 1.37 + slug.length * 0.9) + Math.cos(d * 0.71)) * 0.012;
      let factor = 1 + seasonal + noise;
      const month = t.getMonth() + 1;
      if (month === 11 && d > 20) factor -= 0.1; // dip Black Friday passada
      if (month === 5 && d > 40) factor -= 0.07; // Dia das Mães

      let price = round2(base * factor);
      if (price < base * 0.82) price = round2(base * 0.82);
      samples.push([productId, storeId, price, t]);
    }

    // "Desconto falso": se fakeList, injeta pico 2-3 semanas atrás acima do atual
    if (plan.fakeList) {
      const spikePrice = round2(base * 1.22);
      const spikeDate = new Date(now - 18 * 24 * 3600 * 1000);
      samples.push([productId, storeId, spikePrice, spikeDate]);
    }

    // Valor atual no final
    samples.push([productId, storeId, currentPrice, new Date(now)]);

    // Insere
    for (const s of samples) {
      await conn.query(
        "INSERT INTO priceHistory (productId, storeId, price, recordedAt) VALUES (?, ?, ?, ?)",
        s,
      );
      historyCount++;
    }
  }
}
console.log(`Ofertas: ${offerCount} | Histórico: ${historyCount} pontos`);

await conn.end();
console.log("Seed concluído.");
