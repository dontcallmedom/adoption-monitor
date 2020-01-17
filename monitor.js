const stackexchange = require('stackexchange');
const fs = require('fs');
const {promisify} = require('util');

const context = new stackexchange({ version: 2.2 });

const config = require("./config.json");

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

const wait = s => new Promise((res) => setTimeout(res, 1000*s));

const data = {};

async function collectData() {
  for (let spec of Object.keys(stackoverflow_filters)) {
    data[spec] = {tags:{}, keywords: {}};
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
        await wait(res.backoff);
      }
      data[spec].tags[tag].type = type;
      data[spec].tags[tag].total = res.total;
      data[spec].tags[tag].questions = res.items;
    }
    if (tags.length) {
      const res = await new Promise(
        (res, rej) => context.tags.wiki({...queryOptions
                                         , filter: '!--fG1eTpRU.A' // includes full body of wiki
                                                                                                                        }, function(err, results) {
                                                                                                                          if (err) return rej(err);
                                                                                                                          res(results)
                                                                                                                        }, tags));
      res.items.forEach(
        i => data[spec].tags[i.tag_name].wiki = i
      );
    }
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
      data[spec].keywords[kw].type = type;
      data[spec].keywords[kw].total = res.total;
      data[spec].keywords[kw].questions = res.items;
    }
  }
}

collectData().then(() =>
                   fs.writeFileSync('results.json', JSON.stringify(data, null, 2)));
