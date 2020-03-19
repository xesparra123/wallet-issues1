const fs = require('fs');

const generateJson = async (route, json) => {
  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);
  await fs.writeFileSync(
    route,
    JSON.stringify(json),
    'utf8'
  );
};

module.exports = { generateJson };