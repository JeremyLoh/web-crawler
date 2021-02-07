const { remote } = require("webdriverio");
const fs = require("fs");
const isIsbn = require('is-isbn')

const DIR = "./data";
const OUTPUT_FILE = DIR + "/" + "output.txt";
const INPUT_ISBN13_FILE = DIR + "/" + "inputIsbn13.txt";

(async () => {
  const browser = await remote({
    logLevel: "trace",
    capabilities: {
      browserName: "chrome",
    },
  });

  browser.setTimeout({
    pageLoad: 10000,
    implicit: 4000,
  });

  await browser.url("https://www.bookdepository.com/");
  const results = [];

  await fs.readFile(INPUT_ISBN13_FILE, "utf8", function (err, data) {
    if (err) {
      // File does not exist, create it
      writeData(INPUT_ISBN13_FILE, "");
    }
    const barcodes = data.split(/[\r\n]+/).filter(barcode => {
      return isIsbn.validate(barcode);
    });
    search = async () => {
      for (const barcode of barcodes) {
        await searchBarcode(browser, barcode);
        const bookDetails = await getBookDetails(browser, barcode);
        results.unshift(bookDetails);
        console.log(results);
        // Wait for information to be processed
        await browser.pause(4000);
      }
      createDir(DIR);
      results.forEach(result => {
        result.description = result.description.replace(/[\r\n\s]{2,}/g, "\n");
        result.description = result.description.replace(/[\r\n\s]*(show more)[\r\n\s]*$/, "");
        result.description = result.description.trim();
      });
      writeData(OUTPUT_FILE, JSON.stringify(results));
      await browser.deleteSession();
    }
    search();
  });
})().catch((e) => console.error(e));

/**
 * Writes text to a file.
 * - file: Location of file to write data to.
 * - text: Data for writting
 */
function writeData(file, text) {
  fs.writeFile(file, text, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("Written data to " + file);
  });
}

/**
 * Creates a directory based on the given dirPath.
 * - dirPath: Location of directory to be created.
 */
function createDir(dirPath) {
  fs.mkdir(dirPath, { recursive: true }, function (err) {
    if (err) {
      throw err;
    }
  });
}

/**
 * Clicks the submit button after filling up the search input field on a given webpage.
 * - browser: The WebdriverIO.BrowserObject representing a webpage with a search field.
 * - query: Used to set the search request field.
 */
async function searchBarcode(browser, query) {
  const inputTextElem = await browser.$('[name="searchTerm"]');
  await inputTextElem.setValue(query);
  const submitBtn = await (await browser.$("#book-search-form")).$("button");
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
    element = await (await productInfo.$(selector)).$("..");
    text = formatInfo(await element.getText(), formatRegex);
  }
  return text;
}

/**
 * Obtains a JSON representation of the book that the
 * browser is currently viewing.
 * Various fields of a book are obtained simultaneously using Promise.all().
 * - browser: The WebdriverIO.BrowserObject used to retrieve the book.
 * - barcode: The current book barcode searched.
 */
async function getBookDetails(browser, barcode) {
  const productInfo = await browser.$(".biblio-info");
  const promises = [];

  let description = await (
    await (await browser.$("div.item-description")).$("div")
  ).getText();

  const formatPromise = getText(
    "label=Format",
    productInfo,
    new RegExp(/\d+\s.+/)
  );
  promises.push(formatPromise);

  const dimensionsPromise = getText(
    "label=Dimensions",
    productInfo,
    new RegExp(/\d+.+/)
  );
  promises.push(dimensionsPromise);

  const publicationDatePromise = getText(
    "label=Publication date",
    productInfo,
    new RegExp(/\d{2} \w{3} \d{4}/)
  );
  promises.push(publicationDatePromise);

  const publisherPromise = getText(
    "label=Publisher",
    productInfo,
    new RegExp(/[^Publisher].+/)
  );
  promises.push(publisherPromise);

  const imprintPromise = getText(
    "label=Imprint",
    productInfo,
    new RegExp(/[^Imprint].+/i)
  );
  promises.push(imprintPromise);

  const publicationCountryPromise = getText(
    "label=Publication City/Country",
    productInfo,
    new RegExp(/[^(?!Publication City\/Country )].+/)
  );
  promises.push(publicationCountryPromise);

  const languagePromise = getText(
    "label=Language",
    productInfo,
    new RegExp(/[^(?!language)].+/i)
  );
  promises.push(languagePromise);

  const editionStatementPromise = getText(
    "label=Edition Statement",
    productInfo,
    new RegExp(/[^(?!edition statement)].+/i)
  );
  promises.push(editionStatementPromise);

  const isbn10Promise = getText(
    "label=ISBN10",
    productInfo,
    new RegExp(/[^(?!isbn10)].+/i)
  );
  promises.push(isbn10Promise);

  const isbn13Promise = getText(
    "label=ISBN13",
    productInfo,
    new RegExp(/[^(?!isbn13)].+/i)
  );
  promises.push(isbn13Promise);

  const bestsellerRankPromise = getText(
    "label=Bestsellers rank",
    productInfo,
    new RegExp(/[^(?!bestsellers rank)].+/i)
  );
  promises.push(bestsellerRankPromise);

  const [
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
  ] = await Promise.all(promises);

  return {
    barcode,
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
