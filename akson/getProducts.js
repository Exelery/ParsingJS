import jsonfile from 'jsonfile'
import { downloadImage } from './index.js'
import { downloadJson } from './axios.js'



const imgUrl = 'https://доскинец.рф/images/detailed/'
const api = (code) => `https://api1.akson.ru:8443/newcatalog/api/products/by-code/${code}/with-all`
// const tempData = [{ "title": "Окно ПВХ Rehau Blitz New двухстворчатое глух.повор прав., однокамер. стек., 116 x 120 см", "id": 9174237, "productType": "PRODUCT", "urlCode": "okno_pvkh_rehau_blitz_new_dvukhstvorchatoe_116x120_sm_glukh_povor_prav_odnokamer_stek_beloe", "sku": "632675" }, { "title": "Окно ПВХ Rehau Blitz New одностворчатое повор-откид.прав., однокамер. стек., 90 x 90 см", "id": 9174234, "productType": "PRODUCT", "urlCode": "okno_pvkh_rehau_blitz_new_odnostvorchatoe_90x90_sm_povor_otkid_prav_odnokamer_stek_beloe", "sku": "632643" }, { "title": "Окно ПВХ WHS 60 двухстворчатое глух.повор прав., однокамерный стеклопакет, 116 x 120 см", "id": 50016234, "productType": "PRODUCT", "urlCode": "okno_pvh_whs_60_dvuhstvorchatoe_gluh_povor_prav_odnokamernyy_steklopaket_116_x_120_sm", "sku": "642127" }, { "title": "Окно ПВХ WHS 60 одностворчатое повор-откид.прав.,однокамерный стеклопакет, 60 x 60 см", "id": 50016236, "productType": "PRODUCT", "urlCode": "okno_pvh_whs_60_odnostvorchatoe_povor_otkid_prav_odnokamernyy_steklopaket_60_x_60_sm", "sku": "642123" }, { "title": "Окно ПВХ WHS 60 одностворчатое откидное,однокамерный стеклопакет 70 x 50 см", "id": 50016239, "productType": "PRODUCT", "urlCode": "okno_pvh_whs_60_odnostvorchatoe_otkidnoe_odnokamernyy_steklopaket_70_x_50_sm", "sku": "642122" }, { "title": "Заглушка подоконника 600мм", "id": 50014140, "productType": "PRODUCT", "urlCode": "zaglushka_podokonnika_600mm", "sku": "290423" }, { "title": "Соединитель для подоконника 600мм", "id": 50014191, "productType": "PRODUCT", "urlCode": "soedinitel_dlya_podokonnika_600mm", "sku": "290424" }]


async function parseProduct(json, tempUrl) {
  try {
    if (json.price.r == 0 || json.price.r === '0.0') return
    const imagesNames = await saveImages(json.images)
    const category = json.sections.sort((a, b) => a.level - b.level).map(el => el.title).slice(1).join(' /// ')
    const propsArr = convertProps(json.props)
    const tempData = {
      title: json.title,
      id: json.id,
      sku: json.skuInfo.code,
      unit: json.skuInfo.unit,
      step: json.skuInfo.step,
      start: json.skuInfo.start,
      category: category,
      images: imagesNames.map(el => imgUrl + el).join('; '),
      price: json.price.r,
      country: json.country,
      language: 'ru',
      seoText: json.seoBlock ? json.seoBlock.text : '',
      seoTitle: json.seoBlock ? json.seoBlock.title : '',
      seoDescription: json.seoBlock.description,
      weight: json.dimensions ? json.dimensions.packWeight : '',
      brand: json.brand ? json.brand.title : '',
      props: propsArr.join('; '),
      url: tempUrl,
      tracking: 'D',
      quantity: 20,
      description: json.seoBlock ? json.seoBlock.detailText : '',
    }

    await jsonfile.writeFile('products/productsAll.json', tempData, { flag: 'a', EOL: ',\r\n' })
    return tempData
  } catch (error) {
    console.log(error)
  }

}

function saveImages(arr) {
  const names = arr.map(el => el.path.replaceAll('/', '') + '.jpg')
  console.log(arr.map(el => el.path))
  arr.forEach((el, index) => {
    downloadImage(el.path, names[index])
  })
  return names
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertProps(props) {
  const temp = props.map((el) => {
    if (el.code === "code" || el.code === 'country') {
      return `${el.name}: E[${el.values}]`
    }
    if (el.valueType === 'list') {
      return `${el.name}: S[${el.values}]`
    }
    if (el.valueType === 'numeric') {
      return `${el.name}: O[${el.values}]`
    }
    return `${el.name}: T[${el.values}]`
  })
  return temp
}

const urls = await jsonfile.readFile('categories/productsURLS.json')

let num = 0
const history = new Set()
for (const el of urls) {
  if (!history.has(el.sku)) {
    history.add(el.sku)
    await timeout(500)
    const url = api(el.urlCode)
    const answer = await downloadJson(url)
    // parseProduct(answer)
    console.log(num++)
    await parseProduct(answer, url)
  }

}

