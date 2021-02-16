const stackexchange = require('stackexchange');
const fs = require('fs');
const {promisify} = require('util');

const context = new stackexchange({ version: 2.2 });

const config = require("./config.json");

const specData = require("./spec-data.json");

// Group tags by WG? by specs?

// TODO: doesn't cover CSS specs at the moment
const stackoverflow_filters = require("./spec-filters.json");

const queryOptions = {
  key: config.stackexchange.key,
  pagesize: 100,
  sort: 'activity',
  order: 'desc',
  site: 'stackoverflow'
};

const wait = ms => new Promise((res) => setTimeout(res, ms));

const data = {};

async function collectData() {
  for (let spec of Object.keys(stackoverflow_filters)) {
    if (specData[spec]) {
      data[spec]
    }
    data[spec] = {tags:{}, keywords: {}};
    if (specData[spec]) {
      data[spec] = Object.assign(data[spec], specData[spec]);
    }
    const tags = stackoverflow_filters[spec].tags || [];
    let type = stackoverflow_filters[spec].type;
    for (let tag of tags) {
      if (Array.isArray(tag)) {
        type = tag[1];
        tag = tag[0];
      }
      data[spec].tags[tag] = {};
      const res = await promisify(context.questions.questions)
      ({...queryOptions,
        tagged: tag + (type ? ';' + type : ''),
        filter: '!9Z(-x-Q)8' // includes total of questions
       });
      if (res.backoff) {
        console.log("backing off for " + res.backoff);
        await wait(res.backoff*1000);
      }
      data[spec].tags[tag].type = type;
      data[spec].tags[tag].total = res.total;
      data[spec].tags[tag].questions = res.items;
    }
    // If a single IP is making more than 30 requests a second, new requests will be dropped.
    // https://api.stackexchange.com/docs/throttle
    await wait(100); 
    if (tags.length) {
      const res = await new Promise(
        (res, rej) => context.tags.wiki({...queryOptions
                                         , filter: '!--fG1eTpRU.A' // includes full body of wiki
                                                                                                                        }, function(err, results) {
                                                                                                                          if (err) return rej(err);
                                                                                                                          res(results)
                                                                                                                        }, tags));
      if (res.backoff) {
        console.log("backing off for " + res.backoff);
        await wait(res.backoff*1000);
      }
      res.items.forEach(
        i => data[spec].tags[i.tag_name].wiki = i
      );
    }
    await wait(100);
    // Keywords
    const keywords = stackoverflow_filters[spec].keywords || [];
    type = stackoverflow_filters[spec].type;
    for (let kw of keywords) {
      if (Array.isArray(kw)) {
        kw = '"' + kw.join('" "') + '"';
      } else if (kw.kw) {
        kw = '"' + kw.kw + '"';
        type = kw.tag;
      } else {
        kw = '"' + kw + '"';
      }
      data[spec].keywords[kw] = {};
      const tagged = type ? type : undefined;
      const res = await promisify(context.search.advanced)(
        {...queryOptions,
         filter: '!9Z(-x-Q)8', // includes total of questions
         q: kw,
         tagged});
      if (res.backoff) {
        console.log("backing off for " + res.backoff);
        await wait(res.backoff*1000);
      }
      data[spec].keywords[kw].type = type;
      data[spec].keywords[kw].total = res.total;
      data[spec].keywords[kw].questions = res.items;
    }
    await wait(100);
  }
}

collectData().then(() =>
                   fs.writeFileSync('results.json', JSON.stringify(data, null, 2))).catch(e => {
                     console.error("Collecting data failed:");
                     console.error(e);
                     process.exit(2);
                   });
