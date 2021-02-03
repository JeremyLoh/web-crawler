const { remote } = require('webdriverio');

(async () => {
  const browser = await remote({
    logLevel: 'trace',
    capabilities: {
      browserName: 'chrome',
    },
  });

  await browser.url('https://www.bookdepository.com/');
  const results = [];

  await searchBarcode(browser, '9780241200131');
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
  const description = await browser.$('.item-description');
  // Get book details
  const productInfo = await (
    await (await browser.$('.biblio-info-wrap')).$('.biblio-info')
  ).$$('li');

  const product = {
    format: formatInfo(await productInfo[0].getText(), new RegExp(/\d+\s.+/)),
    dimensions: formatInfo(await productInfo[1].getText(), new RegExp(/\d+.+/)),
    publicationDate: formatInfo(
      await productInfo[2].getText(),
      new RegExp(/\d{2} \w{3} \d{4}/)
    ),
    publisher: formatInfo(
      await productInfo[3].getText(),
      new RegExp(/[^Publisher].+/)
    ),
    imprint: formatInfo(
      await productInfo[4].getText(),
      new RegExp(/[^Imprint].+/i)
    ),
    publicationCountry: formatInfo(
      await productInfo[5].getText(),
      new RegExp(/[^(?!Publication City\/Country )].+/)
    ),
    language: formatInfo(
      await productInfo[6].getText(),
      new RegExp(/[^(?!language)].+/i)
    ),
    editionStatement: formatInfo(
      await productInfo[7].getText(),
      new RegExp(/[^(?!edition statement)].+/i)
    ),
    isbn10: formatInfo(
      await productInfo[8].getText(),
      new RegExp(/[^(?!isbn10)].+/i)
    ),
    isbn13: formatInfo(
      await productInfo[9].getText(),
      new RegExp(/[^(?!isbn13)].+/i)
    ),
    bestsellerRank: formatInfo(
      await productInfo[10].getText(),
      new RegExp(/[^(?!bestsellers rank)].+/i)
    ),
    description: formatInfo(
      await description.getText(),
      new RegExp(/[^(?!\n\sdescription)].+/i)
    ),
  };

  return product;
}

function formatInfo(text, regex) {
  return text.match(regex)[0].trim();
}
