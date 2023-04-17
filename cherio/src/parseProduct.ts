import * as cheerio from 'cheerio';
import jsonfile from 'jsonfile'
import {decode} from 'html-entities';


export function parsePage($: cheerio.CheerioAPI, url = '') {

  // for( let el of document.querySelectorAll('.product-card-full-chars__text .bold')) {
  //   // console.log(el.textContent)
  //   if(el.textContent.includes("Артикул") ){console.log(el.nextElementSibling.textContent)}
  // }
  // console.log($('.product-card-full-price-cost__new-price span').text().trim().replace(/\s/g, ''))
  const tempData = {
    productName: $('.product-card-header > h1').text(),
    id: $('.product-code').text(),
    productNumber: getNumber($),    
    // unit: json.skuInfo.unit,
    step: 1,
    start: 1,
    category: getCategories($).join('///'),
    images: getImages($).join('; '),
    price: $('.product-card-full-price-cost__new-price span').text().trim().replace(/\s/g, ''),
    country: $('.product-country').text(),
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
    description: decode($('#description > div').html()) || '',
  }
  
  jsonfile.writeFile('data/productSTM.json', tempData, { flag: 'a', EOL: ',\r\n' })
  console.log('product', url)
  return tempData

}


function getNumber($: cheerio.CheerioAPI) {
  let answer = ''
  $('.product-card-full-chars__text .bold').each((_, element) => {
    const el = $(element)
    if (el.text().includes('Артикул')) {
      console.log(el.next().text());
      answer = el.next().text()
    }
  })
  return answer
}


function getCategories($: cheerio.CheerioAPI) {
  const elements = $('.breadcrumb li:not(.active):not(:first-child)')
  const textContentArray: string[] = []
  elements.each((_, element) => {
    let textContent = $(element).text();
    if (textContent === 'Сантехника бытовая') textContent = 'Сантехника'
    textContentArray.push(textContent);
  });
  return textContentArray
}

function getBrand($: cheerio.CheerioAPI) {
  const element = $('div dt:contains("Бренд:")');
  const next = element.next().text().trim();
  return next
}

function getImages($: cheerio.CheerioAPI) {
  // console.log($)
  const images: string[] = []
  const imgHrefs = $('.product-card-full-image a')
  imgHrefs.each((_, element) => {
    let image = $(element).attr('href') || '';
    images.push(image);
  });
  return images
  
}

function getProps($: cheerio.CheerioAPI) {
  const answer: string[] = []
  const rows = $('#features .data-property')
  rows.each((_, element) => {
    // console.log(element)
    let name = $(element).find('dt').text().trim()
    let property = $(element).find('dd').text().trim()
    if(name.includes('Высота, см:') || name.includes('Длина, см:') || name.includes('Ширина, см:')
    || name.includes('Вес (кг):') || name.includes('Глубина, см:') || isNumeric(property)){
      property = `O[${property}]`
    } else if (name.includes('Бренд:') || name.includes('Страна:')) {
      property = `E[${property}]`
    } else if (name.includes('Гарантия:')) {
      name = 'Гарантия, лет:'
      property = `O[${parseFloat(property)}]`
    } else if (name.includes('Состав комплекта') || name.includes('Артикул') || name.includes('Доп. информация')) {
      property = `T[${property}]`
    } else {
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