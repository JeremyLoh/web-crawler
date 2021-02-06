# web-crawler

A web crawler used to obtain information about books from https://www.bookdepository.com/ when a barcode (isbn13) is given.

The output and input files are located in the data/ directory.
The input file (`inputIsbn13.txt`) contains isbn13 barcodes separated by a newline.
The output file (`output.txt`) contains all of the results of the web search from https://www.bookdepository.com/.

Frameworks used:

[WebdriverIO](https://webdriver.io/)

## Setup:

1. Ensure that Node.js is installed

   Install at least v12.16.1 or higher as this is the oldest active LTS version
   Only releases that are or will become an LTS release are officially supported

1. Clone the repo
1. Navigate to the cloned repo and run the following command in the terminal:

   ```
   npm i
   npm start
   ```

1. The current web crawler works with the Chrome browser.

# Storage of information

The following information is stored in JSON format:

1. Format
1. Dimensions
1. Publication Date
1. Publisher
1. Imprint
1. Publication Country
1. Language
1. Edition Statement
1. isbn10
1. isbn13
1. Bestseller Rank
1. Description

Example of how information is parsed from https://www.bookdepository.com/ using regex

### Format:

```JavaScript
format = 'Format Paperback | 560 pages'
format.match(new RegExp(/\d+\s.+/))
>> Array [ "560 pages" ]
```

### Dimensions:

```JavaScript
dimensions = 'Dimensions 129 x 198 x 24mm | 383g'
dimensions.match(new RegExp(/\d+.+/))
>>Array [ "129 x 198 x 24mm | 383g" ]
```

### Publication Date

```JavaScript
publicationDate = 'Publication date 01 Sep 2015'
publicationDate.match(new RegExp(/\d{2} \w{3} \d{4}/))
>> Array [ "01 Sep 2015" ]
```

### Publisher

```JavaScript
publisher = 'Publisher Penguin Books Ltd'
publisher.match(new RegExp(/[^Publisher].+/))
>> Array [ " Penguin Books Ltd" ]
```

### Imprint

```JavaScript
imprint = 'Imprint PENGUIN CLASSICS'
imprint.match(new RegExp(/[^Imprint].+/i))
>>> Array [ " PENGUIN CLASSICS" ]
```

### Publication Country

```JavaScript
publicationCountry = 'Publication City/Country London, United Kingdom'
publicationCountry.match(new RegExp(/[^(?!Publication City\/Country )].+/))
>> Array [ "London, United Kingdom" ]
```

### Language

```JavaScript
language = 'Language English'
language.match(new RegExp(/[^(?!language)].+/i))
>> Array [ " English" ]
```

### Edition Statement

```JavaScript
editionStatement = 'Edition Statement UK ed.'
editionStatement.match(new RegExp(/[^(?!edition statement)].+/i))
>> Array [ "UK ed." ]
```

### isbn10

```JavaScript
isbn10 = 'ISBN10 024120013X'
isbn10.match(new RegExp(/[^(?!isbn10)].+/i))
>> Array [ " 024120013X" ]
```

### isbn13

```JavaScript
isbn13 = 'ISBN13 9780241200131'
isbn13.match(new RegExp(/[^(?!isbn13)].+/i))
>> Array [ " 9780241200131" ]
```

### Bestseller Rank

```JavaScript
bestsellerRank = 'Bestsellers rank 7,918'
bestsellerRank.match(new RegExp(/[^(?!bestsellers rank)].+/i))
>> Array [ "7,918" ]
```

### Description

Replacing multiple newlines to a single newline

- `description.replace(/[\r\n\s]{2,}/g,"\n")`

```JavaScript
results.forEach(result => {
   result.description = result.description.replace(/[\r\n\s]{2,}/g, "\n");
   result.description = result.description.replace(/[\r\n\s]*(show more)[\r\n\s]*$/, "");
   result.description = result.description.trim();
});
```

```JavaScript
description
>> "
                Description


                    With its astounding hardcover reviews Richard Zenith's new complete translation of THE BOOK OF DISQUIET has now taken on a similar iconic status to ULYSSES, THE TRIAL or IN SEARCH OF LOST TIME as one of the greatest but also strangest modernist texts. An assembly of sometimes linked fragments, it is a mesmerising, haunting 'novel' without parallel in any other culture.
                    show more

            ";

description.match(new RegExp(/[^(?!\n\sdescription)].+/i))
Array [ "With its astounding hardcover reviews Richard Zenith's new complete translation of THE BOOK OF DISQUIET has now taken on a similar iconic status to ULYSSES, THE TRIAL or IN SEARCH OF LOST TIME as one of the greatest but also strangest modernist texts. An assembly of sometimes linked fragments, it is a mesmerising, haunting 'novel' without parallel in any other culture.    " ]
```

# References

[How to Setup WebdriverIO](https://webdriver.io/docs/setuptypes.html)

[WebdriverIO Selectors](https://webdriver.io/docs/selectors.html)

[Regular Expressions (RegEx) in 100 Seconds](https://www.youtube.com/watch?v=sXQxhojSdZM)

[Will Brock - 09 Selecting elements on a page - WebdriverIO](https://www.youtube.com/watch?v=ERrPn6Uwx_Q)

[WebdriverIO setTimeout](https://webdriver.io/docs/api/browser/setTimeout.html)

[Node.js - How do i write files in Node.js?](https://nodejs.org/en/knowledge/file-system/how-to-write-files-in-nodejs/)
