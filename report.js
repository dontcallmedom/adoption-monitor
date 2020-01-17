const tbody = document.querySelector("tbody");

fetch("results.json").then(r => r.json())
  .then(results => {
    Object.keys(results).forEach(spec => {
      const tr = document.createElement("tr");
      const specTd = document.createElement("th");
      specTd.setAttribute("scope", "row");
      specTd.setAttribute("rowspan", Object.keys(results[spec].tags).length || 1);
      const a = document.createElement("a");
      a.href = spec;
      a.textContent = spec;
      specTd.appendChild(a);
      tr.appendChild(specTd);
      tbody.appendChild(tr);
      if (results[spec].tags) {
        let firstTag = true;
        let tagTr = tr;
        Object.keys(results[spec].tags).forEach(tag => {
          if (!firstTag) {
            tagTr = document.createElement("tr");
          }
          const tagTd = document.createElement("td");
          const tagLink = document.createElement("a");
          tagLink.href=`https://stackoverflow.com/questions/tagged/${tag}` + (results[spec].tags[tag].type ? '+' + results[spec].tags[tag].type : '');
          tagLink.textContent = tag;
          tagTd.appendChild(tagLink);
          tagTr.appendChild(tagTd);

          const numberTd = document.createElement("td");
          numberTd.className = "number";
          numberTd.textContent = results[spec].tags[tag].total;
          tagTr.appendChild(numberTd);

          if (firstTag) {
            firstTag = false;
          } else {
            tbody.appendChild(tagTr);
          }
        });
      }
    });
  });
