// this file was used to get the API call working.

var query = `query 
  {loans (filters: {status: fundRaising}, sortBy: newest, limit: 5) {
      totalCount
      values {
        name
        loanAmount
        <status></status>
        plannedExpirationDate
        loanFundraisingInfo {
          fundedAmount
        }
        image {
          url(presetSize: small)
        }
        activity {
          name
        }
        location {
          country {
            isoCode
            name
          }
        }
        lenders (limit: 0) {
          totalCount
        }
        ... on LoanPartner {
          partnerName
        }
        ... on LoanDirect {
          trusteeName
        }
      }
    }
  }`

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
xhr.responseType = 'json';
xhr.open("POST", "http://api.kivaws.org/graphql");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Accept", "application/json");
xhr.send(JSON.stringify({
  query: query
}));
xhr.onload = function () {
  console.log('data returned:', xhr.response);
  console.log('data returned:', xhr.responseText);
}
