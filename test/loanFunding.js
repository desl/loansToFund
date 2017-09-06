var expect = require("chai").expect;

function filterLoans(arr){
  let expireDateTime = Date.now() + 86400000; // one day's worth of miliseconds
  return arr.filter((cur, idx) => {
    let curDateTime = Date.parse(cur.plannedExpirationDate);
    return curDateTime >= Date.now() && curDateTime <= expireDateTime ? true : false
  });
}

function valueOfLoans(arr){
  let amount = arr.reduce((acc, cur) => acc += (+cur.loanAmount - +cur.loanFundraisingInfo.fundedAmount),0);
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  });

  return formatter.format(amount);
}

let eligibleDate = new Date(Date.now()+10000);
eligibleDate = eligibleDate.toISOString();

let tooLateDate = new Date(Date.now() + 10000 + 86400000)
tooLateDate = tooLateDate.toISOString();

let inPastDate = new Date(Date.now()-10000);
inPastDate = inPastDate.toISOString();

let data = [
    {
      name: "loan1 - eligible",
      "id": 1363077,
      loanAmount: "100.00",
      status: "fundRaising",
      // plannedExpirationDate: "2017-09-02T15:00:04Z",
      plannedExpirationDate: eligibleDate,
      loanFundraisingInfo: {
          fundedAmount: "50.00"
        },
      image: {
            url: "https://www-kiva-org-4.global.ssl.fastly.net/img/s50/94a26daa0d1f50232d2bd3b84836e753.jpg"
          },
      "activity": {
        "name": "Fruits & Vegetables"
      }
    },

    {
      name: "loan2 - not eligible (expiration too late)",
      loanAmount: "1000.00",
      status: "fundRaising",
      plannedExpirationDate: tooLateDate,
      loanFundraisingInfo: {
          fundedAmount: "550.00"
        }
    },
    {
      name: "loan3 - not eligible (expriation in the past)",
      loanAmount: "500.00",
      status: "fundRaising",
      plannedExpirationDate: inPastDate,
      loanFundraisingInfo: {
          fundedAmount: "2"
        }
    }
  ];

describe("Filter Loans", function() {
  
  describe("loan filtering function", function() {
    let loans = filterLoans(data)
    it("filters the correct number of loans", function() {
      expect(loans.length).to.equal(1);
    });
    it("filters the correct loan", function() {
      expect(loans[0].name).to.equal("loan1 - eligible");
    });
  });

  describe("Value Loans", function() {
    let loanValue = valueOfLoans(data);
    it("Values the loans correctly", function() {
      expect(loanValue).to.equal("$998");
    });
  });
});




