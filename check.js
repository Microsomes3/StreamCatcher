const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const checkLIVE = async (username) => {
  try {
    const response = await axios.get(`https://www.youtube.com/${username}`);
    const $ = cheerio.load(response.data);

    console.log($('title').text());

    fs.writeFileSync('test.html', response.data);

    const cookieBanner = $('.SGW9xe').text().trim();

    if (cookieBanner === 'Before you continue to YouTube') {
        console.log('cookie banner');
      await axios.post('https://www.youtube.com/cookie_policy', { 
        hitbox: { 
          clicks: { 
            'cookie-policy-accept': '1'
          }
        }
      });
    }
    const isLive = true;
    const toReturn = {
      isLive,
      status: isLive ? 'live' : 'not live',
      channel: username,
    };
    return toReturn;
  } catch (e) {
    console.log(e);
    return null;
  }
};

checkLIVE("@CreepsMcPasta").then((res) => console.log(res));

module.exports.checkLIVE = checkLIVE;
