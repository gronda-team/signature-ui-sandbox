# Inputs and Text Areas
The `<Input />` component is a single-point entry point that controls both native `<input>` and `<textarea>` controls. This control is meant to be used in conjunction with `<FormField />`.

```javascript
function ExampleComponent(props) {
  return (
    <FormField>
      <Input {...props} />
    </FormField>
  );
}
```

## For developers
### Implementation
Note that Signature UI does not export a separate `<TextArea />` component like it did in v1. The main reason is that Angular Material provided the behavior and functionality to their input fields in the form of a *directive*, which is not easily translatable into React.

The current implementation of the `<Input />` component rests on the prop `[as]`, which determines whether the underlying control is an `<input>` or a `<textarea>`. This is certainly a candidate for refactoring, since the only commonality between the two is perhaps their interaction with `FormField`; however, certain controls like `TagList` and `Autosize` are available for one form control or the other, and there exists very little overlap.
