const eq = Equation.default;

// Select your input type file and store it in a variable
const input = document.querySelector('input[type=file]');

const downloadURI = (uri, name) => {
  var link = document.createElement('a');
  link.download = name;
  link.href = encodeURI(uri);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

input.addEventListener(
  'change',
  () => {
    document.querySelector('label.upload').classList.add('has-file');
    document.querySelector('label.upload .title').innerText = 'Select Another File';
    document.querySelector('label.upload .file-name').innerText = input.files[0].name;
  },
  false
);
document.querySelector('.upload-btn').addEventListener('click', async () => {
  const file = input.files[0];
  var imageData = new Image();
  imageData.src = await toBase64(file);
  imageData.onload = function () {
    const image = document.createElement('canvas');

    image.width = imageData.width;
    image.height = imageData.height;

    const ctx = image.getContext('2d');
    ctx.drawImage(imageData, 0, 0, image.width, image.height);

    let result = 0;

    const xAxis = image.height / 2;

    for (let x = 0; x < image.width; x++) {
      for (let y = 0; y < image.height; y++) {
        const sum = ctx
          .getImageData(x, y, 1, 1)
          .data.slice(0, 3)
          .reduce((a, b) => a + b, 0);
        if (sum < 100) {
          if (y < xAxis) {
            result++;
          } else {
            result--;
          }
        }
      }
    }

    // calculate the size of 1 pixel based on units
    let name = file.name.split('_')[2].split('.');
    name.pop();
    name = name
      .join('.')
      .split('x')
      .map((e) => parseFloat(e));

    const imageSize = image.width * image.height;
    const mathSize = name[0] * name[1];

    result = result * (mathSize / imageSize);
    document.querySelector('.success').classList.add('displayed');
    document.querySelector('.success h3').innerText = Math.floor(result * 1000) / 1000;
  };
});
const go = () => {
  const eqFunc = () => {
    return eq.equation(document.querySelector('#inputeq').value);
  };
  const a = parseInt(document.querySelector('#inputa').value);
  const b = parseInt(document.querySelector('#inputb').value);
  const width = 700;
  const height = 400;
  const deltaX = (b - a) / 10000; // use 10K as N here cuz why not;
  // well Uncle Bob would clearly disagree, this is NOT clean code
  // HAHAHAHAHA
  // lmao magic numbers
  let eqMax = eqFunc()(a);
  for (let i = a; i < b; i += deltaX) {
    const result = eqFunc()(i);
    eqMax = Math.max(eqMax, Math.abs(result));
  }
  eqMax = Math.ceil(eqMax);
  // generate the image. i guess ill use #2188ff since that's a relatively pretty color
  // on second thought I should probably use #000.
  // ^ colorist JS comments. This is clearly unjust discrimination against lighter colors.
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff'; // white bg
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const xAxisLine = canvas.height / 2;

  for (let j = 0; j < width; j++) {
    const x = ((b - a) / width) * j + a;
    const y = eqFunc()(x);
    const k = Math.round(xAxisLine - (xAxisLine / eqMax) * y); // basically just scaling y
    ctx.fillStyle = '#000';
    if (k < xAxisLine) {
      ctx.fillRect(j, k, 1, xAxisLine - k);
    } else {
      ctx.fillRect(j, xAxisLine, 1, k - xAxisLine);
    }
  }

  // download
  const dt = canvas.toDataURL('image/png');

  document.querySelector('#graph').style.display = 'block';
  document.querySelector('#graph').src = dt;

  const elm = document.createElement('a');
  elm.setAttribute(
    'download',
    `integral_${Math.floor(Math.random() * 1000000)}_${Math.round(2 * eqMax * 10000) / 10000}x${Math.round((b - a) * 10000) / 10000}.png`
  );
  elm.href = dt;
  elm.click();
};

document.querySelector('.download-btn').addEventListener('click', () => {
  try {
    go();
  } catch (err) {
    console.error(err);
    alert('An Error Occurred. Apologies for the inconvenience.');
  }
});
