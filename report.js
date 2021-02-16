const tbody = document.querySelector("tbody");

fetch("results.json").then(r => r.json())
  .then(results => {
    Object.keys(results)
      .sort((a,b) => 
            (results[a].group || "unknown").localeCompare(results[b].group)
           )
      .forEach(spec => {
      const tr = document.createElement("tr");
        const specTd = document.createElement("th");
        const rowspan = (Object.keys(results[spec].tags).length + Object.keys(results[spec].keywords).length) || 1;
      specTd.setAttribute("scope", "row");
      specTd.setAttribute("rowspan", rowspan);
        const a = document.createElement("a");
        if (results[spec].url) {
          a.href = results[spec].url;
        }
      a.textContent = results[spec].title || spec;
        specTd.appendChild(a);
        if (results[spec].profile) {
          specTd.appendChild(document.createTextNode(" (" + results[spec].profile + ")"));
        }
        tr.appendChild(specTd);
        const groupTd = document.createElement("td");
        groupTd.setAttribute("rowspan", rowspan);
        groupTd.textContent = results[spec].group || "unknown";
        tr.appendChild(groupTd);
      tbody.appendChild(tr);
      let firstRow = true;
      if (Object.keys(results[spec].tags).length) {
        let tagTr = tr;
        Object.keys(results[spec].tags).forEach(tag => {
          if (!firstRow) {
            tagTr = document.createElement("tr");
          }
          const tagTd = document.createElement("td");
          const tagLink = document.createElement("a");
          tagLink.href=`https://stackoverflow.com/questions/tagged/${tag}` + (results[spec].tags[tag].type ? '+' + results[spec].tags[tag].type : '');
          tagLink.textContent = tag + (results[spec].tags[tag].type ? ' [' + results[spec].tags[tag].type + ']' : '');
          tagTd.appendChild(tagLink);
          tagTr.appendChild(tagTd);

          const numberTd = document.createElement("td");
          numberTd.className = "number";
          numberTd.textContent = results[spec].tags[tag].total;
          tagTr.appendChild(numberTd);

          const questionsTd = document.createElement("td");
          const details = document.createElement("details");
          const summary = document.createElement("summary");
          const recentCount = results[spec].tags[tag].questions.filter(q => q.creation_date > (new Date())/1000 -  7*24*3600).length;
          summary.textContent = "questions" + (recentCount ?  " (" + recentCount  + " recent)" : "");
          details.appendChild(summary);
          const questionsOl = document.createElement("ol");
          results[spec].tags[tag].questions.slice(0, 10).forEach(q => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = q.link;
            a.textContent = (new Date() - q.creation_date*1000 < 7*24*3600*1000 ? "🆕 " : "") + q.title;
            li.appendChild(a);
            li.appendChild(document.createTextNode(q.is_answered ? " ✓" : " ✕"));
            questionsOl.appendChild(li);
          });
          details.appendChild(questionsOl);
          questionsTd.appendChild(details);
          tagTr.appendChild(questionsTd);

          const wikiAnalysisSummary = function (wikiAnalysis, el) {
            for (let type of Object.keys(wikiAnalysis)) {
              const abbr = document.createElement("abbr");
              abbr.textContent = (wikiAnalysis[type] ? "✓" : "✕") + " " + type;
              abbr.title = ({
                w3: "has link to w3.org",
                ed: "has link to editors draft",
                gh: "has link to github repo"
              })[type];
              el.appendChild(abbr);
              el.appendChild(document.createTextNode(" "));
            }
          };

          const wikiTd = document.createElement("td");
          const hasGH = (spec.match(/github\.io/));
          const ghOrg = hasGH ? spec.match(/\/\/([^\.]*)\.github\.io/)[1] : '';
          if (results[spec].tags[tag].wiki && results[spec].tags[tag].wiki.body) {
            const wikiLink = document.createElement("a");
            wikiLink.href = "https://stackoverflow.com/tags/" + tag + "/info";
            wikiLink.textContent = "wiki page for " + tag;
            const wikiDetails = document.createElement("details");
            const wikiSummary = document.createElement("summary");
            wikiAnalysisSummary({
              'w3': results[spec].tags[tag].wiki.body.includes('www.w3.org'),
              'ed': results[spec].tags[tag].wiki.body.includes(spec),
              'gh': hasGH && results[spec].tags[tag].wiki.body.includes('https://github.com/' + ghOrg + '/')
            }, wikiSummary);
            wikiDetails.innerHTML = results[spec].tags[tag].wiki.body;
            wikiDetails.prepend(wikiSummary);
            wikiTd.appendChild(wikiLink);
            wikiTd.appendChild(wikiDetails);
          } else {
            wikiTd.textContent = "✕";
          }
          tagTr.appendChild(wikiTd);

          if (firstRow) {
            firstRow = false;
          } else {
            tbody.appendChild(tagTr);
          }
        });
      }
      if (Object.keys(results[spec].keywords).length) {
        let kwTr = tr;
        Object.keys(results[spec].keywords).forEach(kw => {
          if (!firstRow) {
            kwTr = document.createElement("tr");
          }
          const kwTd = document.createElement("td");
          const kwLink = document.createElement("a");
          kwLink.href="https://stackoverflow.com/search?q=" + encodeURIComponent(kw + (results[spec].keywords[kw].type ? ` [${results[spec].keywords[kw].type}]` : ''));
          kwLink.textContent = kw + (results[spec].keywords[kw].type ? ` [${results[spec].keywords[kw].type}]` : '');
          kwTd.appendChild(kwLink);
          kwTr.appendChild(kwTd);

          const numberTd = document.createElement("td");
          numberTd.className = "number";
          numberTd.textContent = results[spec].keywords[kw].total;
          kwTr.appendChild(numberTd);

          const questionsTd = document.createElement("td");
          const details = document.createElement("details");
          const summary = document.createElement("summary");
          const recentCount = results[spec].keywords[kw].questions.filter(q => q.creation_date > (new Date())/1000 -  7*24*3600).length;
          summary.textContent = "questions" + (recentCount ?  " (" + recentCount  + " recent)" : "");
          details.appendChild(summary);
          const questionsOl = document.createElement("ol");
          results[spec].keywords[kw].questions.slice(0, 10).forEach(q => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = q.link;
            a.textContent = (new Date() - q.creation_date*1000 < 7*24*3600*1000 ? "🆕 " : "") + q.title;
            li.appendChild(a);
            li.appendChild(document.createTextNode(q.is_answered ? " ✓" : " ✕"));
            questionsOl.appendChild(li);
          });
          details.appendChild(questionsOl);
          if (results[spec].keywords[kw].total) {
            questionsTd.appendChild(details);
          }
          kwTr.appendChild(questionsTd);
          if (firstRow) {
            firstRow = false;
          } else {
            tbody.appendChild(kwTr);
          }
        });
      }
    });
  });
