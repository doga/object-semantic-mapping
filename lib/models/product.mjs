
import {
  namedNode, literal, quad,
  Store,
  SemanticData,
  I18nString, Model,
  rdf, rdfs, xsd,
  schema,
  // foaf, bio, prov, cwrc,
  // cv, country, org, bibo, time, skos, dcterms, cc, cert,
  // qrm,
  a
} from '../imports.mjs';

import {Offer} from './offer.mjs';

class Product extends Model {
  /** @type {string[]} */
  static classes = [`${schema}Product`,];

  /** 
   * Prefixes that are used by this model.
   * @type {Object.<string, string>} 
   **/
  static prefixes = { schema, };

  /** 
   * Reads products from an in-memory RDF store.
   * Compatible with Qworum's `qworum-for-web-pages` library if it uses the same N3 library version.
   * @param {(SemanticData|SemanticData[])} semanticData
   * @param {number} count - max number of products to read
   * @return {Product[]} 
   * @throws {TypeError}
   **/
  static readFrom(semanticData, count) {
    // console.debug(`Product.read`);
    if (count) {
      if (typeof count !== 'number') throw new TypeError(`not a count`);
      count = Math.floor(count);
      if (count < 1) throw new TypeError(`not a count: ${count}`);
    }
    if (!(semanticData instanceof Array)) semanticData = [semanticData];
    // console.debug(`#sd before: ${semanticData.length}`);
    semanticData = semanticData
      .map(sd => (sd && sd.getTag && sd.getTag() === 'semantic') ? sd : null) // TIP: duck-typing is recommended, as `instanceof` can lead to version compatibility issues with other libraries.
      .filter(sd => sd);
    // console.debug(`#sd: ${semanticData.length}`);

    let readCount = 0;
    const products = [];
    // Read product ids
    for (const sd of semanticData) {
      const store = sd.value;
      for (const productClass of Product.classes) {
        for (const quad of store.match(null, a, namedNode(productClass))) {
          if (quad.subject.datatype) continue; // ignore literals
          // console.debug(`found product id: ${quad.subject.value}`);
          const
            id = quad.subject.value,
            product = new Product(id, semanticData),
            alreadyAdded = !!products.find(p => p.isSameAs(product));

          // console.debug(`found product.id: ${product.idsArray} `);
          // console.debug(`found product id: ${id} (type: ${typeof id})`);
          // console.debug(`was already added: ${alreadyAdded}`);
          if (!alreadyAdded) {
            products.push(product);
            readCount++;
            if (count && count === readCount) return products;
          }
        }
      }
    }
    return products;
  }

  static readOne(semanticData) {
    return Product.read(semanticData, 1);
  }

  // In-object data

  /** @type {string[]} */
  #productId = [];

  /** @type {I18nString[]} */
  #name = [];

  /** @type {I18nString[]} */
  #description = [];

  /** @type {Offer[]} */
  #offer = [];

  /** 
   * @param {string} id - an IRI 
   * @param {SemanticData} semanticData 
   **/
  constructor(id, semanticData) {
    super(id, semanticData);
  }

  /** 
   * @return {(string|undefined|null)} 
   **/
  get productId() { 
    if(this.#productId)return this.#productId; 
    // console.debug(`productId not set in-memory, searching in semantic data stores..`);
    // search in semantic data stores
    for (const sd of this.semanticData) {
      const store = sd.value;
      for (const id of this.idsArray) {
        // console.debug(`searching productId for subject id: ${id}`);
        for (const quad of store.match(id, namedNode(`${schema}productId`), null)) {
          if (typeof quad.object === 'object' && quad.object.datatype) {
            // console.debug(`found literal object (datatype: ${quad.object.datatype.value}): ${quad.object.value}`);
            if (quad.object.datatype.value === `${xsd}string`) {
              return quad.object.value;
            }
          }
        }
      }
    }
    return null;
  }

  set productId(value) {
    if (!value) return;
    this.#productId = `${value}`;
  }

  /** 
   * Writes in-object data to a Store.
   * ⚠️ Does not write the data that is stored in this.semanticData.
   * If writing succeeds, then this returns some prefixes used for the named nodes.
   * @param {SemanticData} semanticData
   * @return {null} 
   **/
  writeTo(semanticData) {
    // console.debug(`writeTo`);
    if (!(semanticData && semanticData.getTag && semanticData.getTag() === 'semantic')) return;
    try {
      semanticData.addPrefixes(Product.prefixes);
      for (const id of this.idsArray) {
        // console.debug(`id: ${id}`);
        // rdf:type
        for (const rdfClass of Product.classes) {
          const q = quad(namedNode(id), a, namedNode(rdfClass));
          semanticData.value.add(q);
        }
        // schema:productId
        if (this.productId) {
          semanticData.value.add(
            quad(namedNode(id), namedNode(`${schema}productId`), literal(this.productId))
          );
        }
      }
    } catch (error) {
      console.error(`Error while writing to store: ${error}`);
    }
  }

  // toString = () => `${this.idsArray}`;
}

export { Product };
