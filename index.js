const express = require('express');
const xml2js = require('xml2js');
const yf = require('yahoo-finance2').default;
const transporter = require('./utils/transport')
const path = require('path')
const cookieParser = require('cookie-parser');
const push = require('./controllers/push')
const otpsend = require('./controllers/Verification')
const updatePass = require('./controllers/updatepassword')
const symbolpush = require('./controllers/symboldb')
const login = require('./controllers/login')
const axios = require('axios')
const db = require('./config/db')
const parser = new xml2js.Parser();
const cheerio = require('cheerio');
const flash = require("connect-flash");
const expressSession = require("express-session");
const usermodel = require('./models/usermodel');
const symboldb = require('./models/symbol')
const {sensexSymbols,bankexSymbols,teckSymbols,midcapSymbols,smallcapSymbols,autoSymbols} = require('./controllers/BSE_symbol');
const { nifty50Symbols,niftyBankSymbols,niftyITSymbols,niftyMidcapSymbols,niftySmallcapSymbols,niftyAutoSymbols} = require('./controllers/NSE_symbol');
console.log(nifty50Symbols)
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "dddddd"
})
)
app.use(flash())

app.use(cookieParser());


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


function loginmiddelware(req, res, next) {
  if (!req.cookies.email || req.cookies.email == 0 || req.cookies.email.length == 5) {
    let suc = req.flash("error", "please Log in for further use");
    res.redirect("/register/user/login/user");
  } else {
    next();
  }
}






app.get('/bse-sensex', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      sensexSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          const summary = await yf.quoteSummary(symbol, { modules: ['financialData', 'defaultKeyStatistics'] });

          const financialData = summary?.financialData || {};
          const keyStats = summary?.defaultKeyStatistics || {};

          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,

            // ✅ Ratios and Metrics
            peRatio: keyStats?.forwardPE || financialData?.forwardPE || 0,              // P/E Ratio
            eps: keyStats?.forwardEps || financialData?.epsCurrentYear || 0,            // EPS
            debtToEquity: financialData?.debtToEquity || 0,                            // D/E
            opm: financialData?.operatingMargins || 0,                                 // OPM (Operating Profit Margin)
            roe: financialData?.returnOnEquity || 0,                                   // ROE (Return on Equity)
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            peRatio: 0,
            eps: 0,
            debtToEquity: 0,
            opm: 0,
            roe: 0,
          };
        }
      })
    );

    res.render('pagesBse/Sensex', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.send('Error fetching stock data');
  }
});



app.get('/stock/:symbol', loginmiddelware, async (req, res) => {
  let suc = req.flash("error");
  const symbol = req.params.symbol.toUpperCase();

  try {
    const quote = await yf.quote(symbol);
    const summary = await yf.quoteSummary(symbol, {
      modules: ['financialData', 'assetProfile']
    });
    const financialData = summary.financialData || {};
    const assetProfile = summary.assetProfile || {};

    const today = new Date();
    const pastDate400 = new Date();
    pastDate400.setDate(today.getDate() - 400); // Get enough data for 1 year return

    const history = await yf.historical(symbol, {
      period1: pastDate400,
      period2: today,
      interval: '1d'
    });

    const closingPrices = history.map(item => item.close);
    const currentPrice = quote.regularMarketPrice;

    const calculateSMA = (data, period) => {
      if (data.length < period) return 'N/A';
      const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
      return (sum / period).toFixed(2);
    };

    // ✅ Calculate % returns
    const calcReturn = (pastPrice, current) => {
      if (!pastPrice || pastPrice === 0) return 'N/A';
      return (((current - pastPrice) / pastPrice) * 100).toFixed(2) + '%';
    };

    // Find prices from 7 days ago and ~365 days ago
    const price1WeekAgo = history.length >= 7 ? history[history.length - 7].close : null;
    const price1YearAgo = history.length >= 250 ? history[history.length - 250].close : null;

    const returns = {
      oneWeek: calcReturn(price1WeekAgo, currentPrice),
      oneYear: calcReturn(price1YearAgo, currentPrice)
    };

    const sma30 = calculateSMA(closingPrices, 30);
    const sma100 = calculateSMA(closingPrices, 100);

    const percentDiff = (current, ma) => {
      if (ma === 'N/A') return 'N/A';
      return (((current - ma) / ma) * 100).toFixed(2) + '%';
    };

    const ratios = {
      debtToEquity: financialData.debtToEquity || 'N/A',
      returnOnEquity: financialData.returnOnEquity || 'N/A',
      operatingMargins: financialData.operatingMargins || 'N/A',
      interestCoverage: financialData.interestCoverage || 'N/A',
      roce: 'N/A',
      salesGrowth3Years: 'N/A'
    };

    const companyDetails = {
      sector: assetProfile.sector || 'N/A',
      industry: assetProfile.industry || 'N/A',
      ceo: assetProfile.companyOfficers && assetProfile.companyOfficers[0]
        ? assetProfile.companyOfficers[0].name
        : 'N/A',
      website: assetProfile.website || 'N/A',
      description: assetProfile.longBusinessSummary || 'N/A'
    };

    const technicals = {
      sma30,
      sma100,
      sma30Percent: percentDiff(currentPrice, parseFloat(sma30)),
      sma100Percent: percentDiff(currentPrice, parseFloat(sma100))
    };

    const upcomingProbability = () => {
      if (sma100 === 'N/A' || sma30 === 'N/A') return 'Insufficient data for prediction';
      if (currentPrice > sma100) return 'Probability of Uptrend (Long-Term): High';
      if (currentPrice < sma100) return 'Probability of Downtrend (Long-Term): High';
      return 'Stable/Sideways Market Expected';
    };

    const trendData = {
      upcoming: upcomingProbability(),
      shortTerm: (currentPrice > sma30) ? 'Short-term Momentum: Positive' : 'Short-term Momentum: Weak'
    };

    res.render('stock-details', {
      quote,
      ratios,
      history,
      technicals,
      trendData,
      returns,         // ✅ Include new returns object in EJS
      companyDetails,  // ✅ Include company details in EJS
      suc
    });

  } catch (error) {
    console.error(error);
    res.send('Error fetching detailed stock data');
  }
});




app.get('/bse-bankex', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      bankexSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesBse/Bankex', { stocks: quotes }); // Make sure Bankex.ejs exists
  } catch (error) {
    console.error('Error fetching Bankex data:', error);
    res.send('Error fetching Bankex data');
  }
});

app.get('/bse-teck', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      teckSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesBse/BSETeck', { stocks: quotes }); // Make sure Teck.ejs exists
  } catch (error) {
    console.error('Error fetching Teck data:', error);
    res.send('Error fetching Teck data');
  }
});
app.get('/bse-midcap', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      midcapSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesBSE/BSEmidcap', { stocks: quotes }); // Make sure you create Midcap.ejs
  } catch (error) {
    console.error('Error fetching MidCap data:', error);
    res.send('Error fetching MidCap data');
  }
});

app.get('/bse-smallcap', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      smallcapSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesBse/BseSmall', { stocks: quotes }); // Ensure Smallcap.ejs exists
  } catch (error) {
    console.error('Error fetching SmallCap data:', error);
    res.send('Error fetching SmallCap data');
  }
});

app.get('/bse-auto', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      autoSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesBse/BseAuto', { stocks: quotes }); // Make sure Auto.ejs exists
  } catch (error) {
    console.error('Error fetching Auto data:', error);
    res.send('Error fetching Auto data');
  }
});








app.get('/nse-nifty', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      nifty50Symbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/Nifty', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.send('Error fetching stock data');
  }
});
app.get('/nse-banknifty', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      niftyBankSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/NiftyBank', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching Bank Nifty stock data:', error);
    res.send('Error fetching Bank Nifty stock data');
  }
});

app.get('/nse-it', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      niftyITSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/NiftyIT', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching IT stock data:', error);
    res.send('Error fetching IT stock data');
  }
});
app.get('/nse-midcap', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      niftyMidcapSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/NiftyMidcap', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching Midcap stock data:', error);
    res.send('Error fetching Midcap stock data');
  }
});
app.get('/nse-smallcap', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      niftySmallcapSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/NiftySmallcap', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching Smallcap stock data:', error);
    res.send('Error fetching Smallcap stock data');
  }
});
app.get('/nse-auto', loginmiddelware, async (req, res) => {
  try {
    const quotes = await Promise.all(
      niftyAutoSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesNse/NiftyAuto', { stocks: quotes });
  } catch (error) {
    console.error('Error fetching Auto stock data:', error);
    res.send('Error fetching Auto stock data');
  }
});







app.get('/search/stock', loginmiddelware, async (req, res) => {
  const searchQuery = req.query.query;
  if (!searchQuery) {
    return res.render('search', { query: '', results: [] });
  }

  try {
    // Step 1: Search for symbols matching the query
    const searchResults = await yf.search(searchQuery);

    if (!searchResults.quotes || searchResults.quotes.length === 0) {
      return res.render('search', { query: searchQuery, results: [] });
    }

    // Step 2: Get top 5 symbols from search results
    const topSymbols = searchResults.quotes.slice(0, 5).map(q => q.symbol);

    // Step 3: Define modules for detailed info
    const modules = [
      'price',
      'summaryProfile',
      'financialData',
      'defaultKeyStatistics',
      'calendarEvents'
    ];

    // Step 4: Fetch detailed data for all symbols in parallel
    const detailedResults = await Promise.all(
      topSymbols.map(symbol =>
        yf.quoteSummary(symbol, { modules }).catch(err => {
          console.error(`Error fetching details for ${symbol}`, err);
          return null; // Skip any failed fetches gracefully
        })
      )
    );

    // Filter out null responses from failed fetches
    const validResults = detailedResults.filter(item => item !== null);

    // Step 5: Render the EJS view with detailed results
    res.render('search', {
      query: searchQuery,
      results: validResults
    });

  } catch (error) {
    console.error('Error in stock search:', error);
    res.render('search', { query: searchQuery, results: [] });
  }
});
let cachedNews = [];
const NEWS_API_KEY = '660c44df3061d00e7d546981075651b2';

app.get('/news', loginmiddelware, async (req, res) => {
  try {
   const rssUrl = 'https://economictimes.indiatimes.com/rssfeedsdefault.cms';
    const response = await axios.get(rssUrl);
    const result = await parser.parseStringPromise(response.data);

    const newsItems = result.rss.channel[0].item;
    console.log(newsItems[0]); // See if the data structure is correct

    res.render('news', { newsList: newsItems });
  } catch (error) {
    console.error("Error fetching Indian finance news:", error.message);
    res.status(500).send('Error fetching Indian financial news.');
  }
});
// Route: Show Full News Info by ID
app.get('/news/:id', loginmiddelware, async (req, res) => {
  const newsItem = cachedNews[req.params.id];
  if (!newsItem) return res.status(404).send('News not found');

  try {
    const articleUrl = newsItem.link[0];
    const response = await axios.get(articleUrl);
    const $ = cheerio.load(response.data);

    const articleText = $('article').text().trim().slice(0, 3000); // Trim to avoid overflow
    const image = $('article img').first().attr('src') || null;

    res.render('newsDetail', {
      news: newsItem,
      articleText,
      image,
    });
  } catch (err) {
    console.error("Error scraping full article:", err);
    res.render('newsDetail', {
      news: newsItem,
      articleText: 'Full content could not be loaded.',
      image: null,
    });
  }
});





app.get("/", function (req, res) {
  res.cookie("email", "" || 0)
  res.render("index")
})

app.get("/register/user/login/user", function (req, res) {
  let suc = req.flash("error")
  res.render("registerlogin", { suc })
})

app.post("/register/data", function (req, res) {
  let { name, email, password, phone } = req.body
  push(name, email, password, phone, req, res)
})

app.post("/login/data", function (req, res) {
  let { email, password } = req.body
  login(email, password, req, res)

})

const indices = [
  { name: 'BSE SENSEX', symbol: '^BSESN', route: "/bse-sensex" },
  { name: 'BSE Bankex', symbol: 'BSE-BANK.BO', route: "/bse-bankex" },
  { name: 'BSE Teck', symbol: ' BSE-TECK.BO', route: "/bse-teck" },
  { name: 'BSE Midcap', symbol: 'BSE-MIDCAP.BO', route: "/bse-midcap" },
  { name: 'BSE Smallcap', symbol: 'BSE-SMLCAP.BO', route: "/bse-smallcap" },
  { name: 'BSE Auto', symbol: ' BSE-AUTO.BO', route: "/bse-auto" }
];
app.get('/home.BSE', async (req, res) => {
  try {
    const data = await Promise.all(indices.map(async (index) => {
      try {
        const quote = await yf.quote(index.symbol);
        if (!quote || !quote.regularMarketPrice) throw new Error('No data');
        return {
          name: index.name,
          route: index.route,
          symbol: index.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent
        };
      } catch (err) {
        console.error(`Error fetching ${index.name}:`, err.message);
        return {
          name: index.name,
          symbol: index.symbol,
          price: null,
          change: null,
          changePercent: null
        };
      }
    }));

    res.render('pages/BSEind', { indices: data });
  } catch (err) {
    console.error(err);
    res.redirect("/error/404/no/data/to/proceed/")
  }
});

const nseIndices = [
  { name: 'Nifty 50', symbol: '^NSEI', route: "/nse-nifty" },
  { name: 'Nifty Bank', symbol: '^NSEBANK', route: "/nse-banknifty" },
  { name: 'Nifty IT', symbol: '^CNXIT', route: "/nse-it" },
  { name: 'Nifty Midcap 100', symbol: 'NIFTY_MIDCAP_100.NS', route: "/nse-midcap" },
  { name: 'Nifty Smallcap 100', symbol: '^CNXSC', route: "/nse-smallcap" },
  { name: 'Nifty Auto', symbol: '^CNXAUTO', route: "/nse-auto" }
];

app.get('/home.NSE', async (req, res) => {
  try {
    const data = await Promise.all(nseIndices.map(async (index) => {
      try {
        const quote = await yf.quote(index.symbol);
        if (!quote || !quote.regularMarketPrice) throw new Error('No data');
        return {
          name: index.name,
          route: index.route,
          symbol: index.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent
        };
      } catch (err) {
        console.error(`Error fetching ${index.name}:`, err.message);
        return {
          name: index.name,
          symbol: index.symbol,
          price: null,
          change: null,
          changePercent: null
        };
      }
    }));

    res.render('pages/NSEind', { indices: data });
  } catch (err) {
    console.error(err);
    res.redirect("/error/404/no/data/to/proceed/")
  }
});

app.get("/home", loginmiddelware, function (req, res) {
  res.render("home")
})



const marketSymbols = [
  '^NSEI',     // Nifty 50 (India)
  '^BSESN',    // BSE Sensex (India)
  '^CNX100',   // Nifty 100
  '^CNX500',   // Nifty 500
  '^BANKNIFTY',// Nifty Bank
  '^CNXIT',    // Nifty IT
  '^CNXPHARMA',// Nifty Pharma
  '^CNXAUTO',  // Nifty Auto
  '^CNXMETAL', // Nifty Metal
  '^CNXENERGY',// Nifty Energy
  '^CNXREALTY',// Nifty Realty
  '^CNXFMCG',  // Nifty FMCG
  '^CNXPSUBANK',// Nifty PSU Bank
  '^CNXSERVICE',// Nifty Services Sector
  '^CNXMEDIA', // Nifty Media
  '^CNXINFRA', // Nifty Infrastructure
  'CRUDEOIL.NS', // Crude Oil (MCX India)
  'GOLD.NS',     // Gold (MCX India)
  'SILVER.NS'    // Silver (MCX India)
];




app.get('/market/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol;
  // Add ^ prefix if not present (common for indices)
  const symbol = rawSymbol.startsWith('^') ? rawSymbol : `^${rawSymbol}`;

  try {
    // Fetch summary details
    const summary = await yf.quoteSummary(symbol, { modules: ['price', 'summaryDetail'] });

    // Prepare details for rendering
    const details = {
      symbol,
      name: summary?.price?.longName || symbol,
      currency: summary?.price?.currency || 'N/A',
      exchange: summary?.price?.exchangeName || 'N/A',
      price: summary?.price?.regularMarketPrice || 'N/A',
      open: summary?.summaryDetail?.open || 'N/A',
      previousClose: summary?.summaryDetail?.previousClose || 'N/A',
      dayHigh: summary?.summaryDetail?.dayHigh || 'N/A',
      dayLow: summary?.summaryDetail?.dayLow || 'N/A',
      marketCap: summary?.summaryDetail?.marketCap || 'N/A',
      volume: summary?.summaryDetail?.volume || 'N/A'
    };

    // Fetch chart data for last 30 days
    const chartData = await yf.chart(symbol, {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      period2: new Date(),
      interval: '1d'
    });

    // Safe check for chart data
    const result = chartData?.chart?.result?.[0];
    if (!result || !result.indicators?.quote?.[0]?.close || !result.timestamp) {
      // Render without chart data
      return res.render('pagesMarket/MarketDetail', {
        details,
        graphData: [],
        noChart: true
      });
    }

    // Prepare graph data for chart
    const prices = result.indicators.quote[0].close;
    const timestamps = result.timestamp;

    const graphData = timestamps.map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      close: prices[i]
    }));

    // Render the page with details and graph data
    res.render('pagesBse/MarketDetail', {
      details,
      graphData,
      noChart: false
    });

  } catch (err) {
    console.error('Error fetching market detail:', err.message);
    res.redirect("/error/404/no/data/to/proceed/")
  }
});



app.get('/market', async (req, res) => {
  try {
    const quotes = await Promise.all(
      marketSymbols.map(async (symbol) => {
        try {
          const result = await yf.quote(symbol);
          return {
            symbol,
            shortName: result?.shortName || symbol,
            price: result?.regularMarketPrice || 0,
            change: result?.regularMarketChange || 0,
            changePercent: result?.regularMarketChangePercent || 0,
          };
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err.message);
          return {
            symbol,
            shortName: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    res.render('pagesMarket/Market', { markets: quotes });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.redirect("/error/404/no/data/to/proceed/")
  }

});

app.get("/watch/list/", function (req, res) {
  console.log(req.query.symbol)
  symbolpush(req.cookies.email, req.query.symbol, req, res)
})

app.get("/error/404/no/data/to/proceed/", function (req, res) {
  res.render("error.ejs")
})

app.get("/Profile", async function (req, res) {
  const user = await usermodel.findOne({ email: req.cookies.email });
  const symbols = await symboldb.find({ email: req.cookies.email }) // or use req.user from your login middleware
  res.render('profile', { user, symbols });
})

app.get('/watchlist', loginmiddelware, async (req, res) => {
  const userEmail = req.cookies.email;
  const symbols = await symboldb.find({ email: userEmail });
  res.render('watchlist', { symbols });
});

app.get('/watch/remove', loginmiddelware, async (req, res) => {
  const userEmail = req.cookies.email;
  const { symbol } = req.query;

  if (!symbol) return res.send('No symbol provided');

  const userWatchlist = await symboldb.findOne({ email: userEmail });

  if (userWatchlist) {
    userWatchlist.symbols = userWatchlist.symbols.filter(s => s !== symbol);
    await userWatchlist.save();
  }

  res.redirect('/watchlist');
});
app.get('/watch/remove/:symbol', async (req, res) => {
  const email = req.cookies.email;
  const symbol = req.params.symbol;

  try {
    await symboldb.deleteOne({ email, symbol });
    res.redirect('/watchlist');
  } catch (error) {
    console.error(error);
    res.send('Error removing symbol from watchlist.');
  }
});

app.get("/forgetpassword/data",function(req,res){
  console.log(req.query.email)
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpsend(req.query.email,otp,req,res)
})

app.get("/confirm/OTP", function(req, res) {
  const otp = req.flash("otp");
    const email = req.flash("email");
   // ✅ get the flash OTP
   // ✅ get the flash OTP
  console.log(otp);
  let suc= req.flash("error")
  res.render("confirmOTP", { otp ,suc,email }); // ✅ pass OTP to the EJS file
});

app.get("/otp/data",function(req,res){
  email = req.query.email;
  let suc = ""
  res.render("resetpass",{email,suc})
})

app.get("/otp/data/udate",function(req,res){
  let email= req.query.email;
  let uppass = req.query.updatepassword;
  console.log(email,uppass)
  updatePass(email,uppass,req,res)
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));