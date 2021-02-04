const { remote } = require('webdriverio');

(async () => {
  const browser = await remote({
    logLevel: 'trace',
    capabilities: {
      browserName: 'chrome',
    },
    waitforTimeout: 5000,
  });

  await browser.url('https://www.bookdepository.com/');
  const results = [];

  barcodes = ['9780241200131', '9781784871963'];

  await searchBarcode(browser, '9781784871963');
  const productDetails = await getProductDetails(browser);

  results.unshift(productDetails);
  console.log('Results');
  console.log(results);

  //await browser.deleteSession()
})().catch((e) => console.error(e));

async function searchBarcode(browser, query) {
  const inputTextElem = await browser.$('[name="searchTerm"]');
  await inputTextElem.setValue(query);
  const submitBtn = await (await browser.$('#book-search-form')).$('button');
  await submitBtn.click();
}

async function getProductDetails(browser) {
  let description = await (
    await (await browser.$('div.item-description')).$('div')).getText();
  description = description.trim()

  // Get book details
  const productInfo = await browser.$('.biblio-info');

  let format = '';
  if (await (await productInfo.$('label=Format')).isExisting()) {
    format = await (await productInfo.$('label=Format')).$('..');
    format = formatInfo(await format.getText(), new RegExp(/\d+\s.+/));
  }

  let dimensions = '';
  if (await (await productInfo.$('label=Dimensions')).isExisting()) {
    dimensions = await (await productInfo.$('label=Dimensions')).$('..');
    dimensions = formatInfo(await dimensions.getText(), new RegExp(/\d+.+/));
  }

  let publicationDate = '';
  if (await (await productInfo.$('label=Publication date')).isExisting()) {
    publicationDate = await (await productInfo.$('label=Publication date')).$('..');
    publicationDate = formatInfo(await publicationDate.getText(),
      new RegExp(/\d{2} \w{3} \d{4}/));
  }

  let publisher = '';
  if (await (await productInfo.$('label=Publisher')).isExisting()) {
    publisher = await (await productInfo.$('label=Publisher')).$('..');
    publisher = formatInfo(await publisher.getText(),
      new RegExp(/[^Publisher].+/));
  }

  let imprint = '';
  if (await (await productInfo.$('label=Imprint')).isExisting()) {
    imprint = await (await productInfo.$('label=Imprint')).$('..');
    imprint = formatInfo(await imprint.getText(), new RegExp(/[^Imprint].+/i));
  }

  let publicationCountry = '';
  if (await (await productInfo.$('label=Publication City/Country')).isExisting()) {
    publicationCountry = await (
      await productInfo.$('label=Publication City/Country')).$('..');
    publicationCountry = formatInfo(await publicationCountry.getText(),
      new RegExp(/[^(?!Publication City\/Country )].+/));
  }

  let language = '';
  if (await (await productInfo.$('label=Language')).isExisting()) {
    language = await (await productInfo.$('label=Language')).$('..');
    language = formatInfo(await language.getText(),
      new RegExp(/[^(?!language)].+/i));
  }

  let editionStatement = '';
  if (await (await productInfo.$('label=Edition Statement')).isExisting()) {
    editionStatement = await (await productInfo.$('label=Edition Statement')).$('..');
    editionStatement = formatInfo(await editionStatement.getText(),
      new RegExp(/[^(?!edition statement)].+/i));
  }

  let isbn10 = '';
  if (await (await productInfo.$('label=ISBN10')).isExisting()) {
    isbn10 = await (await productInfo.$('label=ISBN10')).$('..');
    isbn10 = formatInfo(await isbn10.getText(),
      new RegExp(/[^(?!isbn10)].+/i));
  }

  let isbn13 = '';
  if (await (await productInfo.$('label=ISBN13')).isExisting()) {
    isbn13 = await (await productInfo.$('label=ISBN13')).$('..');
    isbn13 = formatInfo(await isbn13.getText(),
      new RegExp(/[^(?!isbn13)].+/i));
  }

  let bestsellerRank = '';
  if (await (await productInfo.$('label=Bestsellers rank')).isExisting()) {
    bestsellerRank = await (
      await productInfo.$('label=Bestsellers rank')).$('..');
    bestsellerRank = formatInfo(await bestsellerRank.getText(),
      new RegExp(/[^(?!bestsellers rank)].+/i));
  }


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

function formatInfo(text, regex) {
  return text.match(regex)[0].trim();
}
