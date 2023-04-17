
import { CheerioCrawler, RequestQueue, log, LogLevel } from 'crawlee';
// import { router } from './routes';
import { parsePage } from './parseProduct.js'
import jsonfile from 'jsonfile'

const json = await jsonfile.readFile('data/productSTMtemp.json')
const productUrls = new Set(json.map((el: any) => el.url))

const startUrls = ['https://stl-nn.com'];
// const startUrls = [{url:'https://stl-nn.com/santehnika/page-1?items_per_page=96', label: 'PAGE'}];
const crawler = new CheerioCrawler({
  // maxRequestsPerCrawl: 20,
  // maxConcurrency: 10,
  maxRequestsPerMinute: 100,
  async requestHandler({ request, $, enqueueLinks, log }) {
    // log.debug(`Processing ${request.url}...`);
    // log.info(`page ${request.url}`);
    if (request.label === "PRODUCT") {
     
      const results = parsePage($, request.loadedUrl)

    } else if (request.label === "PAGE") {
      log.info(`page ${request.url}`);
      await enqueueLinks({
        selector: '.catalog__items > .catalog__item > link',
        label: 'PRODUCT',
        transformRequestFunction: (request) => {
          if (productUrls.has(request.url)) return false
          return request
        }
      })

      await enqueueLinks({
        selector: '.pagination > li > a',
        label: 'PAGE',
        transformRequestFunction: (request) => {
          if(request.url.includes('?items_per_page=96')) return request
          request.url = request.url + '?items_per_page=96'
          return request
        }
      });

    } else {
      await enqueueLinks({
        selector: '.menu-m__menu > li:not(:first-child):not(:last-child) > a.link-havesub',
        label: 'PAGE',
        transformRequestFunction: (request) => {
          request.url = request.url + '?items_per_page=96'
          return request
        }
      });
    }

    // Save results as JSON to ./storage/datasets/default
    // await Dataset.pushData({ title, url: request.loadedUrl });

    // Extract links from the current page
    // and add them to the crawling queue.

  },
});

// await crawler.run();
await crawler.run(startUrls);
