const sensexSymbols = [
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'HINDUNILVR.NS',
  'ICICIBANK.NS',
  'KOTAKBANK.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'ASIANPAINT.NS',
  'HCLTECH.NS',
  'ITC.NS',
  'LT.NS',
  'AXISBANK.NS',
  'MARUTI.NS',
  'ULTRACEMCO.NS',
  'BAJFINANCE.NS',
  'NESTLEIND.NS',
  'TITAN.NS',
  'SUNPHARMA.NS',
  'POWERGRID.NS',
  'WIPRO.NS',
  'DIVISLAB.NS',
  'DRREDDY.NS',
  'TECHM.NS',

  'EICHERMOT.NS',
  'INDUSINDBK.NS',
  'TATASTEEL.NS',
  'BRITANNIA.NS',
  'COALINDIA.NS',
  'ONGC.NS',
  'GRASIM.NS',
  'JSWSTEEL.NS',
  'BPCL.NS',
  'HDFCLIFE.NS',
  'BAJAJFINSV.NS',
  'ADANIENT.NS',
  'ADANIPORTS.NS',
  'CIPLA.NS'
];
const bankexSymbols = [
  'HDFCBANK.NS',         // HDFC Bank
  'ICICIBANK.NS',        // ICICI Bank
  'SBIN.NS',             // State Bank of India
  'KOTAKBANK.NS',        // Kotak Mahindra Bank
  'AXISBANK.NS',         // Axis Bank
  'BANKBARODA.NS',       // Bank of Baroda
  'CANBK.NS',            // Canara Bank
  'INDUSINDBK.NS',       // IndusInd Bank
  'YESBANK.NS',          // Yes Bank
  'IDFCFIRSTB.NS',       // IDFC First Bank
  'FEDERALBNK.NS',       // Federal Bank

  // Additional large and mid‑sized banks from NSE/BSE 500 :contentReference[oaicite:1]{index=1}
  'IDBI.NS',             // IDBI Bank
  'INDIANB.NS',          // Indian Bank
  'IOB.NS',              // Indian Overseas Bank
  'PNB.NS',              // Punjab National Bank
  'UCOBANK.NS',          // UCO Bank

  // Regional/private banks commonly tracked
  'AUBANK.NS',           // AU Small Finance Bank
  'BANDHANBNK.NS',       // Bandhan Bank
  'DCBBANK.NS',          // DCB Bank
  'RBLBANK.NS',          // RBL Bank
  'CSBBANK.NS',          // CSB Bank
  'UJJIVANSFB.NS',       // Ujjivan Small Finance Bank
  'SOUTHBANK.NS',        // South Indian Bank
  'KARURVYSYA.NS',       // Karur Vysya Bank
  'EQUITASBNK.NS',       // Equitas Small Finance Bank
  'IDBI.BO',
  'UCOBANK.BO',    // UCO Bank
  'BANKMAHA.BO',       // Allahabad Bank (merged; check validity)
  'CENTRALBK.NS',        // Central Bank of India
  'MAHABANK.NS',
  'HDFCBANK.BO',    // HDFC Bank – highest weighting :contentReference[oaicite:1]{index=1}
  'ICICIBANK.BO',   // ICICI Bank :contentReference[oaicite:2]{index=2}
  'SBIN.BO',        // State Bank of India :contentReference[oaicite:3]{index=3}
  'KOTAKBANK.BO',   // Kotak Mahindra Bank :contentReference[oaicite:4]{index=4}
  'AXISBANK.BO',    // Axis Bank :contentReference[oaicite:5]{index=5}
  'BANKBARODA.BO',  // Bank of Baroda :contentReference[oaicite:6]{index=6}
  'CANBK.BO',       // Canara Bank :contentReference[oaicite:7]{index=7}
  'INDUSINDBK.BO',  // IndusInd Bank :contentReference[oaicite:8]{index=8}
  'YESBANK.BO',     // Yes Bank :contentReference[oaicite:9]{index=9}
  'FEDERALBNK.BO',          // HDFC (Housing Finance—not to be confused with HDFC Bank)
];
const teckSymbols = [
  'TCS.NS',
  'INFY.NS',
  'WIPRO.NS',
  'TECHM.NS',
  'HCLTECH.NS',
  'BHARTIARTL.NS',
  'TATAELXSI.NS',
  'COFORGE.NS',
  'LTIM.NS',
  'MPHASIS.NS',
  'PERSISTENT.NS',
  'ROUTE.NS',
  'AFFLE.NS',
  'CYIENT.NS',
  'BIRLASOFT.NS',
  'ECLERX.NS',
  'INTELLECT.NS',
  'ZENSARTECH.NS',
  'NUCLEUS.NS',
  'MINDTREE.NS',
  'SONATSOFTW.NS',
  'NIITTECH.NS',
  'DATAMATICS.NS',
  'NEWGEN.NS',
  'SUBEX.NS',
  'RAMCOSYS.NS',
  'KPITTECH.NS',
  'LTI.NS',
  'SASKEN.NS',
  'TANLA.NS',
  'HAPPSTMNDS.NS',
  'KELLTONTEC.NS',
  'MPSLTD.NS',
  'NELCO.NS',
  'NELCAST.NS',
  'NCC.NS',
  'NITCO.NS',
  'NOCIL.NS',
  'NATCOPHARM.NS',
  'NAVINFLUOR.NS'
];

const midcapSymbols = [
  'CUMMINSIND.NS',
  'TRENT.NS',
  'TATAPOWER.NS',
  'LODHA.NS',
  'TVSMOTOR.NS',
  'ABB.NS',
  'NMDC.NS',
  'GODREJPROP.NS',
  'INDHOTEL.NS',
  'VOLTAS.NS',
  'BALKRISIND.NS',
  'GMRINFRA.NS',
  'AUROPHARMA.NS',
  'PAGEIND.NS',
  'BEL.NS',
  'IDEA.NS',
  'IDFC.NS',
  'UBL.NS',
  'CANFINHOME.NS',
  'FORTIS.NS',
  'MINDACORP.NS',
  'MRPL.NS',
  'NCC.NS',
  'NHPC.NS',
  'NIACL.NS',
  'OBEROIRLTY.NS',
  'OIL.NS',
  'PNBHOUSING.NS',
  'RAJESHEXPO.NS',
  'RECLTD.NS',
  'SAIL.NS',
  'SHREECEM.NS',
  'SRF.NS',
  'SUNTV.NS',
  'SUPREMEIND.NS',
  'TATACOMM.NS',
  'THERMAX.NS',
  'TORNTPOWER.NS',
  'TV18BRDCST.NS',
  'UCOBANK.NS'
];

const smallcapSymbols = [
  'CENTURYTEX.NS',
  'INDIAMART.NS',
  'MAHSEAMLES.NS',
  'SPARC.NS',
  'HATSUN.NS',
  'ANURAS.NS',
  'TEJASNET.NS',
  'IIFL.NS',
  'HFCL.NS',
  'JKPAPER.NS',
  'SJVN.NS',
  'JYOTHYLAB.NS',
  'PRAJIND.NS',
  'VGUARD.NS',
  'ASTERDM.NS',
  'IGL.NS',
  'JINDALSAW.NS',
  'CERA.NS',
  'VSTIND.NS',
  'PNCINFRA.NS',
  'SHK.NS',
  'KNRCON.NS',
  'LAURUSLABS.NS',
  'LEMONTREE.NS',
  'MAHINDCIE.NS',
  'MAHSCOOTER.NS',
  'MANAPPURAM.NS',
  'MANGCHEFER.NS',
  'MASTEK.NS',
  'MINDACORP.NS',
  'MIRZAINT.NS',
  'MOTILALOFS.NS',
  'NATCOPHARM.NS',
  'NAVINFLUOR.NS',
  'NEOGEN.NS',
  'NESCO.NS',
  'NILKAMAL.NS',
  'NOCIL.NS',
  'ORIENTCEM.NS',
  'ORIENTELEC.NS'
];

const autoSymbols = [
  'MARUTI.NS',
  'EICHERMOT.NS',
  'M&M.NS',
  'BAJAJ-AUTO.NS',
  'TATAMOTORS.NS',
  'HEROMOTOCO.NS',
  'TVSMOTOR.NS',
  'ASHOKLEY.NS',
  'BALKRISIND.NS',
  'MRF.NS',
  'EXIDEIND.NS',
  'AMARAJABAT.NS',
  'BOSCHLTD.NS',
  'MOTHERSUMI.NS',
  'ESCORTS.NS',
  'SMLISUZU.NS',
  'VARROC.NS',
  'WABCOINDIA.NS',
  'JAMNAAUTO.NS',
  'LGBBROSLTD.NS',
  'MAHINDCIE.NS',
  'MINDAIND.NS',
  'MUNJALSHOW.NS',
  'RANEHOLDIN.NS',
  'RANEENGINE.NS',
  'RATNAMANI.NS',
  'RECLTD.NS',
  'RICOAUTO.NS',
  'SASKEN.NS',
  'SETCO.NS',
  'SHANTIGEAR.NS',
  'SHARDA.NS',
  'SHIVAMAUTO.NS',
  'SMLISUZU.NS',
  'SONACOMS.NS',
  'SUBROS.NS',
  'SUNDRMFAST.NS',
  'SUPRAJIT.NS',
  'TALBROS.NS',
  'TATAINVEST.NS'
];


module.exports = {
  sensexSymbols,
  bankexSymbols,
  teckSymbols,
  midcapSymbols,
  smallcapSymbols,
  autoSymbols
};