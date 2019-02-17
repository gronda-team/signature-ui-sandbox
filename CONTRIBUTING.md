# Contributions?
Thanks! We're thrilled you're here to help. Briefly, this is a set
of guidelines to enforce a common language/coding standard within
this repository.

**Note**: this is still in its beta version, and as of now, the author
has only collected some common style guidelines in the broadest
sense, rather than the minutiae of however many spaces between
methods and lines. As such, this is subject to change, and perhaps
in the future we might consider adding a linting library like ESLint,
but for now here is a good summary of some common conventions that 
were in place when this was a one-man circus.

## Styleguides
(Tentatively modeled after [Atom's contributing guidelines](https://github.com/atom/atom/blob/master/CONTRIBUTING.md).)
### Git commit messages
- Start commit message using a **keyword** that describes the 
change in question, such as the component, the CDK part of the library,
the repo as a whole, etc. (`CDK: refactor Overlay .attach to use async`).
- Separate the message keyword from the body using a colon
- Use the present tense (`Add feature` not `Added feature`)
- Use the imperative mood (`Move cursor to...` not `Moves cursor to...`)
- Limit the first line to 72 characters or less
- Long-form commit bodies after the message are encouraged for any
kind of clarification (provided you're using a Git GUI, then this
would be accomplished by using two carriage returns in the spot
where you would be writing your commit message)

### JavaScript style guide
This section is mostly TBD, but here are a few guidelines that fall
in line with basic ESLint.
- Ensure lines are less than 100 characters in length
- Two spaces are preferred.
- JavaScript files should have a blank line at the end.

### Using React: single files
Since this library is using React v16 and up, we are using some of
the new React API features. So the following is of utmost importance
in order to ensure proper functionality:

#### The most important rule
Higher order components **must** use [`React.forwardRef` API](https://reactjs.org/docs/forwarding-refs.html).
Please check out the `withPlatformConsumer` in `cdk/platform/Platform.js`
as an example for how you can structure your higher order components.

#### Declaring state in components
The following are of relatively less importance, but still considered
necessities rather than suggestions. Declare state in the `constructor(){ }`
rather than as a root level property:
```javascript
// Prefer
class ExampleComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      count: 0,
    };
  }
}

// instead of
class ExampleComponent extends React.Component {
  state = {
    count: 0,
  };
}
```

#### Arrow functions as methods
Wherever possible, prefer using arrow functions for methods rather
than "full" functions with constructor bindings. Exceptions to this
rule include lifecycle methods and the `render` method.
```javascript
// Prefer
class ExampleComponent extends React.Component {
  // ...
  togglePanel = () => {
    this.setState(state => ({
      panelOpen: !state.panelOpen,
    }));
  }
}

// instead of
class ExampleComponent extends React.Component {
  constructor() {
    super();
    
    this.togglePanel = this.togglePanel.bind(this);
  }
  
  togglePanel() {
    this.setState(state => ({
      panelOpen: !state.panelOpen,
    }));
  }
}
```

#### Method types and order within the component
Methods can be (so far) categorized into four (five) different types, and
should be presented in the following order:
- Lifecycle like `componentDidMount` and others
- (To a limited extent, refs, but see [the section below](#refs))
- Derived data like `getPanelIsOpen`
- Actions like `toggleDisabled`
- Renderers like `renderFormFieldLabel`
```javascript
class ExampleComponent extends React.Component {
  /**
   * Lifecycle
   */
  componentDidMount() {
    this.setupListeners();
  }
  
  /**
   * Derived data
   */
  hasResizeListeners = () => this.state.listeners.length > 0;
  
  /**
   * Actions
   */
  add = () => { /* ... */ };
  
  /**
   * Renderers
   */
  renderListenerCount = () => { /* ... */ };
}
```
**Note**: this forced ordering of component methods is in opposition
to one of the ESLint [`sort-comp` rule](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/sort-comp.md),
which may be why ESLint hasn't been incorporated just yet.

#### Method naming
Method names should accurately, but tersely, describe what they do.
Provide rich naming instead of mimicking the name of the listener
that it might be attached to, for instance.
```javascript
// Opt for something like this
render = () => <div onClick={this.emitInteractionEvent} />

// Rather than this
render = () => <div onClick={this.onClick} />
```

#### Private methods
This library makes heavy use of context as well as refs, so
some flavor of "revealing module" is expected when other
components can access the methods of their ref children. That
brings up the question of private methods. The usage of
publicly visible methods, but declared with an underscore is
discouraged. Instead, private methods should be declared **after
the default export as full functions**:
```javascript
class ExampleComponent extends React.Component {
  componentDidMount() {
    privateMethod.call(this);
  }
}

export default ExampleComponent;

/**
 * Private methods
 */
/**
 * This method won't be exposed when declaring ExampleComponent
 * like the following:
 * 
 * render = () => (
 *   <ExampleComponent ref={this.EXAMPLE} />
 * )
 * // Later on
 * this.EXAMPLE.current.privateMethod()
 * // Error: privateMethod is not a function, which means the
 * // parent can't access it. That is intended! It is private for
 * // a reason
 */
function privateMethod() {
  // ...
}
```

#### Refs
Prefer to use the new `React.createRef` method instead of using
callback functions. Use callback functions if you are registering
the element as part of a contextual listener. This will make more
sense once you are working with CDK components, and you have global
listeners on the window that depend on which elements you are
monitoring.
```javascript
class ExampleComponent extends React.Component {
  /**
   * Refs
   */
  getDiv = (el) => {
    this.EL = el;
    if (el) {
      /*
      Important action that requires the element immediately
      when it is set up in the DOM.
       */
      this.props.__focusMonitor.monitor({
        element: el,
        callback: () => { /* ... */ },
      });
    }
  }
  
  /**
   * Renderers
   */
  render = () => (
    <div ref={this.getDiv} />
  );
}
```

Specific to naming the refs, please use the following guidelines:
```javascript
// If the ref points to a DOM element, please name it like EL
this.EL = React.createRef();
// If the ref points to a React component, feel free to name it
// anything that makes sense
this.keyManager = React.createRef();
// Later on
render = () => (
  <React.Fragment>
    <ListKeyManager ref={this.keyManager} />
    <div ref={this.EL} />
  </React.Fragment>
)
```

#### Prop types
`prop-types` usage is mandatory. However, the usage for prop types
is a bit different when it comes to Signature UI. This is because
we have several higher order components that add props of their own
via context.

Higher order components that inject props via context (similar to the
`connect` helper in `react-redux`) are prefixed with double
underscores, like `this.props.__focusMonitor` or `this.props.__platform`.
These props should _not_ be visible by the consumer, and in some
IDEs, like in WebStorm, text autocomplete can reveal some of the
behind-the-scenes props—not good!

How do we circumvent this? We do that by declaring both prop types
and default props as variables and then using the `...` spread operator
where necessary. Consider the following:
```javascript
class Example extends React.Component {}

/** Declare prop types, default props as a variable */
const ExamplePropTypes = {
  disabled: PropTypes.bool,
  onAdd: PropTypes.func,
};

const ExampleDefaultProps = {
  disabled: false,
  onAdd: _.noop,
};

/** 
 * Use the spread operator and add any additional context types
 * Now your IDE can smartly see `__platform` as a recognized
 * prop type within this component.
 */
Example.propTypes = {
  ...ExamplePropTypes,
  __platform: PlatformPropTypes,
};

Example.defaultProps = {
  ...ExampleDefaultProps,
  __platform: PlatformDefaultProps,
};

/** Wrap your component with HOC decorators */
const StackedExample = withPlatformConsumer(Example);

/** 
 * Declare the base prop types on the wrapped component so
 * that when consuming this component, IDEs can smartly detect
 * which props can be applied without exposing internal
 * props like `__platform`.
 */
StackedExample.propTypes = ExamplePropTypes;
StackedExample.defaultProps = ExampleDefaultProps;

export default StackedExample;
```

#### Named exports
Prefer withholding the default export until the very end. This is
especially useful for when you are adding multiple higher
order components together. Also, see the [prop types](#prop-types)
section for more information about why this is necessary.

When declaring named exports that do _not_ have higher order
components, feel free to `export default ExampleComponent;`.
However, when you are using multiple components, save the wrapped
component as `const Stacked__ = ...` and then finally exporting
the named constant:
```javascript
class Table extends React.Component {}

/** Convenience function `stack` is available in `lib/core/components/util.js` */
const StackedTable = stack(
  higherOrderComponentWrapper1,
  higherOrderComponentWrapper2,
)(Table);

export default StackedTable;
```

### Using React: folder-level view
Here are some guidelines for handling multiple React components,
context types, and other things.

#### Folder basics
- Folder names are in lowercase kebab-case (`form-field/`)
- Component names are in PascalCase (`form-field/FormField.js`)
- [Styles and theming](#styles-and-theme) are in a styles
subfolder (`form-field/styles/`)
- Context types are in a context subfolder (`/form-field/context/`)

In addition, there is an `exports.js` file and an `index.js` file.
All index files are identical with this line:
```javascript
// index.js
export * from './exports';
```

And as you can imagine, every `exports.js` file has a list of
top-level exports that can be publicly consumed.
```javascript
// form-field/exports.js
export { default as FormField } from './FormField';
export * from './context/FormFieldContext';
export { default as Hint } from './Hint';
export { default as Prefix } from './Prefix';
export { default as Suffix } from './Suffix';
export { default as Label } from './Label';
```

That way, client-side consumers can simply import as follows:
```javascript
import { FormField, Hint, Label } from '../lib/form-field';
```

### Styles and theme
This repository uses [Styled Components](https://www.styled-components.com/) for the styling decisions.
Please look (at the very least) at v3 or v4 documentation to get
a grasp of some of the more clever ways to use Styled Components.
The most important ones to know in order to understand and contribute
are the following:
- [Nested CSS rules](https://www.styled-components.com/docs/faqs#can-i-nest-rules)
(see a short primer on LESS, SCSS, or SASS)
- [Referring to other styled components](https://www.styled-components.com/docs/advanced#referring-to-other-components)

#### Folder structure
Following Angular Material, we differentiate styling from theming.
Theming may be considered a component's colors and fonts. Styling
would be considered anything else; that would include borders and
margins, spacings, height and width, flex, outlines, etc.

For components, the root level folder should include a `styles/`
folder. The naming convention would be, `styles/index` would include
the styling and `styles/theme` would include the theme.

For richer, more complex components like the form field, where there's
more than one type of appearance, this paradigm can be extended 
by suffixing `-theme` or `-style` (but since that only really 
occurs once, this rule is subject to change).

#### Style naming
Root level components are named with the suffix `-Root`. Angular
Material attaches the decorator-level listeners, ARIA roles, and
classes/styles here. When looking at Angular template HTML files,
that DOM tree is the direct child of the `-Root` component. So if
you're translating an Angular component, this is a rough guidelines
for how the React render tree should eventually look:
```javascript
// some-angular-component.js
@Component({
 // ...
 '[attr.disabled]': '_disabled || null',
 // ...
})
class Whatever {}

// some-angular-component.html
<div (click)="_handleClick">...</div>

// In React in Signature UI, this translates to...
render = () => {
  return (
   <SomeReactComponentRoot
     disabled={this.getDisabled() || null}
   >
     <div onClick={this.handleClick}>
       ...
     </div>
   </SomeReactComponentRoot>
  );
};
```

#### Prefer using data-attributes instead of props for styled components
This makes it easier for testing since we can use `querySelect` for
data-attributes to see if they are present or not. Also omit
quotation marks or double quotation marks for data attributes
in the styled component (`[data-disabled=true]` rather than `[data-disabled="true"]`).

For your component:
```javascript
// Prefer
render() {
  return (
    <ComponentRoot data-disabled={this.getDisabled()} />
  );
}

// Rather than this
render() {
  return (
    <ComponentRoot isDisabled={this.getDisabled()} />
  )
}
```

For the styled component:
```javascript
export const ComponentRoot = styled.div`
// Prefer this
&[data-disabled=true] { ... }

// Rather than this
${props => props.isDisabled ? '...' : ''}
`;
```

#### Integrating style and themes together in the root
Since theming is stacked in CSS, and redundant rules are valid,
we integrate the theme as a thunk (a _thunk_ is basically a function
that performs an operation later).

When writing theme files, they typically take the following structure:
```javascript
// styles/theme.js
const tableThemeThunk = (components) => {
  const {
    TableRow,
    TableCell,
  } = components;
  
  return css`
  ${TableRow} { // table row theming, colors }
  ${TableCell} { // table cell theming, colors }
  `;
}

// styles/index.js
const components = {
  TableRow: TableRow,
  TableCell: TableCell,
};

/**
 * Now, tableThemeThunk injects the styling automatically
 * based on the components that are provided. Note in the
 * above, that components.TableRow is just a variable.
 * In styles/theme.js, it does not refer to anything
 * in styles/index.js in order to prevent circular imports.
 */
export const TableRoot = styled.div`
// table root styling
${tableThemeThunk(components)}
`;
```

This structure is preferred because traditional CSS classes can
be redundant and can offer the same styling. Unfortunately,
when you declare a styled component, it's set for life. In order
for `styles/index.js` to import the theme, and for `styles/theme.js`
to refer to components, we must do this hacky way to prevent
circular imports.

Of course, this limitation can be obviated by declaring a `styles/index.js`
file as the root file while having separate `styles/style.js` and `styles/theme.js`
files. That could be up for discussion.
