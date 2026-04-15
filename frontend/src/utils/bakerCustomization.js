export const BAKER_CUSTOMIZATION_CHOICES = {
  flavours: [
    "Vanilla",
    "Chocolate",
    "Red Velvet",
    "Lemon",
    "Strawberry",
    "Carrot Cake",
    "Marble",
    "Coconut",
    "Almond",
    "Coffee/Mocha",
    "Banana",
    "Orange",
  ],
  frostings: [
    "Buttercream",
    "Cream Cheese",
    "Chocolate Ganache",
    "Whipped Cream",
    "Fondant",
    "Swiss Meringue",
  ],
  fillings: [
    "Buttercream",
    "Cream Cheese",
    "Chocolate Ganache",
    "Fruit Compote",
    "Custard",
    "Whipped Cream",
    "Lemon Curd",
    "Raspberry Jam",
  ],
  shapes: ["Round", "Square", "Rectangle", "Heart", "Oval", "Hexagon", "Number", "Custom"],
  dietary: ["Gluten-Free", "Vegan", "Sugar-Free", "Dairy-Free", "Nut-Free", "Organic", "Halal"],
  tiers: ["1 Tier", "2 Tiers", "3 Tiers", "4 Tiers"],
};

const CATEGORY_KEYS = ["flavours", "frostings", "fillings", "shapes", "dietary", "tiers"];

function uniqueStrings(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  );
}

export function createCustomizationState(prefillDefaults = false) {
  return {
    flavours: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.flavours] : [],
    frostings: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.frostings] : [],
    fillings: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.fillings] : [],
    shapes: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.shapes] : [],
    dietary: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.dietary] : [],
    tiers: prefillDefaults ? [...BAKER_CUSTOMIZATION_CHOICES.tiers] : [],
    customFlavour: "",
    customFrosting: "",
    customFilling: "",
    customShape: "",
    customDietary: "",
    customTier: "",
  };
}

function normalizeLegacyArray(value) {
  const nextState = createCustomizationState(false);
  const legacy = uniqueStrings(value);
  for (const key of CATEGORY_KEYS) {
    const defaults = BAKER_CUSTOMIZATION_CHOICES[key];
    const matches = legacy.filter((item) => defaults.includes(item));
    if (matches.length) {
      nextState[key] = matches;
    }
  }
  return nextState;
}

export function normalizeCustomizationOptions(value, { defaultsWhenMissing = true } = {}) {
  if (Array.isArray(value)) {
    return normalizeLegacyArray(value);
  }

  const defaults = createCustomizationState(defaultsWhenMissing);
  const hasStructuredOptions = value && typeof value === "object";

  for (const key of CATEGORY_KEYS) {
    if (Array.isArray(value?.[key])) {
      defaults[key] = uniqueStrings(value[key]);
    } else if (!hasStructuredOptions && defaultsWhenMissing) {
      defaults[key] = [...BAKER_CUSTOMIZATION_CHOICES[key]];
    } else if (!defaultsWhenMissing) {
      defaults[key] = [];
    }
  }

  return defaults;
}

export function getBuilderChoices(value) {
  const hasStructuredSelections =
    value &&
    typeof value === "object" &&
    CATEGORY_KEYS.some((key) => Array.isArray(value?.[key]));
  const normalized = normalizeCustomizationOptions(value, {
    defaultsWhenMissing: !hasStructuredSelections,
  });
  return {
    flavours: uniqueStrings(normalized.flavours).length ? uniqueStrings(normalized.flavours) : hasStructuredSelections ? [] : [...BAKER_CUSTOMIZATION_CHOICES.flavours],
    frostings: uniqueStrings(normalized.frostings).length ? uniqueStrings(normalized.frostings) : hasStructuredSelections ? [] : [...BAKER_CUSTOMIZATION_CHOICES.frostings],
    fillings: uniqueStrings(normalized.fillings).length ? uniqueStrings(normalized.fillings) : hasStructuredSelections ? [] : [...BAKER_CUSTOMIZATION_CHOICES.fillings],
    shapes: uniqueStrings(normalized.shapes).length ? uniqueStrings(normalized.shapes) : hasStructuredSelections ? [] : [...BAKER_CUSTOMIZATION_CHOICES.shapes],
    dietary: uniqueStrings(normalized.dietary),
    tiers: uniqueStrings(normalized.tiers).length ? uniqueStrings(normalized.tiers) : hasStructuredSelections ? [] : [...BAKER_CUSTOMIZATION_CHOICES.tiers],
  };
}

export function tierLabelToMeta(label) {
  const normalized = String(label || "").trim();
  const count = Number.parseInt(normalized, 10);
  const safeCount = Number.isFinite(count) && count > 0 ? count : 1;
  const price = safeCount <= 1 ? 0 : safeCount === 2 ? 50 : safeCount === 3 ? 120 : 120 + (safeCount - 3) * 60;
  return {
    label: normalized || "1 Tier",
    value: normalized || "1 Tier",
    count: safeCount,
    price,
  };
}
