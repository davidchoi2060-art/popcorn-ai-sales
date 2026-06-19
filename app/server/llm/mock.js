export function getMockRecommendation({ mode }) {
  const isExpert = mode === "expert";

  return {
    recommendation_id: Date.now(),
    sets: [
      {
        type: "value",
        total_price: isExpert ? 3480000 : 850000,
        ai_engine: "Gemini",
        components: {
          cpu: { code: 101001, name: isExpert ? "AMD Ryzen 9 9900X" : "AMD Ryzen 5 7500F", price: isExpert ? 520000 : 190000 },
          gpu: { code: 201001, name: isExpert ? "NVIDIA RTX 4080 SUPER" : "NVIDIA RTX 4060", price: isExpert ? 1520000 : 390000 },
          ram: { code: 301001, name: isExpert ? "DDR5 64GB" : "DDR5 32GB", price: isExpert ? 280000 : 120000 },
          ssd: { code: 401001, name: isExpert ? "NVMe 2TB" : "NVMe 1TB", price: isExpert ? 230000 : 90000 },
          mb: { code: 501001, name: isExpert ? "X670E WiFi" : "B650M WiFi", price: isExpert ? 430000 : 170000 },
          power: { code: 601001, name: isExpert ? "1000W Gold" : "750W Bronze", price: isExpert ? 220000 : 90000 },
          case: { code: 701001, name: isExpert ? "Airflow E-ATX Case" : "Mid Tower Case", price: isExpert ? 280000 : 90000 },
        },
        chart: {
          fps: { fhd: isExpert ? 240 : 144, qhd: isExpert ? 180 : 90 },
          price_ratio: { cpu_gpu: 62, mem_storage: 16, etc: 22 },
        },
        mentoring_reason: "Mock recommendation for local development.",
      },
      {
        type: "recommend",
        total_price: isExpert ? 4140000 : 1250000,
        ai_engine: "Claude",
        components: {
          cpu: { code: 101002, name: isExpert ? "AMD Ryzen 9 9950X" : "AMD Ryzen 5 7600X", price: isExpert ? 580000 : 250000 },
          gpu: { code: 201002, name: isExpert ? "NVIDIA RTX 4090" : "NVIDIA RTX 4070", price: isExpert ? 1850000 : 550000 },
          ram: { code: 301002, name: isExpert ? "DDR5 64GB 6400" : "DDR5 32GB 5600", price: isExpert ? 280000 : 120000 },
          ssd: { code: 401002, name: isExpert ? "NVMe PCIe 5.0 2TB" : "NVMe 1TB", price: isExpert ? 240000 : 100000 },
          mb: { code: 501002, name: isExpert ? "X670E Crosshair" : "B650 WiFi", price: isExpert ? 420000 : 180000 },
          power: { code: 601002, name: isExpert ? "1200W Platinum" : "850W Gold", price: isExpert ? 360000 : 120000 },
          case: { code: 701002, name: isExpert ? "Premium Workstation Case" : "O11 Mini", price: isExpert ? 410000 : 130000 },
        },
        chart: {
          fps: { fhd: isExpert ? 300 : 180, qhd: isExpert ? 220 : 120 },
          price_ratio: { cpu_gpu: 59, mem_storage: 15, etc: 26 },
        },
        mentoring_reason: "Balanced mock recommendation selected as the default set.",
      },
      {
        type: "highend",
        total_price: isExpert ? 5200000 : 1980000,
        ai_engine: "ChatGPT",
        components: {
          cpu: { code: 101003, name: isExpert ? "AMD Threadripper class option" : "AMD Ryzen 7 7800X3D", price: isExpert ? 980000 : 420000 },
          gpu: { code: 201003, name: isExpert ? "NVIDIA RTX 5090 class option" : "NVIDIA RTX 4070 Ti SUPER", price: isExpert ? 2400000 : 930000 },
          ram: { code: 301003, name: isExpert ? "DDR5 128GB" : "DDR5 64GB", price: isExpert ? 560000 : 240000 },
          ssd: { code: 401003, name: isExpert ? "NVMe 4TB" : "NVMe 2TB", price: isExpert ? 420000 : 180000 },
          mb: { code: 501003, name: isExpert ? "Creator E-ATX Board" : "X670 WiFi", price: isExpert ? 520000 : 260000 },
          power: { code: 601003, name: isExpert ? "1600W Titanium" : "1000W Gold", price: isExpert ? 520000 : 180000 },
          case: { code: 701003, name: isExpert ? "Full Tower Case" : "Premium Mid Tower", price: isExpert ? 360000 : 170000 },
        },
        chart: {
          fps: { fhd: isExpert ? 360 : 220, qhd: isExpert ? 280 : 160 },
          price_ratio: { cpu_gpu: 65, mem_storage: 14, etc: 21 },
        },
        mentoring_reason: "High-end mock recommendation for performance-first users.",
      },
    ],
    meta: {
      responded_models: ["gemini", "claude", "chatgpt"],
      dropped_models: [],
      elapsed_ms: 120,
    },
  };
}
