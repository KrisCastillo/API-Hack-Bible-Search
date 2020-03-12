$('#search-page').hide();
$('#search-results').hide(); 
$("#intro-page").show();
$("header").show();

function tryIt() {

$("#intro-page").hide();
$("header").hide();
$("#search-page").show();
$("#search-results").show();

}

const resultsList = document.querySelector(`#results-list`);
const searchInput = document.querySelector(`#search-input`);
const searchNavTop = document.querySelector(`#search-nav-top`);
const searchNavBottom = document.querySelector(`#search-nav-bottom`);
const bibleVersionID = getParameterByName(`version`) || `06125adad2d5898a-01`;
const abbreviation = getParameterByName(`abbr`) || 'ASV';
const query = getParameterByName(`query`);

if (query) {
  document.querySelector(`#viewing`).innerHTML = query;
  search(query);
}

/**
 * Loads page for new search
 */

  
  function searchButton(){
  //  window.location.href = `./search.html?&version=${bibleVersionID}&abbr=${abbreviation}&query=${searchInput.value}`;
   search(searchInput.value);
}

/**
 * Loads search results into page
 */

function search(searchText, offset = 0) {
  
     searchInput.value = searchText;
  getResults(searchText, offset).then((data) => {
    
     let resultsHTML = ``;

    if (data.verses) {
      
      if (!data.verses[0]) {
        searchNavTop.innerHTML = ``;
        searchNavBottom.innerHTML = ``;
        resultsHTML = `<div class="no-results">☹️ No results. Try again!</div>`;
      } else {
        
        const [topSearchNavHTML, searchNavHTML] = buildNav(offset, data.total, searchText);
        searchNavTop.innerHTML = topSearchNavHTML;
        searchNavBottom.innerHTML = searchNavHTML;

        resultsHTML += `<ul>`;
        for (let verse of data.verses) {
          resultsHTML += `<li>
            <h5>${verse.reference}</h5>
            <div class="text not-eb-container">${verse.text}</div>
          </li>`;
        }
        resultsHTML += `<ul>`;
      }
    }

    if (data.passages) {
      
      searchNavTop.innerHTML = ``;
      searchNavBottom.innerHTML = ``;
      if (!data.passages[0]) {
        resultsHTML = `<div class="no-results">☹️ No results. Try again!</div>`;
      } else {
        
        resultsHTML += `<ul>`;
        for (let passage of data.passages) {
          resultsHTML += `<li>
            <h5>${passage.reference}</h5>
            <div class="text eb-container">${passage.content}</div>
          </li>`;
        }
        resultsHTML += `</ul>`;
      }
    }

    resultsList.innerHTML = resultsHTML;
  });
}

/**
 * Builds navigation for search results
 * @returns {string} HTML to include for navigation
 */
function buildNav(offset, total, searchText) {
  const topSearchNavHTML = `<span class="results-count">Showing <b>${offset*10+1}-${offset*10+10 > total ? total : offset*10+10}</b> of <b>${total}</b> results.</span>`
  let searchNavHTML = `<span class="results-current-page"> Current page: <b>${offset+1}</b></span>`;

  if (offset > 0 || total / 10 > offset+1) {
    searchNavHTML += `<span class="results-nav">`;
  }

  if (offset > 0) {
    searchNavHTML += `<button onclick="search('${searchText}', ${offset-1})">Previous Page</button>`;
  }

  if (total / 10 > offset+1) {
    searchNavHTML += `<button onclick="search('${searchText}', ${offset+1})">Next Page</button>`;
  }

  if (offset > 0 || total / 10 > offset+1) {
    searchNavHTML += `</span>`;
  }

  return [topSearchNavHTML, searchNavHTML];
}

/**
 * Gets verses that match search term from API.Bible
 * @returns {Promise} containing list of verses
 */
function getResults(searchText, offset = 0) {
    $("#intro-page").hide();
    $("header").hide();
    $("#search-page").show();
    $("#search-results").show();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data, meta} = JSON.parse(this.responseText);

        _BAPI.t(meta.fumsId);
        resolve(data);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/search?query=${searchText}&offset=${offset}`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Gets query parameter from URL based on name
 * @param {string} name of query parameter
 * @returns {string} value of query parameter
 */
function getParameterByName(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, `\\$&`);
  const regex = new RegExp(`[?&]` + name + `(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return ``;
  return decodeURIComponent(results[2].replace(/\+/g, ` `));
}
