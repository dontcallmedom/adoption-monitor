const stackexchange = require('stackexchange');
const fs = require('fs');
const {promisify} = require('util');

const context = new stackexchange({ version: 2.2 });

const config = require("./config.json");

// Group tags by WG? by specs?

// TODO: doesn't cover CSS specs at the moment
const stackoverflow_filters = require("./spec-filters.json");

const filter = {
  key: config.stackexchange.key,
  pagesize: 100,
  sort: 'activity',
  order: 'desc',
  site: 'stackoverflow'
};

const data = {};

async function collectData() {
  for (let spec of Object.keys(stackoverflow_filters)) {
    data[spec] = {tags:{}};
    const tags = stackoverflow_filters[spec].tags || [];
    for (let tag of tags) {
      data[spec].tags[tag] = {};
      const res = await promisify(context.questions.questions)
      ({...filter,
        tagged: tag + (stackoverflow_filters[spec].type ? ';' + stackoverflow_filters[spec].type : ''),
        filter: '!9Z(-x-Q)8' // includes total of questions
       });
      data[spec].tags[tag].type = stackoverflow_filters[spec].type;
      data[spec].tags[tag].total = res.total;
      data[spec].tags[tag].questions = res.items;
    }
    if (tags.length) {
      const res = await new Promise(
        (res, rej) => context.tags.wiki({...filter
                                         , filter: '!--fG1eTpRU.A' // includes full body of wiki
                                                                                                                        }, function(err, results) {
                                                                                                                          if (err) return rej(err);
                                                                                                                          res(results)
                                                                                                                        }, tags));
      res.items.forEach(
        i => data[spec].tags[i.tag_name].wiki = i
      );
    }
  }
}

collectData().then(() =>
                   fs.writeFileSync('results.json', JSON.stringify(data, null, 2)));
