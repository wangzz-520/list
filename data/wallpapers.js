const wallpapers = [];

function getLocalWallpapers() {
  return wallpapers.map(item => ({ ...item }));
}

module.exports = {
  wallpapers,
  getLocalWallpapers
};
