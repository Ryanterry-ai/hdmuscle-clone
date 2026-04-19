export function buildAssetRecord(asset = {}) {
  const type = asset.type || "";
  const fileName = asset.fileName || "";

  const skipTheme =
    type === "media" ||
    /\.(mp4|webm|mov|avi|m4v|mp3|wav|ogg|flac|aac)$/i.test(fileName);

  return {
    ...asset,
    skipTheme
  };
}