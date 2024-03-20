# object-semantic-mapping

ORM, but for RDF semantic data.

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { Language, I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.1.4/mod.mjs";`

## Compatibility

Compatible with:

- N3 Stores created with [doga/N3@1.17.2](https://esm.sh/gh/doga/N3@1.17.2/mod.mjs)
- Semantic data objects created with [doga/qworum-for-web-pages@1.3.5](https://esm.sh/gh/doga/qworum-for-web-pages@1.3.5/mod.mjs)

## Usage

```shell
$ deno
> import { Language, I18nString, Person } from "https://esm.sh/gh/doga/object-semantic-mapping@0.1.4/mod.mjs";
undefined
> import { Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.3.5/mod.mjs";

async function test() {
  const
  response = await fetch('https://qworum.net/data/Do%C4%9FaArmangil.ttl'),
  text     = await response.text(),
  semantic = await Qworum.SemanticData(text),
  store    = await Qworum.SemanticData(''),
  persons  = Person.read(semantic);

  for (const person of persons) {
    console.info(`Person ID: ${person}`);
    // console.info(`  name: ${person.names[0]}`);
    // console.info(`  bio : ${person.oneLineBios[0]}`);
    person.names.push(new I18nString('Veli', 'tr'));
    person.emails.push('a@b.com');
    person.oneLineBios.push(new I18nString('a bio.', 'en'));
    person.oneLineBios.push(new I18nString('Eine Bio.', 'de'));
    for (const name of person.allNames) {
      console.info(`  name:  ${name}`);
    }
    for (const bio of person.allOneLineBios) {
      console.info(`  bio:   ${bio}`);
    }
    for (const email of person.allEmails) {
      console.info(`  email: <${email}>`);
    }

    console.debug(`writing person to empty store...`);
    person.writeTo(store);
  }
  console.info(`${store}`);

}

await test();


Person ID: https://qworum.net/data/DoğaArmangil.ttl#id
  name:  Doğa Armangil
  name:  a bio.
  name:  Eine Bio.
  bio:   EPFL software engineer living in Switzerland. Patent author. Business owner in software.
  bio:   a bio.
  bio:   Eine Bio.
  email: <d.armangil@qworum.net>
  email: <doga.armangil@alumni.epfl.ch>
  email: <a@b.com>
writing person to empty store...
SemanticData(<https://qworum.net/data/DoğaArmangil.ttl#id> a <http://xmlns.com/foaf/0.1/Person>, <https://schema.org/Person>, <http://sparql.cwrc.ca/ontologies/cwrc#NaturalPerson>, <http://www.w3.org/ns/prov#Agent>;
    <http://xmlns.com/foaf/0.1/name> "Veli"@tr;
    <http://purl.org/vocab/bio/0.1/olb> "a bio."@en, "Eine Bio."@de;
    <http://xmlns.com/foaf/0.1/mbox> <mailto:a@b.com>.
)
undefined
>
```

∎
