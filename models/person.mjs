import {
  // N3
  DataFactory, Store, namedNode, literal, defaultGraph, quad,
} from '../imports.mjs';

import {
  // Prefixes
  rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, 
  // cv, country, org, bibo, time, skos, dcterms, cc, cert,
  // qrm,

  // Turtle/TriG shorthand
  a
} from "../defs.mjs";

import { I18nString } from '../util/i18nString.mjs';


class Person {
  /** @type {string[]} */
  static personClasses = [`${foaf}Person`, `${schema}Person`, `${cwrc}NaturalPerson`, `${prov}Agent`];

  /** 
   * @type {(Object.<string, string>|null)} 
   * */
  static rdfPrefixes = {rdf, rdfs, xsd, foaf, schema, bio, cwrc, prov};

  /** 
   * Reads persons from an in-memory RDF store.
   * Compatible with Qworum's `qworum-for-web-pages` library if it uses the same N3 library version.
   * @param {(Store|Store[]|{value:Store}|{value:Store}[])} store - store or stores
   * @param {number} count - max number of persons to read
   * @return {Person[]} 
   * */
  static read(stores) { // TODO Store[] should be Set.<Store> (how does === work on Store?)
    // console.debug(`Person`);
    if(!(stores instanceof Array))stores = [stores];
    stores = stores
    .map(store => store instanceof Store ? store : (store?.value instanceof Store ? store.value : null))
    .filter(store => store);
    
    const res = [];
    // Read person ids
    for (const store of stores) {
      for (const personClass of Person.personClasses) {
        for (const quad of store.match(null, a, namedNode(personClass))) {
          if(quad.subject.datatype)continue;
          const
          person       = new Person(quad.subject.value, stores),
          alreadyAdded = res.find(p => p.id === person.id);
          if (!alreadyAdded) res.push(person);
        }
      }
    }
    return res;
  }

  #stores;

  // In-object data
  #id;
  #names;
  #oneLineBios;
  #emails;

  constructor(id, stores) {
    if(typeof id !== 'string')throw new TypeError('bad id');
    if(stores && !(stores instanceof Array && stores.every(s => s instanceof Store)))throw new TypeError('bad stores');

    this.#stores = stores ?? [];
    this.#id     = id;
    this.#names  = [];
    this.#oneLineBios = [];
    this.#emails = [];
  }
  

  /** 
   * @return {Store[]} 
   * */
  get stores() { return this.#stores; }

  /** 
   * @return {string} 
   * */
  get id() { return this.#id; }

  /** 
   * @return {I18nString[]} 
   * */
  get names() { return this.#names; }

  /** 
   * @return {I18nString[]} 
   * */
  get oneLineBios() { return this.#oneLineBios; }

  /** 
   * @return {string[]} 
   * */
  get emails() { return this.#emails; }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {I18nString[]} 
   * */
  get allNames() {
    const res = [];
    for (const store of this.stores) {
      for (const quad of store.match(this.#id, namedNode(`${foaf}name`), null)) {
        res.push(I18nString.fromRdf(quad.object));
      }
    }
    return res.filter(item => item).concat(this.names.filter(item => item instanceof I18nString)); 
  }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {I18nString[]} 
   * */
  get allOneLineBios() {
    const res = [];
    for (const store of this.stores) {
      for (const quad of store.match(this.#id, namedNode(`${bio}olb`), null)) {
        res.push(I18nString.fromRdf(quad.object));
      }
    }
    return res.filter(item => item).concat(this.oneLineBios.filter(item => item instanceof I18nString)); 
  }

  /** 
   * Does a real-time search in all stores, in addition to returning the in-object data.
   * @return {string[]} 
   * */
  get allEmails() {
    const res = [];
    for (const store of this.stores) {
      for (const quad of store.match(this.#id, namedNode(`${foaf}mbox`), null)) {
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
    }
    return res.concat(this.emails.filter(item => typeof item === 'string')); 
  }

  /** 
   * Writes in-object data to a Store.
   * ⚠️ Does not write the data that is stored in this.stores.
   * If writing succeeds, then this returns some prefixes used for the named nodes.
   * @param {Store|{value:Store}} store - N3 store or SemanticData
   * @return {(Object.<string, string>|null)} 
   * */
  writeTo(store){ // TODO prefix handling
    // console.debug(`writeTo`);
    if(!(store instanceof Store)){
      if (store?.value instanceof Store) {
        store = store.value;
      } else {
        return null;
      }
    }
    try {
      // rdf:type
      for (const rdfClass of Person.personClasses) {
        const q = quad(namedNode(this.id),a,namedNode(rdfClass));
        store.add(q);
      }
      // foaf:name
      for (const name of this.names) {
        const q = quad(namedNode(this.id),namedNode(`${foaf}name`),literal(name.value, name.lang?.code639_1));
        store.add(q);
      }
      // bio:olb
      for (const olb of this.oneLineBios) {
        const q = quad(namedNode(this.id),namedNode(`${bio}olb`),literal(olb.value, olb.lang?.code639_1));
        store.add(q);
      }
      // foaf:mbox
      for (const mbox of this.emails) {
        const q = quad(namedNode(this.id),namedNode(`${foaf}mbox`),namedNode(`mailto:${mbox}`));
        store.add(q);
      }
    } catch (error) {
      console.error(`Error while writing to store: ${error}`);
      return null;
    }
    return Person.rdfPrefixes;
  }

  toString = () => `${this.id}`;
}

export { Person };
