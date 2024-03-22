import {
  // N3
  DataFactory, Store, namedNode, literal, defaultGraph, quad,
} from '../imports.mjs';

import {
  // Prefixes
  rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, 
  cv, country, org, bibo, time, skos, dcterms, cc, cert,
  qrm,

  // Turtle/TriG shorthand
  a
} from "../defs.mjs";

import { I18nString } from '../util/i18nString.mjs';


class Model {
  /** 
   * Well-known prefixes.
   * @type {Object.<string, string>} 
   * */
  static wellKnownPrefixes = {
    rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc, 
    cv, country, org, bibo, time, skos, dcterms, cc, cert,
    qrm,
  };

  static N3 = {
    // N3
    DataFactory, Store, namedNode, literal, defaultGraph, quad,
  };

  #stores;

  // In-object data
  #id;

  constructor(id, stores) {
    if(typeof id !== 'string')throw new TypeError('bad id');
    if(stores && !(stores instanceof Array && stores.every(s => s instanceof Store)))throw new TypeError('bad stores');

    this.#stores = stores ?? [];
    this.#id     = id;
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
   * @return {string} 
   * */
  toString = () => `${this.id}`;
}

export { Model };
