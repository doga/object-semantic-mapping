import {
  DataFactory, Store, namedNode, literal, defaultGraph, quad,
  xsd, rdfs, rdf, schema, cert, foaf, bio, cv, cwrc, country, org, bibo, time, skos, dcterms, cc, prov,
  qrm, a
} from '../imports.mjs';

class Person {
  /** 
   * Reads persons from an in-memory RDF store.
   * Compatible with Qworum's `qworum-for-web-pages` library if it uses the same N3 library version.
   * @param {(Store|{value:Store})} store
   * @return {Person[]} 
   * */
  static read(store) {
    // console.debug(`Person`);
    const res = [];
    if (!(store instanceof Store)) {
      if (store?.value instanceof Store) { // for Qworum semantic data
        // console.debug(`store: ${store.value}`);

        store = store.value;
      } else return res;
    }

    for (const quad of store.match(null, a, namedNode(`${foaf}Person`))) {
      const person = quad.subject;
      res.push(new Person(person, store));
    }
    return res;
  }

  #store;
  #id;
  constructor(id, store) {
    this.#id = id;
    this.#store = store;
  }

  get names() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${foaf}name`), null)) {
      const o = quad.object; // quad.subject, quad.predicate, quad.object
      res.push(o);
    }
    return res;
  }

  get oneLineBios() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${bio}olb`), null)) {
      const o = quad.object; // quad.subject, quad.predicate, quad.object
      res.push(o);
    }
    return res;
  }

  get emails() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${foaf}mbox`), null)) {
      const mbox = quad.object;
      // console.debug(`Mailbox: ${mbox.value}`);
      res.push(mbox);
    }
    return res;
  }

  toString = () => `${this.#id.value}`;
}

export { Person };
