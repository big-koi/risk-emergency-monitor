/** 短临预报降雨图例（与 index.vue 图例一致） */
export const FORECAST_RAIN_LEGEND = [
  { min: -1, max: 0, color: [255, 255, 255], transparent: true },
  { min: 0, max: 2.5, color: [209, 254, 202] },
  { min: 2.5, max: 5, color: [173, 252, 164] },
  { min: 5, max: 10, color: [79, 236, 93] },
  { min: 10, max: 25, color: [1, 201, 13] },
  { min: 25, max: 50, color: [115, 166, 253] },
  { min: 50, max: 100, color: [99, 0, 252] },
  { min: 100, max: Infinity, color: [254, 0, 254] }
];

/** 实况降雨图例（与 index.vue 图例一致） */
export const LIVE_RAIN_LEGEND = [
  { min: 0, max: 10, color: [0, 255, 83] },
  { min: 10, max: 25, color: [53, 163, 4] },
  { min: 25, max: 50, color: [94, 186, 254] },
  { min: 50, max: 100, color: [20, 0, 248] },
  { min: 100, max: 250, color: [225, 27, 226] },
  { min: 250, max: Infinity, color: [135, 39, 19] }
];

const COLOR_MATCH_THRESHOLD = 90;

function colorDistance(c1, c2) {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getLegendDisplayValue(entry) {
  if (!entry || entry.max === Infinity) {
    return entry ? entry.min : 0;
  }
  return (entry.min + entry.max) / 2;
}

/** 根据像素颜色估算降雨量 */
export function estimateRainfallFromPixel(r, g, b, a, legend) {
  if (a < 20) {
    return null;
  }
  if (r > 248 && g > 248 && b > 248) {
    return null;
  }

  let bestEntry = null;
  let bestDist = Infinity;
  legend.forEach(function(entry) {
    if (entry.transparent) {
      return;
    }
    const dist = colorDistance([r, g, b], entry.color);
    if (dist < bestDist) {
      bestDist = dist;
      bestEntry = entry;
    }
  });

  if (!bestEntry || bestDist > COLOR_MATCH_THRESHOLD) {
    return null;
  }

  return {
    min: bestEntry.min,
    max: bestEntry.max,
    value: getLegendDisplayValue(bestEntry)
  };
}

function mergeNearbyCenters(centers, minDistDeg) {
  const merged = [];
  centers
    .slice()
    .sort(function(a, b) {
      return b.jyl - a.jyl;
    })
    .forEach(function(center) {
      const exists = merged.some(function(item) {
        const dLon = item.lon - center.lon;
        const dLat = item.lat - center.lat;
        return Math.sqrt(dLon * dLon + dLat * dLat) < minDistDeg;
      });
      if (!exists) {
        merged.push(center);
      }
    });
  return merged;
}

function findCentersFromImageData(imageData, width, height, imageExtent, legend, options) {
  const minRainfall = options.minRainfall || 100;
  const step = options.step || 3;
  const minClusterDistDeg = options.minClusterDistDeg || 1.2;
  const minX = imageExtent[0];
  const minY = imageExtent[1];
  const maxX = imageExtent[2];
  const maxY = imageExtent[3];
  const gridW = Math.ceil(width / step);
  const gridH = Math.ceil(height / step);
  const values = new Float32Array(gridW * gridH);
  const visited = new Uint8Array(gridW * gridH);
  const data = imageData.data;

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const x = Math.min(gx * step, width - 1);
      const y = Math.min(gy * step, height - 1);
      const offset = (y * width + x) * 4;
      const rainfall = estimateRainfallFromPixel(
        data[offset],
        data[offset + 1],
        data[offset + 2],
        data[offset + 3],
        legend
      );
      values[gy * gridW + gx] = rainfall ? rainfall.value : -1;
    }
  }

  const centers = [];
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const idx = gy * gridW + gx;
      if (visited[idx] || values[idx] < minRainfall) {
        continue;
      }

      let maxVal = values[idx];
      let maxGx = gx;
      let maxGy = gy;
      const queue = [[gx, gy]];
      visited[idx] = 1;

      while (queue.length) {
        const point = queue.shift();
        const cx = point[0];
        const cy = point[1];
        const cidx = cy * gridW + cx;
        const currentValue = values[cidx];
        if (currentValue > maxVal) {
          maxVal = currentValue;
          maxGx = cx;
          maxGy = cy;
        }

        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function(dir) {
          const nx = cx + dir[0];
          const ny = cy + dir[1];
          if (nx < 0 || ny < 0 || nx >= gridW || ny >= gridH) {
            return;
          }
          const nidx = ny * gridW + nx;
          if (!visited[nidx] && values[nidx] >= minRainfall) {
            visited[nidx] = 1;
            queue.push([nx, ny]);
          }
        });
      }

      const px = maxGx * step;
      const py = maxGy * step;
      const lon = minX + (px / width) * (maxX - minX);
      const lat = maxY - (py / height) * (maxY - minY);
      centers.push({
        lon: Number(lon.toFixed(4)),
        lat: Number(lat.toFixed(4)),
        jyl: Math.round(maxVal)
      });
    }
  }

  return mergeNearbyCenters(centers, minClusterDistDeg);
}

/**
 * 从降雨 PNG 前端解析 >100mm 降雨中心
 * @param {string} imageUrl 图片地址
 * @param {number[]} imageExtent [minX, minY, maxX, maxY]
 * @param {'forecast'|'live'} moduleType 模块类型
 * @param {object} options 可选配置
 */
export function extractRainfallCenters(imageUrl, imageExtent, moduleType, options) {
  const legend =
    moduleType === "live" ? LIVE_RAIN_LEGEND : FORECAST_RAIN_LEGEND;
  const opts = options || {};

  return new Promise(function(resolve, reject) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      try {
        const canvas = document.createElement("canvas");
        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        const centers = findCentersFromImageData(
          imageData,
          width,
          height,
          imageExtent,
          legend,
          opts
        );
        resolve(centers);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = function(error) {
      reject(error || new Error("降雨图加载失败"));
    };
    img.src = imageUrl;
  });
}
