# object-semantic-mapping

ORM, but for RDF semantic data.

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.2.3/mod.mjs";`

## Compatibility

Compatible with:

- N3 Stores created with [N3@1.17.2](https://github.com/doga/N3)
- Semantic data objects created with [qworum-for-web-pages@1.3.5](https://github.com/doga/qworum-for-web-pages)

## Usage

_Tip: Run the following example by typing this in your terminal (requires Deno):_

```shell
deno run --allow-net --allow-run --allow-env --allow-read https://deno.land/x/mdrb/mod.ts https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md
```

<details data-mdrb>
<summary>Read semantic data from the Web, and manipulate it in-memory.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { Person, SemanticData, I18nString } from "https://esm.sh/gh/doga/object-semantic-mapping@0.2.3/mod.mjs";

async function demo() {
  const
  urls = [
    new URL('https://qworum.net/data/DoğaArmangil.ttl'),
    new URL('https://dbpedia.org/data/Bob_Marley.ttl'),
    new URL('https://www.w3.org/People/Berners-Lee/card'),
    new URL('https://dbpedia.org/data/Claude_Shannon.ttl'),
  ],
  sd = new SemanticData();

  // Read files
  for (const url of urls) {
    console.info(`Fetching: ${url}`);
    try {
      await sd.readFromUrl(url);
    } catch (error) {}
  }

  // Read persons in files
  const 
  persons = Person.readFrom(sd),
  sd2     = new SemanticData(),
  bio     = new I18nString('Une bio.', 'fr');

  console.info(`Found ${persons.length} persons in total.`);
  for (const person of persons) {
    console.info(`\nFound a person with following data on file:`);
    displayPersonData(person);
    console.info(`\nAdding in-object bio property to person: ${bio}`);
    person.oneLineBios.push(bio);
    console.info(`\nPerson's data as it exists in-object and in the fetched files:`);
    displayPersonData(person);

    person.writeTo(sd2);
  }
  console.info(`\n𝑾𝑹𝑰𝑻𝑻𝑬𝑵 𝑻𝑯𝑬 𝑼𝑷𝑫𝑨𝑻𝑬𝑫 𝑷𝑬𝑹𝑺𝑶𝑵𝑺 𝑻𝑶 𝑨𝑵 𝑬𝑴𝑷𝑻𝒀 𝑺𝑬𝑴𝑨𝑵𝑻𝑰𝑪 𝑫𝑨𝑻𝑨 𝑪𝑶𝑵𝑻𝑨𝑰𝑵𝑬𝑹, 𝑾𝑯𝑰𝑪𝑯 𝑵𝑶𝑾 𝑪𝑶𝑵𝑻𝑨𝑰𝑵𝑺:\n\n${sd2}`);
  console.info(`\n𝘕𝘰𝘵𝘦: 𝘰𝘯𝘭𝘺 𝘵𝘩𝘦 𝘪𝘯-𝘰𝘣𝘫𝘦𝘤𝘵 𝘥𝘢𝘵𝘢 𝘪𝘴 𝘸𝘳𝘪𝘵𝘵𝘦𝘯.`);
}

function displayPersonData(person) {
  for (const id of person.idsArray) {
    console.info(`  ID:    <${id}>`);
  }
  for (const name of person.allNames) console.info(`  name:  ${name}`);
  for (const bio of person.allOneLineBios) console.info(`  bio:   ${bio}`);
  for (const email of person.allEmails) console.info(`  email: <${email}>`);
}

await demo();
```

Sample output for the code above:

```text
Fetching: https://qworum.net/data/Do%C4%9FaArmangil.ttl
Fetching: https://dbpedia.org/data/Bob_Marley.ttl
Fetching: https://www.w3.org/People/Berners-Lee/card
Fetching: https://dbpedia.org/data/Claude_Shannon.ttl
Found 4 persons in total.

Found a person with following data on file:
  ID:    <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>

Adding in-object bio property to person: Une bio.

Person's data as it exists in-object and in the fetched files:
  ID:    <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  bio:   Une bio.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>

Found a person with following data on file:
  ID:    <http://dbpedia.org/resource/Bob_Marley>
  name:  Bob Marley

Adding in-object bio property to person: Une bio.

Person's data as it exists in-object and in the fetched files:
  ID:    <http://dbpedia.org/resource/Bob_Marley>
  name:  Bob Marley
  bio:   Une bio.

Found a person with following data on file:
  ID:    <https://www.w3.org/People/Berners-Lee/card#i>
  name:  Timothy Berners-Lee
  email: <timbl@w3.org>

Adding in-object bio property to person: Une bio.

Person's data as it exists in-object and in the fetched files:
  ID:    <https://www.w3.org/People/Berners-Lee/card#i>
  name:  Timothy Berners-Lee
  bio:   Une bio.
  email: <timbl@w3.org>

Found a person with following data on file:
  ID:    <http://dbpedia.org/resource/Claude_Shannon>
  name:  Claude Shannon

Adding in-object bio property to person: Une bio.

Person's data as it exists in-object and in the fetched files:
  ID:    <http://dbpedia.org/resource/Claude_Shannon>
  name:  Claude Shannon
  bio:   Une bio.

𝑾𝑹𝑰𝑻𝑻𝑬𝑵 𝑻𝑯𝑬 𝑼𝑷𝑫𝑨𝑻𝑬𝑫 𝑷𝑬𝑹𝑺𝑶𝑵𝑺 𝑻𝑶 𝑨𝑵 𝑬𝑴𝑷𝑻𝒀 𝑺𝑬𝑴𝑨𝑵𝑻𝑰𝑪 𝑫𝑨𝑻𝑨 𝑪𝑶𝑵𝑻𝑨𝑰𝑵𝑬𝑹, 𝑾𝑯𝑰𝑪𝑯 𝑵𝑶𝑾 𝑪𝑶𝑵𝑻𝑨𝑰𝑵𝑺:

SemanticData(
  @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix schema: <https://schema.org/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix bio: <http://purl.org/vocab/bio/0.1/>.
  @prefix prov: <http://www.w3.org/ns/prov#>.
  @prefix cwrc: <http://sparql.cwrc.ca/ontologies/cwrc#>.

  <https://qworum.net/data/DoğaArmangil.ttl#id> a foaf:Person, schema:Person, cwrc:NaturalPerson, prov:Agent;
      bio:olb "Une bio.".
  <http://dbpedia.org/resource/Bob_Marley> a foaf:Person, schema:Person, cwrc:NaturalPerson, prov:Agent;
      bio:olb "Une bio.".
  <https://www.w3.org/People/Berners-Lee/card#i> a foaf:Person, schema:Person, cwrc:NaturalPerson, prov:Agent;
      bio:olb "Une bio.".
  <http://dbpedia.org/resource/Claude_Shannon> a foaf:Person, schema:Person, cwrc:NaturalPerson, prov:Agent;
      bio:olb "Une bio.".

)

𝘕𝘰𝘵𝘦: 𝘰𝘯𝘭𝘺 𝘵𝘩𝘦 𝘪𝘯-𝘰𝘣𝘫𝘦𝘤𝘵 𝘥𝘢𝘵𝘢 𝘪𝘴 𝘸𝘳𝘪𝘵𝘵𝘦𝘯.
```

∎
