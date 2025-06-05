let globalDepth = 2;
const bucketSize = 4;
let bucketIdCounter = 0;

function createBucket(depth = globalDepth) {
  return {
    id: bucketIdCounter++,
    localDepth: depth,
    keys: []
  };
}

// Diretório inicial
let directory = {
  '00': createBucket(),
  '01': createBucket(),
  '10': createBucket(),
  '11': createBucket()
};

function getBinaryHash(key, depth) {
  const num = parseInt(key);
  const hash = num.toString(2).padStart(depth, '0');
  return hash.slice(-depth);
}

function expandDirectory() {
  const newDirectory = {};
  const keys = Object.keys(directory);

  keys.forEach(key => {
    const bucket = directory[key];
    newDirectory["0" + key] = bucket;
    newDirectory["1" + key] = bucket;
  });

  directory = newDirectory;
}

function splitBucket(pointer) {
  const oldBucket = directory[pointer];
  const newLocalDepth = oldBucket.localDepth + 1;
  const newBucket = createBucket(newLocalDepth);
  oldBucket.localDepth = newLocalDepth;

  // Atualiza ponteiros do diretório
  for (const p in directory) {
    if (directory[p] === oldBucket) {
      if (p.slice(-newLocalDepth) === pointer.slice(-newLocalDepth)) {
        directory[p] = newBucket;
      }
    }
  }

  // Redistribui chaves
  const allKeys = [...oldBucket.keys];
  oldBucket.keys = [];
  newBucket.keys = [];

  allKeys.forEach(k => insert(k));
}

function insert(key) {
  const hash = getBinaryHash(key, globalDepth);
  const bucket = directory[hash];

  if (bucket.keys.includes(key)) return;

  if (bucket.keys.length < bucketSize) {
    bucket.keys.push(key);
  } else {
    if (bucket.localDepth === globalDepth) {
      globalDepth++;
      expandDirectory();
    }
    splitBucket(hash);
    insert(key);
  }

  render();
}

function handleInsert() {
  const key = document.getElementById("keyInput").value;
  if (key === "") return;
  insert(key);
  document.getElementById("keyInput").value = "";
}

function render() {
  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  const seen = new Set();

  const orderedPointers = Object.keys(directory).sort();
  orderedPointers.forEach(pointer => {
    const bucket = directory[pointer];
    const bucketDiv = document.createElement("div");
    bucketDiv.className = "bucket";

    const pointerSpan = document.createElement("span");
    pointerSpan.className = "pointer";
    pointerSpan.textContent = `[${pointer}] →`;

    const blockDiv = document.createElement("div");
    blockDiv.className = "block";
    blockDiv.setAttribute("data-id", `B${bucket.id}`);
    blockDiv.setAttribute("data-depth", bucket.localDepth);

    for (let i = 0; i < bucketSize; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = bucket.keys[i] !== undefined ? bucket.keys[i] : "";
      blockDiv.appendChild(cell);
    }

    // Evita repetir blocos com mesmo objeto (mesmo bucket apontado por mais de um prefixo)
    if (!seen.has(bucket)) {
      seen.add(bucket);
    }

    bucketDiv.appendChild(pointerSpan);
    bucketDiv.appendChild(blockDiv);
    tabela.appendChild(bucketDiv);
  });
}

render();
