$(document).ready(function() {

  let $loanValue = $('#loanValue');
  let $loansLeft = $('#loansLeft');

  // Function cut/pasted from ./test/loanFunding.js where their fitness can be confirmed
  function filterLoans(arr){
    let expireDateTime = Date.now() + 86400000; // one day's worth of miliseconds
    return arr.filter((cur, idx) => {
      let curDateTime = Date.parse(cur.plannedExpirationDate);
      return curDateTime >= Date.now() && curDateTime <= expireDateTime ? true : false
    });
  }

  // Function cut/pasted from ./test/loanFunding.js where their fitness can be confirmed
  function valueOfLoans(arr){
    let amount = arr.reduce((acc, cur) => acc += (+cur.loanAmount - +cur.loanFundraisingInfo.fundedAmount),0);
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return formatter.format(amount);
  }

  function populateLoanList($ul, loans){
    loans.forEach((cur, idx) => {
      let curFunding = cur.loanFundraisingInfo.fundedAmount.slice(0,-3);
      let loanAmt = cur.loanAmount.slice(0,-3);

      let $li = $('<li>');
      let $img = $('<img>',{src: cur.image.url}).addClass('img-rounded');
      let $alink = $('<a>').attr("href", `https://www.kiva.org/lend/${cur.id}`)
      let $h3 = $('<h3>').text(`${idx+1}. ${cur.name}`);

      $li.text(` ${cur.activity.name}: $${curFunding} remaining of $${loanAmt}`).addClass('list-group-item');
      $li.prepend($img);
      $li.prepend($h3);
      $ul.append($li);
      $li.wrap($alink);
    });
  }

  var queryText = `
    {loans (filters: {status: fundRaising} limit: 1000, offset: 0, sortBy: expiringSoon) {
        totalCount
        values {
          name
          id
          loanAmount
          status
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
              name
            }
          }
        }
      }
    }
  `;

  myQuery = JSON.stringify({
    operationName: null,
    query: queryText,
    variables: null
  });

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "text/html, application/json");

  var myInit = {
      method: 'POST',
      body: myQuery,
      headers: myHeaders
  }

  var myRequest = new Request('https://api.kivaws.org/graphql', myInit);

  fetch(myRequest).then(function(response){
      if (response.ok){
          return response.blob();
      }
      throw new Error('Response not ok');
  }).then(function(myBlob){
      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        var loansToList = JSON.parse(reader.result).data.loans.values;
        let dNow = Date.now();

         // Update our values in the text:
        let loansNeedingFunds = filterLoans(loansToList);
        let remainingValue = valueOfLoans(loansNeedingFunds);

        $loansLeft.text(loansNeedingFunds.length);
        $loanValue.text(remainingValue);

        // Build up list of loans from loansNeedingFunds array:
        let $ul = $('#loanList');
        $('.loader').fadeOut('slow');
        populateLoanList($ul, loansNeedingFunds, remainingValue);
      });
      reader.readAsText(myBlob);
  }).catch(function(e){
      console.log(e);
  });
});