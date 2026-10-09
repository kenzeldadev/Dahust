// Unique ids. Teaches: feature detection with a fallback.
export const newId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
