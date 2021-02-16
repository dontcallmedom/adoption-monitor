const fetch = require("node-fetch");
const fs = require("fs").promises;
const filters = require("./spec-filters.json");
const fallback = require("./fallback-data.json");

const results = 

(async function() {
  const specs = await fetch("https://w3c.github.io/browser-specs/index.json").then(r => r.json());
  const {repos, groups} = await fetch("https://w3c.github.io/validate-repos/report.json").then(r => r.json());

  for (let shortname of Object.keys(filters)) {
    let title, url, repo;
    const specData = specs.find(s => s.series.shortname === shortname);
    if (!specData) {
      title = shortname;
      url = "https://www.w3.org/TR/" + shortname;
      repo = fallback[shortname] ? fallback[shortname].repo : "w3c/" + shortname;
    } else {
      title= specData.shortTitle;
      url= specData.nightly.url;
      repo = specData.nightly.repository.slice("https://github.com/".length);
    }
;
    let group = Object.values(groups).find(g => g.repos.find(r => r.fullName === repo))?.name;
    if (!group) {
      if (fallback[shortname] && fallback[shortname].group) {
        group = fallback[shortname].group;
      } else {
        console.error("No group info for " + repo);
      }
    }
    results[shortname] = {
      title,
      url,
      group: group
    };
  }
  await fs.writeFile("spec-data.json", JSON.stringify(results, null, 2));
})();
