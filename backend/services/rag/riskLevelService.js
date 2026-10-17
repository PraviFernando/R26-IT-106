const EPDSScreening = require('../../models/EPDSScreening');
const { DEFAULT_RISK_LEVEL } = require('../../config/ragConfig');

async function getRiskLevel(userId) {
  if (process.env.MOCK_RISK_LEVEL) {
    return process.env.MOCK_RISK_LEVEL;
  }
  const month = new Date().toISOString().slice(0, 7);
  const screening = await EPDSScreening.findOne({ userId, month });
  return screening?.riskLevel || DEFAULT_RISK_LEVEL;
}

module.exports = { getRiskLevel };
