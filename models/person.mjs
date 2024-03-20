import {
  // N3
  DataFactory, Store, namedNode, literal, defaultGraph, quad,
} from '../imports.mjs';

import {
  rdf, rdfs, xsd, schema, cert, foaf, bio, cv, cwrc, country, org, bibo, time, skos, dcterms, cc, prov,
  qrm,
  // Turtle/TriG shorthand
  a
} from "../defs.mjs";

import { I18nString } from '../util/i18nString.mjs';

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
    for (const personClass of [`${foaf}Person`, `${schema}Person`]) {
      for (const quad of store.match(null, a, namedNode(personClass))) {
        const
          person = new Person(quad.subject, store),
          alreadyAdded = res.find(p => p.id.value === person.id.value);
        if (!alreadyAdded) res.push(person);
      }
    }
    return res;
  }

  #store;
  #id;

  constructor(id, store) {
    this.#id = id;
    this.#store = store;
  }

  get id() { return this.#id; }
  get store() { return this.#store; }

  /** 
   * @return {I18nString[]} 
   * */
  get names() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${foaf}name`), null)) {
      res.push(I18nString.fromRdf(quad.object));
    }
    return res.filter(item => item); // prune the nulls
  }

  /** 
   * @return {I18nString[]} 
   * */
  get oneLineBios() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${bio}olb`), null)) {
      res.push(I18nString.fromRdf(quad.object));
    }
    return res.filter(item => item); // prune the nulls
  }

  /** 
   * @return {string[]} 
   * */
  get emails() {
    const res = [];
    for (const quad of this.#store.match(this.#id, namedNode(`${foaf}mbox`), null)) {
      const mbox = quad.object;
      // console.debug(`Mailbox: ${mbox.value}`);
      if (!mbox.datatype) {
        // mbox is a namedNode
        try {
          const
            url = new URL(mbox.value),
            protocol = url.protocol,
            email = url.pathname.trim()
            ;
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
    return res;
  }

  toString = () => `${this.#id.value}`;
}

export { Person };
