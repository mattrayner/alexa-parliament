# [![Alexa Parliament Skill][logo]][alexa-parliament]

> Simple, extendable, voice interaction with parliamentary data.

[Alexa Parliament Skill][alexa-parliament] is a [Node.js][node] application created by the [Parliamentary Digital Service][pds] that allows Alexa-enabled devices to communicate parliamentary data to it's users through a [VUI (_Voice User Interface_)][vui].

[![Build Status][shield-travis]][info-travis] [![License][shield-license]][info-license]

### Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Technical Documentation](#technical-documentation)
  - [Technical Overview](#technical-overview)
  - [Command Flowchart](#command-flowchart)
  - [Presentations](#presentations)
- [Development](#development)
  - [Requirements](#requirements)
  - [Getting Started with Development](#getting-started-with-development)
  - [Running the tests](#running-the-tests)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Technical Documentation


### Technical Overview
[![Alexa Parliament Technical Overview][overview-thumb]][overview-image]

The [technical overview][overview-image] covers how the skill itself functions. A user speaks a voice command, this triggers the AWS Lambda function running this node application, and the application contacts the parliamentary calendar.

### Command Flowchart
[![Alexa Parliament Command Flowchart][flowchart-thumb]][flowchart-image]

The [flowchart][flowchart-image] documents the flow of our skill, showing the user inputs, internal decisions, and eventual outputs.

### Presentations
Date | Name | PDF
---|---|---
2017-05-16 | Digital Team Meeting at PDS | [PDF](https://raw.githubusercontent.com/mattrayner/alexa-parliament/master/docs/Presentations/pdf/2017-05-16%20Digital%20Team%20Meeting%20at%20PDS/presentation.pdf)


## Development

### Requirements
[Alexa Parliament][alexa-parliament] requires the following:
* [Node.js][node] - [click here][node-version] for the exact version
* [npm][npm]


### Getting Started with Development
To clone the repository and set up the dependencies, run the following:
```bash
git clone https://github.com/mattrayner/alexa-parliament.git
cd alexa-parliament
npm install
```


### Running the tests
We use [Mocha][mocha] and [Chai][chai] (among others) for testing. The tests can be run using:
```bash
npm test
```


## Contributing
If you wish to submit a bug fix or feature, you can create a pull request and it will be merged pending a code review.

1. Fork the repository
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes (`git commit -am 'Add some feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Ensure your changes are tested using [Rspec][rspec]
1. Create a new Pull Request


## License
[grom][grom] is licensed under the [Open Parliament Licence][info-license].


[logo]:             https://cdn.rawgit.com/mattrayner/alexa-parliament/4c0498468e1b8afb27c0e1814615733da617c517/docs/repository-logo.svg
[alexa-parliament]: https://github.com/mattrayner/alexa-parliament
[node]:             https://nodejs.org/en/
[pds]:              https://www.parliament.uk/mps-lords-and-offices/offices/bicameral/parliamentary-digital-service/
[vui]:              https://en.wikipedia.org/wiki/Voice_user_interface
[overview-thumb]:   https://raw.githubusercontent.com/mattrayner/alexa-parliament/master/docs/overview-thumb.png
[overview-image]:   https://raw.githubusercontent.com/mattrayner/alexa-parliament/master/docs/Technical%20Overview/Parliament%20Alexa%20Skill%Basic%20Overview.png
[flowchart-thumb]:  https://raw.githubusercontent.com/mattrayner/alexa-parliament/master/docs/flowchart-thumb.png
[flowchart-image]:  https://raw.githubusercontent.com/mattrayner/alexa-parliament/master/docs/Technical%20Overview/Parliament%20Alexa%20Skill%20Command%20Flowchart.png
[node-version]:     https://github.com/mattrayner/alexa-parliament/blob/master/.nvmrc
[npm]:              https://www.npmjs.com
[mocha]:            https://mochajs.org
[chai]:             http://chaijs.com

[info-travis]:   https://travis-ci.org/mattrayner/alexa-parliament
[shield-travis]: https://img.shields.io/travis/mattrayner/alexa-parliament.svg

[info-license]:   https://github.com/mattrayner/alexa-parliament/blob/master/LICENSE
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg