# Dialog
The `<Dialog />` component lets users open a modal dialog. In comparison to Angular Material, the dialog is not a service; users can simply implement the dialog as part of their DOM tree as is.

```javascript
function ExampleComponent(props) {
  return (
    <Dialog
      open={props.showModal}
      onClose={props.toggleModal}
    >
      <DialogTitle>
        Dialog title
      </DialogTitle>
      <DialogContent>
        Scrollable dialog content
      </DialogContent>
      <DialogActions>
        Add a button or two here
      </DialogActions>
    </Dialog>
  );
}
```

## Accessibility
Thanks in part to the internal `<DialogManager />` component, accessibility concerns are automatically managed starting from when the first `<Dialog />` is opened until the last `<Dialog />` is closed.

## For developers
### Implementation
Its implementation is similar to how the `<Overlay />` component is managed: at the base of the consumer's tree is a `<DialogManager />` component where all of the dialogs are loosely managed. The dialog manager does not apply any special styles and just passes the children as is. There is a big difference, however. The `<DialogManager />` supports _nesting_. That means that if the consumer so wishes to open nested dialogs, they may do so. In React terms, that means that the `<DialogManager />` can also be nested further down the tree, whereas that is not supported  with the `<OverlayContainer />`.
 
### Accessibility
The `<DialogManager />` component applies `aria-hidden="true"` to all sibling components of the `<OverlayContainer />` when a dialog is open. That ensures that the rest of the DOM tree is invisible to screen readers, and the only consumable component is the dialog itself. This is invoked when the first `<Dialog />` component is added (using `this.props.__dialogManager.add` method) and is reversed when the last dialog component is removed (using `this.props.__dialogManager.remove` method).

In addition, focus is kept within the dialog using the `cdk/a11y/focus-trap/FocusTrap` helper. This ensures that the user will not be able to tab outside of the dialog when the dialog is open.
