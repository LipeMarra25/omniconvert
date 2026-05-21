const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 8
});

const linearCategories = [
  {
    id: "length",
    name: "Comprimento",
    group: "Converter",
    units: {
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.344,
      "nautical mile": 1852
    }
  },
  {
    id: "mass",
    name: "Massa / Peso",
    group: "Converter",
    units: {
      mg: 0.000001,
      g: 0.001,
      kg: 1,
      ton: 1000,
      lb: 0.45359237,
      oz: 0.028349523125,
      stone: 6.35029318
    }
  },
  {
    id: "volume",
    name: "Volume",
    group: "Converter",
    units: {
      ml: 0.001,
      l: 1,
      "m³": 1000,
      gallon: 3.785411784,
      pint: 0.473176473,
      quart: 0.946352946,
      cup: 0.24
    }
  },
  {
    id: "area",
    name: "Área",
    group: "Converter",
    units: {
      "m²": 1,
      "km²": 1000000,
      hectare: 10000,
      acre: 4046.8564224,
      "ft²": 0.09290304
    }
  },
  {
    id: "speed",
    name: "Velocidade",
    group: "Converter",
    units: {
      "km/h": 0.2777777778,
      mph: 0.44704,
      "m/s": 1,
      knot: 0.5144444444
    }
  },
  {
    id: "time",
    name: "Tempo",
    group: "Converter",
    units: {
      ms: 0.001,
      sec: 1,
      min: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629800,
      year: 31557600
    }
  },
  {
    id: "energy",
    name: "Energia",
    group: "Científico",
    units: {
      joule: 1,
      calorie: 4.184,
      kcal: 4184,
      "watt-hour": 3600,
      kWh: 3600000
    }
  },
  {
    id: "power",
    name: "Potência",
    group: "Científico",
    units: {
      watt: 1,
      kW: 1000,
      hp: 745.699872
    }
  },
  {
    id: "pressure",
    name: "Pressão",
    group: "Científico",
    units: {
      pascal: 1,
      bar: 100000,
      psi: 6894.757293,
      atm: 101325
    }
  },
  {
    id: "digital",
    name: "Dados Digitais",
    group: "Dados e Tecnologia",
    units: {
      bit: 0.125,
      byte: 1,
      KB: 1024,
      MB: 1048576,
      GB: 1073741824,
      TB: 1099511627776
    }
  },
  {
    id: "cooking",
    name: "Cozinha",
    group: "Converter",
    units: {
      colher: 15,
      xícara: 240,
      litro: 1000,
      ml: 1,
      gramas: 1
    }
  },
  {
    id: "currency",
    name: "Moedas",
    group: "Moedas",
    units: {
      BRL: 1,
      USD: 5.12,
      EUR: 5.58,
      GBP: 6.54,
      JPY: 0.033,
      CAD: 3.75,
      CHF: 5.74,
      AUD: 3.39
    }
  }
].map((category) => ({
  ...category,
  type: "linear",
  unitList: Object.keys(category.units)
}));

export const categories = [
  ...linearCategories,
  {
    id: "temperature",
    name: "Temperatura",
    group: "Converter",
    type: "temperature",
    unitList: ["celsius", "fahrenheit", "kelvin"]
  },
  {
    id: "bases",
    name: "Bases Numéricas",
    group: "Bases Numéricas",
    type: "base",
    unitList: ["binário", "decimal", "hexadecimal", "octal"]
  },
  {
    id: "text",
    name: "Códigos / Texto",
    group: "Dados e Tecnologia",
    type: "text",
    unitList: ["ASCII", "Unicode", "Base64 encode", "Base64 decode", "URL encode", "URL decode"]
  },
  {
    id: "colors",
    name: "Cores",
    group: "Dados e Tecnologia",
    type: "color",
    unitList: ["HEX", "RGB", "HSL", "RGBA"]
  },
  {
    id: "dates",
    name: "Tempo e Datas",
    group: "Dados e Tecnologia",
    type: "date",
    unitList: ["timestamp", "UTC", "local time", "duração"]
  },
  {
    id: "scientific",
    name: "Científico",
    group: "Científico",
    type: "linear",
    units: {
      densidade: 1,
      pressão: 1,
      frequência: 1,
      energia: 1,
      força: 1,
      "velocidade angular": 1,
      massa: 1,
      volume: 1
    },
    unitList: ["densidade", "pressão", "frequência", "energia", "força", "velocidade angular", "massa", "volume"]
  }
];

export function findCategory(id) {
  return categories.find((category) => category.id === id) || categories[0];
}

function toNumber(value) {
  const normalized = String(value).replace(",", ".").trim();
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error("Digite um valor numérico válido para esta categoria.");
  }

  return parsed;
}

function format(value) {
  return typeof value === "number" ? numberFormatter.format(value) : value;
}

function convertTemperature(value, from, to) {
  const input = toNumber(value);
  let celsius = input;

  if (from === "fahrenheit") celsius = (input - 32) * 5 / 9;
  if (from === "kelvin") celsius = input - 273.15;

  if (to === "fahrenheit") return celsius * 9 / 5 + 32;
  if (to === "kelvin") return celsius + 273.15;

  return celsius;
}

function convertBase(value, from, to) {
  const bases = { binário: 2, decimal: 10, hexadecimal: 16, octal: 8 };
  const decimal = parseInt(String(value).trim(), bases[from]);

  if (!Number.isFinite(decimal)) {
    throw new Error("Digite um número válido para a base selecionada.");
  }

  return decimal.toString(bases[to]).toUpperCase();
}

function convertText(value, from, to) {
  const text = String(value);

  if (from === to) return text;
  if (to === "Base64 encode") return btoa(unescape(encodeURIComponent(text)));
  if (from === "Base64 decode" || to === "Base64 decode") return decodeURIComponent(escape(atob(text)));
  if (to === "URL encode") return encodeURIComponent(text);
  if (from === "URL decode" || to === "URL decode") return decodeURIComponent(text);
  if (to === "ASCII") return [...text].map((char) => char.charCodeAt(0)).join(" ");
  if (to === "Unicode") return [...text].map((char) => `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`).join(" ");

  return text;
}

function parseHex(hex) {
  const clean = hex.replace("#", "").trim();
  const value = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error("Digite uma cor HEX válida, como #69E8FF.");
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function convertColor(value, from, to) {
  const rgb = from === "HEX"
    ? parseHex(value)
    : (() => {
        const parts = String(value).match(/\d+(\.\d+)?/g)?.map(Number) || [];
        if (parts.length < 3) throw new Error("Digite RGB/RGBA como 105, 232, 255.");
        return { r: parts[0], g: parts[1], b: parts[2] };
      })();

  if (to === "HEX") {
    return `#${[rgb.r, rgb.g, rgb.b].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }
  if (to === "HSL") {
    const hsl = rgbToHsl(rgb);
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }
  if (to === "RGBA") return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function convertDate(value, from, to) {
  const date = from === "timestamp"
    ? new Date(Number(value) * (String(value).length <= 10 ? 1000 : 1))
    : new Date(value || Date.now());

  if (Number.isNaN(date.getTime())) {
    throw new Error("Digite uma data ou timestamp válido.");
  }

  if (to === "timestamp") return Math.floor(date.getTime() / 1000);
  if (to === "UTC") return date.toISOString();
  if (to === "local time") return date.toLocaleString("pt-BR");
  return `${Math.round(date.getTime() / 86400000)} dias desde 01/01/1970`;
}

export function convert({ categoryId, value, from, to }) {
  const category = findCategory(categoryId);
  let raw;

  if (category.type === "linear") {
    raw = toNumber(value) * category.units[from] / category.units[to];
  } else if (category.type === "temperature") {
    raw = convertTemperature(value, from, to);
  } else if (category.type === "base") {
    raw = convertBase(value, from, to);
  } else if (category.type === "text") {
    raw = convertText(value, from, to);
  } else if (category.type === "color") {
    raw = convertColor(value, from, to);
  } else if (category.type === "date") {
    raw = convertDate(value, from, to);
  }

  return {
    raw,
    formatted: `${format(raw)} ${to}`,
    category: category.name,
    detail: `${value} ${from} → ${format(raw)} ${to}`
  };
}

export function searchableText(category) {
  return `${category.name} ${category.group} ${category.unitList.join(" ")}`.toLowerCase();
}
