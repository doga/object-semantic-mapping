// import { 
//   N3,
//   QworumScript, 
//   I18nString, Model, 
// } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.5.7/mod.mjs";

// const 
// { DataFactory } = N3,
// { namedNode, literal, defaultGraph, quad } = DataFactory,
// Store = N3.Store,
// {
//   rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc,
//   cv, country, org, bibo, time, skos, dcterms, cc, cert,
//   qrm,
// } = Model.wellKnownPrefixes,
// {SemanticData} = QworumScript;

// const a = namedNode(`${rdf}type`);

// export { 
//   N3,
//   DataFactory,
//   namedNode, literal, defaultGraph, quad,
//   Store,

//   SemanticData,

//   I18nString, Model, 

//   // rdf prefixes
//   rdf, rdfs, xsd, schema, foaf, bio, prov, cwrc,
//   cv, country, org, bibo, time, skos, dcterms, cc, cert,
//   qrm,

//   a
// };

import dataFactory from 'https://esm.sh/gh/rdfjs-base/data-model@v2.0.1/index.js';

export {dataFactory};
