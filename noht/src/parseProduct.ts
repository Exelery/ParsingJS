import * as cheerio from 'cheerio';
import jsonfile from 'jsonfile'
import {decode} from 'html-entities';


export function parsePage($: cheerio.CheerioAPI, url = '') {

  // for( let el of document.querySelectorAll('.product-card-full-chars__text .bold')) {
  //   // console.log(el.textContent)
  //   if(el.textContent.includes("Артикул") ){console.log(el.nextElementSibling.textContent)}
  // }
  const code = $('.code-product:contains("Код")').text().replace("Код: ", "").trim()
  const article = $('.code-product:contains("Артикул")').text().replace("Артикул:", "").trim() || ''
  const tempData = {
    productName: $('h1').text(),
    id: code,
    productNumber: article? article: code,
    // unit: json.skuInfo.unit,
    step: 1,
    start: 1,
    category: getCategories($).join('///'),
    images: getImages($).join('; '),
    price: $('.product__price meta[itemprop="price"]').attr('content'),
    // country: $('.product-country').text(),
    language: 'ru',
    seoKeywordst: $('meta[name="keywords"]').attr('content'),
    seoTitle: $('title').text(),
    seoDescription: $('meta[name="description"]').attr('content'),
    // weight: json.dimensions ? json.dimensions.packWeight : '',
    brand: getBrand($),
    props: getProps($).join('; '),
    url: url,
    tracking: 'D',
    quantity: 20,
    description: decode($('.tab-description > p').html()) || '',
  }
  
  jsonfile.writeFile('data/productNoht.json', tempData, { flag: 'a', EOL: ',\r\n' })
  // console.log('product', url)
  console.log('product', url)
  return tempData

}


// function getNumber($: cheerio.CheerioAPI) {
//   let answer = ''
//   $('.product-card-full-chars__text .bold').each((_, element) => {
//     const el = $(element)
//     if (el.text().includes('Артикул')) {
//       console.log(el.next().text());
//       answer = el.next().text()
//     }
//   })
//   return answer
// }


function getCategories($: cheerio.CheerioAPI) {
  const elements = $('.breadcrumbs li a')
  const textContentArray: string[] = []
  elements.each((index, element) => {
    if(index > 1) {
      let textContent = $(element).text();
      textContentArray.push(textContent);
    }
   
  });
  return textContentArray
}

function getBrand($: cheerio.CheerioAPI) {
  const element = $('td:contains("Производитель")');
  const next = element.next().text().trim();
  return next
}

function getImages($: cheerio.CheerioAPI) {
  // console.log($)
  const images: string[] = []
  const imgHrefs = $('.slick__item:not(.clone) a')
  imgHrefs.each((_, element) => {
    let image = $(element).attr('href') || '';
    images.push('https://noht.ru' + image);
  });
  return images
  
}

function getProps($: cheerio.CheerioAPI) {
  const answer: string[] = []
  const rows = $('.responsive-table tr')
  rows.each((_, element) => {
    // console.log(element)
    let [a, b] = $(element).find('td')
    // console.log('test ', $(a).text(), $(b).text())
    let name = $(a).text().trim()
    let property =$(b).text().trim()
    if(name === 'Высота' || name === 'Длина' || name === 'Ширина'
    || name === 'Вес' || name === 'Глубина' || isNumeric(property.split(' ')[0])){
      name = `${name} ${property.split(' ')[1]}:`
      property = `O[${property.split(' ')[0]}]`
    } else if (name.includes('Производитель') || name.includes('Страна')) {
      name = `${name}:`
      property = `E[${property}]`
    }  else if (name.includes('Состав комплекта') || name.includes('Артикул') || name.includes('Доп. информация')) {
      name = `${name}:`
      property = `T[${property}]`
    } else {
      name = `${name}:`
      property = `S[${property}]`
    }
    answer.push(`${name} ${property}`)
  })
  return answer
}

function isNumeric(value: string) {
  const floatNumberRegex = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;
  return floatNumberRegex.test(value);
}