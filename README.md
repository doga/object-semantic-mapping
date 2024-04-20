<p align="left">
<a href="https://qworum.net" target="_blank" rel="noreferrer"><img src="https://github.com/doga/doga/raw/main/logos/Qworum-logo.svg" height="85" alt="Qworum" /></a>
</p>

# Object-semantic mapping

Object-semantic mapping (OSM) is like [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping), but for [RDF](https://www.w3.org/TR/rdf-primer/).

This ES6 JavaScript library defines a base model for creating in-memory model instances, and for reading models from and writing models to [DatasetCore](https://rdf.js.org/dataset-spec/#datasetcore-interface)-compliant datasets.

Applications would normally use subclasses that extend the base `Model` class. To illustrate how this is done, this library contains a `Person` model.

This library is intended as a solid foundation for building OSM models on, and for making RDF easy to manipulate by applications.

## How to import this library

- `import * as OSM from 'https://esm.sh/gh/doga/object-semantic-mapping@1.1.0/mod.mjs';`

## Usage examples

_Tip: Run the examples below by typing this in your terminal (requires Deno):_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  https://deno.land/x/mdrb@2.0.0/mod.ts \
  --dax=false --mode=isolated \
  https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md
```

<details data-mdrb>
<summary>Example: Create a model instance, and write it to an RDF dataset.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Model, IRI } from 'https://esm.sh/gh/doga/object-semantic-mapping@1.1.0/mod.mjs';
import { Store, Writer } from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';
const {schema} = Model.wellKnownPrefixes;

await demo();

async function demo() {
  console.info(`Creating new model instance ..`);
  const
  modelId   = IRI.parse('urn:isbn:0451450523'),
  modelType = IRI.parse(`${schema}Product`),
  model     = new Model(modelId, {types: modelType});

  console.info(`${model}`);

  console.info(`\nWriting the model instance to an empty dataset ..`);
  const store = new Store();
  model.writeTo(store);

  // Non-standard way of printing out the dataset
  const writer = new Writer();
  for (const quad of store) writer.addQuad(quad);
  writer.end((err, res) => {if (!err) console.info(`\nUpdated dataset:\n${res}`);});
}
```

Sample output for the code above:

```text
Creating new model instance ..
<urn:isbn:0451450523> a <https://schema.org/Product>.

Writing the model instance to an empty dataset ..

Updated dataset:
<urn:isbn:0451450523> a <https://schema.org/Product>.
```

<details data-mdrb>
<summary>Example: Read model instances from a dataset, based on Turtle file.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Model, IRI } from 'https://esm.sh/gh/doga/object-semantic-mapping@1.1.0/mod.mjs';
import { Store, Parser } from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';
const { org } = Model.wellKnownPrefixes;

await demo();

async function demo() {
  // build the dataset from a Turtle file
  const
  url          = IRI.parse('https://qworum.net/data/org.ttl'),
  response     = await fetch(url),
  text         = await response.text(),
  store        = new Store(),
  parser       = new Parser({baseIRI: `${url}`}),
  parseHandler = (error, quad, prefixes) => {if (quad) store.add(quad);};

  await parser.parse(text, parseHandler);

  // read the models from the dataset
  const models = await Model.readFrom(store, {types: IRI.parse(`${org}Organization`)});
  for (const model of models) console.info(`${model}`);
}
```

Sample output for the code above:

```text
<https://qworum.net/data/org.ttl#id> a <http://www.w3.org/ns/org#Organization>.
```

<details data-mdrb>
<summary>Example: Read persons from a dataset which is sourced from a Turtle file.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Person, IRI } from 'https://esm.sh/gh/doga/object-semantic-mapping@1.1.0/mod.mjs';
import { Store, Writer, Parser } from 'https://esm.sh/gh/doga/N3@1.18.0/mod.mjs';

await demo();

async function demo() {
  // build the dataset from a Turtle file
  const
  url          = IRI.parse('https://qworum.net/data/DoğaArmangil.ttl'),
  response     = await fetch(url),
  text         = await response.text(),
  store        = new Store(),
  parser       = new Parser({baseIRI: `${url}`}),
  parseHandler = (error, quad, prefixes) => {if (quad) store.add(quad);};
  await parser.parse(text, parseHandler);

  // read the persons from the dataset
  const persons = await Person.readFrom(store);

  for (const person of persons){
    console.info(`\n${person.id}`);

    // add in-memory data
    person.emails.add('an@email.example');

    const 
    names  = await person.getNames(),
    olbs   = await person.getOneLineBios(),
    emails = await person.getEmails();

    for (const name  of names)              console.info(`  name: ${name}`);
    for (const olb   of olbs)               console.info(`  one-line bio: ${olb}`);
    for (const email of emails)             console.info(`  email: ${email}`);
    for (const name  of person.names)       console.info(`  in-memory name: ${name}`);
    for (const olb   of person.oneLineBios) console.info(`  in-memory one-line bio: ${olb}`);
    for (const email of person.emails)      console.info(`  in-memory email: ${email}`);
  }

  console.info(`\nWriting the persons' ID, type(s) and in-memory data to an empty dataset ..`);
  const store2 = new Store();
  for(const person of persons) await person.writeTo(store2);

  // Non-standard way of printing out the dataset
  const writer = new Writer();
  for (const quad of store2) writer.addQuad(quad);
  writer.end((err, res) => {if (!err) console.info(`\nUpdated dataset:\n${res}`);});
}
```

Sample output for the code above:

```text
https://qworum.net/data/DoğaArmangil.ttl#id
  name: Doğa Armangil
  one-line bio: "EPFL software engineer living in Switzerland. Patent author. Business owner in software."@en
  email: d.armangil@qworum.net
  email: doga.armangil@alumni.epfl.ch
  in-memory email: an@email.example

Writing the persons' ID, type(s) and in-memory data to an empty dataset ..

Updated dataset:
<https://qworum.net/data/DoğaArmangil.ttl#id> a <http://xmlns.com/foaf/0.1/Person>, <https://schema.org/Person>, <http://sparql.cwrc.ca/ontologies/cwrc#NaturalPerson>, <http://www.w3.org/ns/prov#Agent>;
    <http://xmlns.com/foaf/0.1/mbox> <mailto:an@email.example>.
```

∎
