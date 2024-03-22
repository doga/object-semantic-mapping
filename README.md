# object-semantic-mapping

ORM, but for RDF semantic data.

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.1.5/mod.mjs";`

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
import { Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.2.0/mod.mjs";
import { QworumScript } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.4.0/mod.mjs";
const SemanticData = QworumScript.SemanticData.build;

async function test() {
  const turtleFile = new URL('https://qworum.net/data/DoğaArmangil.ttl');
  console.info(`Fetching: ${turtleFile}`);
  const
  response = await fetch(turtleFile),
  text     = await response.text(),
  sd       = SemanticData();
  // console.debug(`sd: ${sd.toRawString()}`);
  // console.debug(`𝑻𝑬𝑿𝑻:\n${text}`);


  await sd.readFromText(text);
  // console.debug(`𝑺𝑫:\n${sd.toRawString()}`);
  console.debug(`jjjjjjjj.`);
  const persons  = Person.readOne(sd);
  console.debug(`pppppppp.`);
  console.debug(`\n${persons.length} persons found.`);

  for (const person of persons) {
    console.info(`Found a person in the fetched file.`);
    console.info(`\nPerson's data before adding in-object data:`);
    displayPersonData(person);
    const
    store = await Qworum.SemanticData(),
    email = 'a@b.com',
    bio   = [
      new I18nString('Une bio.', 'fr'),
      new I18nString('Eine Bio.', 'de')
    ];

    console.info(`\nAdding in-object email property to person: ${email}`);
    person.emails.push(email);
    console.info(`Adding in-object bio property to person: ${bio[0]}`);
    person.oneLineBios.push(bio[0]);
    console.info(`Adding in-object bio property to person: ${bio[1]}`);
    person.oneLineBios.push(bio[1]);
    console.info(`\nPerson's data as it exists in-object and in the fetched file:`);
    displayPersonData(person);

    person.writeTo(store);
    console.info(`\n𝑾𝑹𝑰𝑻𝑻𝑬𝑵 𝑻𝑯𝑬 𝑷𝑬𝑹𝑺𝑶𝑵 𝑻𝑶 𝑨𝑵 𝑬𝑴𝑷𝑻𝒀 𝑵3 𝑺𝑻𝑶𝑹𝑬, 𝑾𝑯𝑰𝑪𝑯 𝑵𝑶𝑾 𝑪𝑶𝑵𝑻𝑨𝑰𝑵𝑺:\n\n${store}`);
  }
  // console.info(`\nNote that only the in-object data is written.`);
}

function displayPersonData(person) {
  console.info(`  ID:   <${person}>`);
  for (const name of person.allNames) console.info(`  name:  ${name}`);
  for (const bio of person.allOneLineBios) console.info(`  bio:   ${bio}`);
  for (const email of person.allEmails) console.info(`  email: <${email}>`);
}

await test();
```

Sample output for the code above:

```text

Fetching: https://qworum.net/data/Do%C4%9FaArmangil.ttl
Found a person in the fetched file.

Person's data before adding in-object data:
  ID:   <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>

Adding in-object email property to person: a@b.com
Adding in-object bio property to person: Une bio.
Adding in-object bio property to person: Eine Bio.

Person's data as it exists in-object and in the fetched file:
  ID:   <https://qworum.net/data/DoğaArmangil.ttl#id>
  name:  Doğa Armangil
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  bio:   Une bio.
  bio:   Eine Bio.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>
  email: <a@b.com>

Written the person to an empty N3 store, which now contains:

SemanticData(<https://qworum.net/data/DoğaArmangil.ttl#id> a <http://xmlns.com/foaf/0.1/Person>, <https://schema.org/Person>, <http://sparql.cwrc.ca/ontologies/cwrc#NaturalPerson>, <http://www.w3.org/ns/prov#Agent>;
    <http://purl.org/vocab/bio/0.1/olb> "Une bio."@fr, "Eine Bio."@de;
    <http://xmlns.com/foaf/0.1/mbox> <mailto:a@b.com>.
)

Note that only the in-object data is written.
```

∎
