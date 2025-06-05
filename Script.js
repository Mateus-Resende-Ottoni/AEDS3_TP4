let globalDepth = 0;
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
  //'00': createBucket(),
  //'01': createBucket(),
  //'10': createBucket(),
  //'11': createBucket()
  '0': createBucket()
};


function getBinaryHash(key, depth) {
  if (depth == 0) {
    return "0";
  } else {
    const num = parseInt(key);
    const hash = num.toString(2).padStart(depth, '0');
    return hash.slice(-depth);
  }
}

function expandDirectory() {
  const newDirectory = {};
  const keys = Object.keys(directory);
  //console.log(keys)

  if (keys.length == 1) {
    const bucket = directory[0];
    newDirectory["0"] = bucket;
    newDirectory["1"] = bucket;
  } else {
    keys.forEach(key => {
      const bucket = directory[key];
      newDirectory["0" + key] = bucket;
      newDirectory["1" + key] = bucket;
    });
  }

  directory = newDirectory;
}

function splitBucket(pointer) {
  const oldBucket = directory[pointer];
  //console.log(directory);
  //console.log('');
  //console.log(' pointer:', pointer, ' - oldBucket:', oldBucket);
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
  let hash = getBinaryHash(key, globalDepth);
  const bucket = directory[hash];
  //console.log(bucket);
  //console.log(`Inserindo chave: ${key} de hash: ${hash}`);

  // Se número já existir, não inserir
  if (bucket.keys.includes(key)) return;

  if (bucket.keys.length < bucketSize) {
    bucket.keys.push(key);
  } else {
    if (bucket.localDepth === globalDepth) {
      globalDepth++;
      expandDirectory();
      hash = getBinaryHash(key, globalDepth); // Atualizar valor hash
    }
    splitBucket(hash);
    insert(key);
  }

  render();
}

function handleInsert() {
  const key = document.getElementById("keyInput").value;
  if (key === "") return;
  //console.log(`Inserindo chave: ${key}`);
  insert(key);
  document.getElementById("keyInput").value = "";
}

function render() {
  const tabela = document.getElementById("tabela");
  const diretorios = document.getElementById("diretorios");
  tabela.innerHTML = "";
  diretorios.innerHTML = "";

  const seen = new Set();
  const orderedPointers = Object.keys(directory).sort();

    orderedPointers.forEach(pointer => {
    const diretorioDiv = document.createElement("div");

    const pointerSpan = document.createElement("span");
    pointerSpan.className = "pointer";
    pointerSpan.textContent = `[${pointer}] → ${directory[pointer].id}`;

    diretorioDiv.appendChild(pointerSpan);
    diretorios.appendChild(diretorioDiv);
  });

  let bucketList = [];
  orderedPointers.forEach(pointer => {
    const bucket = directory[pointer];
    let bucketExists = false;
    // Conferir se já foi adicionado à pagina
    for (const b of bucketList) {
      if (b === bucket.id) {
        bucketExists = true;
        break;
      }
    }

    // Se não tiver sido adicionado, criar na pagina
    if (!bucketExists) {
      const bucketDiv = document.createElement("div");
      bucketDiv.className = "bucket";

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

      bucketDiv.appendChild(blockDiv);
      tabela.appendChild(bucketDiv);
      bucketList.push(bucket.id); // Adicionar o ID do bucket à lista para evitar duplicação
    }

  });
}

render();
