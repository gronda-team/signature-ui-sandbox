This project was bootstrapped with 
[Create React App](https://github.com/facebookincubator/create-react-app).
This repository represents the most recent version of Signature UI
that is currently in the pipeline. At its core, it draws heavily
from how [Angular Material](https://github.com/angular/material2)
structures their UI library, but painted with Gronda theming.

# Table of Contents
- [Available/planned components](#available/planned-components)
- [Storybook and testing](#storybook-and-testing)

## Available/planned components
The original design provided by Signature UI mandates the following
components: 
- Form controls
  - Autocomplete/data list
  - Checkboxes and radio buttons
  - Input fields/text areas
  - Form fields
  - Select dropdowns
  - Numeric range slider
  - Tags
- Layout components
  - Divider
- Buttons, button toggles
- Overlays, tooltips

Several of these components are in process, while others require
some more consideration/planning before they can be executed.
As stated earlier, this library draws on the core structure
of Angular Material (translated into React). Rather than reinvent
the wheel, this library is an opportunity to stand on the
shoulders of giants and see how to successfully implement
these common building blocks all across the web. In version 1
of Signature UI, we encountered the same problems that
plagued Angular Material several years ago—and with that
attitude, we believe that we can learn a lot using them as
our source material.

## Storybook and Testing
To perform some UI testing, this repository uses 
[Storybook](https://storybook.js.org/), and it can be run
via
```node
npm run storybook
```

This repository also uses the [Jest](https://jestjs.io/)\/[Enzyme](https://airbnb.io/enzyme/)
ecosystem for unit testing/mild integration testing. They can also
be run using
```node
npm test
```
as described by Jest.
