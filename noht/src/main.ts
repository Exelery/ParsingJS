// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration, log } from 'crawlee';
import { parsePage } from './parseProduct'
import jsonfile from 'jsonfile'
const json = await jsonfile.readFile('data/productNohtTemp.json')
const productUrls = new Set(json.map((el: any) => el.url))

const startUrls = ['https://noht.ru/'];
// const startUrls = [{url:'https://noht.ru/catalog/dlya-vannoy/unitazy/unitazy/846739_63121.html', label: "PRODUCT"},
// {url: 'https://noht.ru/catalog/catalog/dlya-vannoy/dushevye-kabiny/2118879_175730.html', label: 'PRODUCT'}];
const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    // maxRequestsPerCrawl: 40,
    maxRequestsPerMinute: 110,
    async requestHandler({ request, $, enqueueLinks, log }) {
      log.debug(`Processing ${request.url}...`);
      // log.info(`page ${request.url}`);
      if (request.label === "PRODUCT") {
       
        const results = parsePage($, request.loadedUrl)
  
      } else if (request.label === "PAGE") {
        log.info(`page ${request.url}`);
        await enqueueLinks({
          selector: '.product .product__name a',
          label: 'PRODUCT',
          transformRequestFunction: (request) => {
            if (request.url.includes('.html') && !productUrls.has(request.url)) return request
            return false
          }
        })
  
        await enqueueLinks({
          selector:'.product .product__name',
          label: 'PAGE',
        });
        await enqueueLinks({
          selector:'a.pagination__item',
          label: 'PAGE',
        });
  
      } else {
        await enqueueLinks({
          selector: '.accordion-item-tap--js > a:not(:contains("Акции"))',
          label: 'PAGE',
          // transformRequestFunction: (request) => {
          //   request.url = request.url + '?items_per_page=96'
          //   return request
          // }
        });
      }
    }
});

await crawler.run(startUrls);
