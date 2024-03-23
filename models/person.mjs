
import { 
  namedNode, literal, quad,
  Store,
  SemanticData,
  I18nString, Model, 
  rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc,
  // cv, country, org, bibo, time, skos, dcterms, cc, cert,
  // qrm,
} from '../imports.mjs';

const
a = namedNode(`${rdf}type`);

class Person extends Model {
  /** @type {string[]} */
  static classes = [`${foaf}Person`, `${schema}Person`, `${cwrc}NaturalPerson`, `${prov}Agent`];

  /** 
   * Prefixes that are used by this model.
   * @type {Object.<string, string>} 
   **/
  static prefixes = { rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, };

  /** 
   * Reads persons from an in-memory RDF store.
   * Compatible with Qworum's `qworum-for-web-pages` library if it uses the same N3 library version.
   * @param {(SemanticData|SemanticData[])} semanticData
   * @param {number} count - max number of persons to read
   * @return {Person[]} 
   **/
  static readFrom(semanticData, count) {
    // console.debug(`Person.read`);
    if(count){
      if(typeof count !== 'number')throw new TypeError(`not a count`);
      count = Math.floor(count);
      if(count < 1)throw new TypeError(`not a count: ${count}`);
    }
    if (!(semanticData instanceof Array)) semanticData = [semanticData];
    semanticData = semanticData
      .map(sd => sd instanceof SemanticData ? sd : null)
      .filter(sd => sd);
    // console.debug(`#sd: ${semanticData.length}`);

    let readCount = 0;
    const persons = [];
    // Read person ids
    for (const sd of semanticData) {
      const store = sd.value;
      for (const personClass of Person.classes) {
        for (const quad of store.match(null, a, namedNode(personClass))) {
          if (quad.subject.datatype) continue; // ignore literals
          // console.debug(`found person id: ${quad.subject.value}`);
          const
          id           = quad.subject.value,
          person       = new Person(id, semanticData),
          alreadyAdded = persons.find(p => p.isSameAs(person));

          // console.debug(`found person.id: ${person.id} (type: ${typeof id})`);
          // console.debug(`found person id: ${id} (type: ${typeof id})`);
          // console.debug(`was already added: ${alreadyAdded}`);
          if (!alreadyAdded) {
            persons.push(person);
            readCount++;
            if(count && count === readCount)return persons;
          }
        }
      }
    }
    return persons;
  }

  static readOne(semanticData) {
    return Person.read(semanticData, 1);
  }

  // In-object data
  #names;
  #oneLineBios;
  #emails;

  constructor(id, semanticData) {
    super(id, semanticData);
    this.#names       = [];
    this.#oneLineBios = [];
    this.#emails      = [];// new Set();
  }

  /** 
   * @return {I18nString[]} 
   **/
  get names() { return this.#names; }

  /** 
   * @return {I18nString[]} 
   **/
  get oneLineBios() { return this.#oneLineBios; }

  /** 
   * @return {Set.<string>} 
   **/
  get emails() { return this.#emails; }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {I18nString[]} 
   **/
  get allNames() {
    const res = [];
    for (const sd of this.semanticData) {
      const store = sd.value;
      for (const id of this.idsArray) {
        for (const quad of store.match(id, namedNode(`${foaf}name`), null)) {
          res.push(I18nString.fromRdfLiteral(quad.object));
        }
      }
    }
    return res.filter(item => item).concat(this.names.filter(item => item instanceof I18nString));
  }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {I18nString[]} 
   **/
  get allOneLineBios() {
    const res = [];
    for (const sd of this.semanticData) {
      const store = sd.value;
      for (const id of this.idsArray) {
        for (const quad of store.match(id, namedNode(`${bio}olb`), null)) {
          res.push(I18nString.fromRdfLiteral(quad.object));
        }
      }
    }
    return res.filter(item => item).concat(this.oneLineBios.filter(item => item instanceof I18nString));
  }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {string[]} 
   **/
  get allEmails() {
    const res = [];
    for (const sd of this.semanticData) {
      const store = sd.value;
      for (const id of this.idsArray) {
        for (const quad of store.match(id, namedNode(`${foaf}mbox`), null)) {
          const mbox = quad.object;
          // console.debug(`Mailbox: ${mbox.value}`);
          if (!mbox.datatype) {
            // mbox is a namedNode
            try {
              const
              url      = new URL(mbox.value),
              protocol = url.protocol,
              email    = url.pathname.trim();
              if (protocol === 'mailto:' && email.length >= 3 && email.indexOf('@') >= 1) { // TODO better email address format verification
                res.push(email);
              }
            } catch (error) {
              console.error(`Error while parsing email address: ${error}`);
            }
          } else if (mbox.datatype.value === `${rdf}langString`) {
            res.push(mbox.value);
          } else {
            console.error(`Bad email address: ${mbox.value}`);
          }
        }
      }
    }
    return res.concat(this.emails.filter(item => typeof item === 'string'));
  }

  /** 
   * Writes in-object data to a Store.
   * ⚠️ Does not write the data that is stored in this.semanticData.
   * If writing succeeds, then this returns some prefixes used for the named nodes.
   * @param {SemanticData} semanticData
   * @return {void} 
   **/
  writeTo(semanticData) {
    // console.debug(`writeTo`);
    if (!(semanticData instanceof SemanticData))return;
    try {
      semanticData.addPrefixes(Person.prefixes);
      for (const id of this.idsArray) {
        // console.debug(`id: ${id}`);
        // rdf:type
        for (const rdfClass of Person.classes) {
          const q = quad(namedNode(id), a, namedNode(rdfClass));
          semanticData.value.add(q);
        }

        // TODO write these for the first ID only, then add a schema:sameAs property to the first ID for all other IDs:

        // foaf:name
        for (const name of this.names) {
          const q = quad(namedNode(id), namedNode(`${foaf}name`), literal(name.value, name.lang?.iso639_1));
          semanticData.value.add(q);
        }
        // bio:olb
        for (const olb of this.oneLineBios) {
          const q = quad(namedNode(id), namedNode(`${bio}olb`), literal(olb.value, olb.lang?.iso639_1));
          semanticData.value.add(q);
        }
        // foaf:mbox
        for (const mbox of this.emails) {
          const q = quad(namedNode(id), namedNode(`${foaf}mbox`), namedNode(`mailto:${mbox}`));
          semanticData.value.add(q);
        }
      }
    } catch (error) {
      console.error(`Error while writing to store: ${error}`);
      return null;
    }
  }

  // toString = () => `${this.idsArray}`;
}

export { Person };
