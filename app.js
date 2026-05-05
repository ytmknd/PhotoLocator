const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const statusText = document.getElementById("status");

const fileNameEl = document.getElementById("file-name");
const latitudeEl = document.getElementById("latitude");
const longitudeEl = document.getElementById("longitude");
const altitudeEl = document.getElementById("altitude");
const capturedAtEl = document.getElementById("captured-at");
const mapLink = document.getElementById("map-link");

const defaultPreviewDataUri =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='900' viewBox='0 0 1200 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%23e4d9c2'/%3E%3Cstop offset='1' stop-color='%23f8f4ea'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='900' fill='url(%23g)'/%3E%3Cg fill='%23625849' opacity='0.8'%3E%3Ccircle cx='600' cy='360' r='130'/%3E%3Cpath d='M600 650c-128-171-192-273-192-360a192 192 0 1 1 384 0c0 87-64 189-192 360Z'/%3E%3C/g%3E%3C/svg%3E";

preview.src = defaultPreviewDataUri;

function setStatus(message, type = "info") {
  statusText.textContent = message;
  if (type === "error") {
    statusText.style.color = "#b03a20";
    return;
  }
  if (type === "success") {
    statusText.style.color = "#1f7a4f";
    return;
  }
  statusText.style.color = "#204f4a";
}

function formatCoord(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(6)}°`;
}

function formatAltitude(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(1)} m`;
}

function toMapUrl(lat, lon) {
  const coord = `${lat},${lon}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(coord)}`;
}

function setMapLink(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    mapLink.classList.add("disabled");
    mapLink.setAttribute("aria-disabled", "true");
    mapLink.href = "#";
    return;
  }

  mapLink.href = toMapUrl(lat, lon);
  mapLink.classList.remove("disabled");
  mapLink.setAttribute("aria-disabled", "false");
}

function updatePreview(file) {
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.onload = () => URL.revokeObjectURL(objectUrl);
}

function resetMeta() {
  fileNameEl.textContent = "-";
  latitudeEl.textContent = "-";
  longitudeEl.textContent = "-";
  altitudeEl.textContent = "-";
  capturedAtEl.textContent = "-";
  setMapLink(undefined, undefined);
}

async function parseGpsFromImage(file) {
  const data = await exifr.parse(file, {
    gps: true,
    tiff: true,
    exif: true,
  });

  if (!data) {
    return null;
  }

  const latitude = data.latitude ?? data.lat;
  const longitude = data.longitude ?? data.lon;
  const altitude = data.GPSAltitude ?? data.altitude;
  const capturedAt = data.DateTimeOriginal ?? data.CreateDate ?? null;

  return {
    latitude: typeof latitude === "number" ? latitude : null,
    longitude: typeof longitude === "number" ? longitude : null,
    altitude: typeof altitude === "number" ? altitude : null,
    capturedAt,
  };
}

async function handleFile(file) {
  resetMeta();

  if (!file || !file.type.startsWith("image/")) {
    setStatus("画像ファイルを選択してください。", "error");
    preview.src = defaultPreviewDataUri;
    return;
  }

  fileNameEl.textContent = file.name;
  updatePreview(file);

  try {
    setStatus("EXIFを解析しています...");
    const gps = await parseGpsFromImage(file);

    if (!gps || gps.latitude === null || gps.longitude === null) {
      setStatus("この画像にGPS情報は含まれていません。", "error");
      return;
    }

    latitudeEl.textContent = formatCoord(gps.latitude);
    longitudeEl.textContent = formatCoord(gps.longitude);
    altitudeEl.textContent = formatAltitude(gps.altitude);
    capturedAtEl.textContent = gps.capturedAt
      ? new Date(gps.capturedAt).toLocaleString("ja-JP")
      : "-";

    setMapLink(gps.latitude, gps.longitude);
    setStatus("GPS情報を取得しました。", "success");
  } catch (error) {
    console.error(error);
    setStatus("EXIF解析に失敗しました。対応していない画像形式の可能性があります。", "error");
  }
}

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add("is-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove("is-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  handleFile(file);
});

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  handleFile(file);
});
