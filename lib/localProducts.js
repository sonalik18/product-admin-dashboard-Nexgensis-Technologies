// const STORAGE_KEY = "productAdminLocalChanges";

// const emptyChanges = () => ({ added: {}, updated: {}, deleted: {} });

// export function readLocalChanges() {
//   if (typeof window === "undefined") return emptyChanges();

//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return emptyChanges();
//     const parsed = JSON.parse(raw);
//     return {
//       added: parsed.added || {},
//       updated: parsed.updated || {},
//       deleted: parsed.deleted || {},
//     };
//   } catch {
//     return emptyChanges();
//   }
// }

// function writeLocalChanges(changes) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
// }

// export function saveAddedProduct(product) {
//   const changes = readLocalChanges();
//   changes.added[String(product.id)] = product;
//   delete changes.updated[String(product.id)];
//   delete changes.deleted[String(product.id)];
//   writeLocalChanges(changes);
// }

// export function saveUpdatedProduct(product) {
//   const changes = readLocalChanges();
//   const id = String(product.id);

//   if (changes.added[id]) {
//     changes.added[id] = { ...changes.added[id], ...product };
//   } else {
//     changes.updated[id] = product;
//   }

//   delete changes.deleted[id];
//   writeLocalChanges(changes);
// }

// export function saveDeletedProduct(product) {
//   const changes = readLocalChanges();
//   const id = String(product.id);

//   if (changes.added[id]) {
//     delete changes.added[id];
//   } else {
//     changes.deleted[id] = product;
//     delete changes.updated[id];
//   }

//   writeLocalChanges(changes);
// }

// export function getLocalProduct(id) {
//   const changes = readLocalChanges();
//   const key = String(id);

//   if (changes.deleted[key]) return null;
//   return changes.added[key] || changes.updated[key] || null;
// }

// export function getLocalProducts() {
//   const changes = readLocalChanges();
//   const added = Object.values(changes.added);
//   const updated = Object.values(changes.updated);
//   const deletedIds = new Set(Object.keys(changes.deleted));

//   return {
//     added,
//     updated,
//     deletedIds,
//     deleted: Object.values(changes.deleted),
//   };
// }

// export function productMatches(product, { search = "", category = "" } = {}) {
//   const q = search.trim().toLowerCase();
//   const categoryMatch = !category || product.category === category;
//   if (!categoryMatch) return false;
//   if (!q) return true;

//   return [product.title, product.description, product.category]
//     .filter(Boolean)
//     .some((value) => String(value).toLowerCase().includes(q));
// }



const STORAGE_KEY = "productAdminLocalChanges";

function emptyChanges() {
  return {
    added: {},
    updated: {},
    deleted: {},
  };
}

function normalizeCollection(value) {
  if (!value) return {};

  // Old array data असल्यास object मध्ये convert करतो
  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .filter(Boolean)
        .map((product) => [
          String(product.id),
          product,
        ])
    );
  }

  if (typeof value === "object") {
    return value;
  }

  return {};
}

export function readLocalChanges() {
  if (typeof window === "undefined") {
    return emptyChanges();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return emptyChanges();
    }

    const parsed = JSON.parse(raw);

    return {
      added: normalizeCollection(parsed.added),
      updated: normalizeCollection(parsed.updated),
      deleted: normalizeCollection(parsed.deleted),
    };
  } catch {
    return emptyChanges();
  }
}

function writeLocalChanges(changes) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(changes)
  );
}

export function saveAddedProduct(product) {
  const changes = readLocalChanges();
  const id = String(product.id);

  changes.added[id] = product;

  delete changes.updated[id];
  delete changes.deleted[id];

  writeLocalChanges(changes);
}

export function saveUpdatedProduct(product) {
  const changes = readLocalChanges();
  const id = String(product.id);

  if (changes.added[id]) {
    // New product असल्यास त्याच added product ला update करतो
    changes.added[id] = {
      ...changes.added[id],
      ...product,
    };
  } else {
    // Existing API product
    changes.updated[id] = product;
  }

  delete changes.deleted[id];

  writeLocalChanges(changes);
}

export function saveDeletedProduct(product) {
  const changes = readLocalChanges();
  const id = String(product.id);

  if (changes.added[id]) {
    // New product delete केल्यास पूर्णपणे remove
    delete changes.added[id];
  } else {
    // Existing product
    changes.deleted[id] = product;
    delete changes.updated[id];
  }

  writeLocalChanges(changes);
}

export function getLocalProduct(id) {
  const changes = readLocalChanges();
  const key = String(id);

  // Deleted product
  if (changes.deleted[key]) {
    return null;
  }

  // New product
  if (changes.added[key]) {
    return changes.added[key];
  }

  // Edited existing product
  if (changes.updated[key]) {
    return changes.updated[key];
  }

  return null;
}

export function getLocalProducts() {
  const changes = readLocalChanges();

  return {
    added: Object.values(changes.added),
    updated: Object.values(changes.updated),
    deletedIds: new Set(
      Object.keys(changes.deleted)
    ),
    deleted: Object.values(changes.deleted),
  };
}

export function productMatches(
  product,
  { search = "", category = "" } = {}
) {
  const q = search.trim().toLowerCase();

  const categoryMatch =
    !category || product.category === category;

  if (!categoryMatch) {
    return false;
  }

  if (!q) {
    return true;
  }

  return [
    product.title,
    product.description,
    product.category,
  ]
    .filter(Boolean)
    .some((value) =>
      String(value)
        .toLowerCase()
        .includes(q)
    );
}