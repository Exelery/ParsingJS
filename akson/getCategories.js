import { appendFile, createWriteStream, existsSync, mkdirSync } from 'fs';
import jsonfile from 'jsonfile'
import { downloadCategories } from './axios.js'

const url = 'https://api1.akson.ru:8443/newcatalog/api/filters/by-category-code/'

async function parseJsonCategories(json) {
  if (!json.category || !json.category.children) {
    console.log(json)
    return
  }
  const children = json.category.children
  const answer = []
  children.forEach(el => {
    const tempData = {
      title: el.title,
      id: el.id,
      categoryType: el.categoryType,
      urlCode: el.url.code
    }
    jsonfile.writeFile('categories/allCategories.json', tempData, { flag: 'a', EOL: ',\r\n' })
    answer.push(tempData)

  })
  // if (answer.length > 0) await jsonfile.writeFile('categories/allCategories.json', answer, { flag: 'a', EOL: ',\r\n' })
  return answer
}

async function parseJsonProducts(json) {

  if (!json.products || !json.products.items) {
    console.log(json)
    return
  }
  const products = json.products.items

  const answer = []
  products.forEach(el => {
    const tempData = {
      title: el.title,
      id: el.id,
      productType: el.url.type,
      urlCode: el.url.code,
      sku: el.skuInfo.code
    }
    jsonfile.writeFile('categories/productsURLS.json', tempData, { flag: 'a', EOL: ',\r\n' })
    answer.push(tempData)

  })
  
  return answer
}

const folderPath = 'categories'

if (!existsSync(folderPath)) {
  mkdirSync(folderPath);
}

let number = 0
async function parse(arr) {
  console.log(++number, arr)
  for (let el of arr) {
    if (el.categoryType !== "CATEGORY_FAKE") {
      await timeout(500)
      const temp = await downloadCategories(`${url}${el.urlCode}`)
      if (temp) {
        if (temp.products && temp.products.items && temp.products.items.length > 0) {
          console.log("last")
          await parseJsonProducts(temp)
        }
        const categories = await parseJsonCategories(temp)
        if (categories.length > 0) {
          await parse(categories)
        }
      }
    }
  }
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    const myJson = await downloadCategories(`${url}catalog_root`)
    const cat = await parseJsonCategories(myJson)
    await parse(cat)
  } catch (error) {
    console.log(error)
  }
}
main();