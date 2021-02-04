const { remote } = require('webdriverio');

(async () => {
  const browser = await remote({
    logLevel: 'trace',
    capabilities: {
      browserName: 'chrome',
    },
  });

  browser.setTimeout({
    'pageLoad': 10000,
    'implicit': 4000
  });

  await browser.url('https://www.bookdepository.com/');
  const results = [];

  barcodes = ['9780241200131', '9781784871963'];

  await searchBarcode(browser, '9781784871963');
  const bookDetails = await getBookDetails(browser);

  results.unshift(bookDetails);
  console.log('Results');
  console.log(results);

  //await browser.deleteSession()
})().catch((e) => console.error(e));

/**
 * Clicks the submit button after filling up the search input field on a given webpage.
 * - browser: The WebdriverIO.BrowserObject representing a webpage with a search field.
 * - query: Used to set the search request field.
 */
async function searchBarcode(browser, query) {
  const inputTextElem = await browser.$('[name="searchTerm"]');
  await inputTextElem.setValue(query);
  const submitBtn = await (await browser.$('#book-search-form')).$('button');
  await submitBtn.click();
}

/**
 * Obtains a formatted version of a given text by doing
 * regex matching with a given regex.
 * - text: String used for formatting.
 * - regex: Used for matching required string.
 */
function formatInfo(text, regex) {
  return text.match(regex)[0].trim();
}

/**
 * Obtains a promise for the text for a given selector 
 * located in a given productInfo. 
 * The given formatRegex is used to modify the returned text.
 * - selector: String used to find an element.
 * - productInfo: The element used to search a given selector.
 * - formatRegex: RegExp used to format returned text.
 */
async function getText(selector, productInfo, formatRegex) {
  text = "";
  if (await (await productInfo.$(selector)).isExisting()) {
    element = await (await productInfo.$(selector)).$('..');
    text = formatInfo(await element.getText(), formatRegex);
  }
  return text;
}

/**
 * Obtains a JSON representation of the book that the 
 * browser is currently viewing.
 * Various fields of a book are obtained simultaneously using Promise.all().
 * - browser: The WebdriverIO.BrowserObject used to retrieve the book.
 */
async function getBookDetails(browser) {
  const productInfo = await browser.$('.biblio-info');
  const promises = [];

  let description = await (
    await (await browser.$('div.item-description')).$('div')).getText();
  description = description.trim();

  const formatPromise = getText('label=Format', productInfo, new RegExp(/\d+\s.+/));
  promises.push(formatPromise);

  const dimensionsPromise = getText('label=Dimensions', productInfo, new RegExp(/\d+.+/));
  promises.push(dimensionsPromise);

  const publicationDatePromise = getText('label=Publication date', productInfo, new RegExp(/\d{2} \w{3} \d{4}/));
  promises.push(publicationDatePromise);

  const publisherPromise = getText('label=Publisher', productInfo, new RegExp(/[^Publisher].+/));
  promises.push(publisherPromise);

  const imprintPromise = getText('label=Imprint', productInfo, new RegExp(/[^Imprint].+/i));
  promises.push(imprintPromise);

  const publicationCountryPromise = getText('label=Publication City/Country', productInfo, new RegExp(/[^(?!Publication City\/Country )].+/));
  promises.push(publicationCountryPromise);

  const languagePromise = getText('label=Language', productInfo, new RegExp(/[^(?!language)].+/i));
  promises.push(languagePromise);

  const editionStatementPromise = getText('label=Edition Statement', productInfo, new RegExp(/[^(?!edition statement)].+/i));
  promises.push(editionStatementPromise);

  const isbn10Promise = getText('label=ISBN10', productInfo, new RegExp(/[^(?!isbn10)].+/i));
  promises.push(isbn10Promise);

  const isbn13Promise = getText('label=ISBN13', productInfo, new RegExp(/[^(?!isbn13)].+/i));
  promises.push(isbn13Promise);

  const bestsellerRankPromise = getText('label=Bestsellers rank', productInfo, new RegExp(/[^(?!bestsellers rank)].+/i));
  promises.push(bestsellerRankPromise);

  const [format,
    dimensions,
    publicationDate,
    publisher,
    imprint,
    publicationCountry,
    language,
    editionStatement,
    isbn10,
    isbn13,
    bestsellerRank] = await Promise.all(promises);

  return {
    format,
    dimensions,
    publicationDate,
    publisher,
    imprint,
    publicationCountry,
    language,
    editionStatement,
    isbn10,
    isbn13,
    bestsellerRank,
    description,
  };
}
