import * as React from 'react';
import PropTypes from 'prop-types';
import { IconRoot } from './styles';
import { cleanupFontValue, splitIconName } from './util';
import { usePlatform } from '../../cdk/Platform';
import { IconContext } from './context';

/** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
const funcIriAttributes = [
  'clip-path',
  'color-profile',
  'src',
  'cursor',
  'fill',
  'filter',
  'marker',
  'marker-start',
  'marker-mid',
  'marker-end',
  'mask',
  'stroke'
];

/** Selector that can be used to find all elements that are using a `FuncIRI`. */
const funcIriAttributeSelector = funcIriAttributes.map(attr => `[${attr}]`).join(', ');

/** Regex that can be used to extract the id out of a FuncIRI. */
const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;

/**
 * Icon component to be used to handle SVG families.
 */
function Icon(props) {
  const {
    color, inline, mirrorInRtl, className, 'aria-hidden': ariaHidden, name, fontIcon: __fontIcon,
    fontSet: __fontSet, ...restProps
  } = props;

  const [innerHtml, setInnerHtml] = React.useState({ __html: '' });

  const fontIcon = React.useMemo(() => cleanupFontValue(__fontIcon), [__fontIcon]);
  const fontSet = React.useMemo(() => cleanupFontValue(__fontSet), [__fontSet]);

  const is = usePlatform();

  const registry = React.useContext(IconContext);

  /**
   * Location interface to return the current pathname.
   * @type {function(): string}
   */
  const getPathname = React.useCallback(() => {
    const location = is('browser') ? document.location : null;

    return location ? (location.pathname + location.search) : '';
  }, [is('browser')]);

  /**
   * Caches the children of an SVG element that have `url()`
   * references that we need to prefix with the current path.
   * @type {function(SVGElement): void}
   */
  const cacheChildrenWithExternalReferences = React.useCallback(
    /**
     * @param element {SVGElement}
     */
    (element) => {
      const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
      elementsWithExternalReferences.current = elementsWithExternalReferences.current || new Map();
      const elements = elementsWithExternalReferences.current;

      for (let i = 0; i < elementsWithFuncIri.length; i++) {
        const elementWithReference = elementsWithFuncIri[i];
        funcIriAttributes.forEach((attr) => {
          const value = elementWithReference.getAttribute(attr);
          const match = value ? value.match(funcIriPattern) : null;

          if (match) {
            let attributes = elements.get(elementWithReference);

            if (!attributes) {
              attributes = [];
              elements.set(elementWithReference, attributes);
            }

            attributes.push({ name: attr, value: match[1] });
          }
        });
      }
    },
    [],
  );

  /**
   * Prepends the current path to all elements that have an attribute pointing to a `FuncIRI`
   * reference. This is required because WebKit browsers require references to be prefixed with
   * the current path, if the page has a `base` tag.
   * @type {function(path: string): void}
   */

  const prependPathToReferences = React.useCallback(
    /**
     * @param path {string}
     */
    (path) => {
      const elements = elementsWithExternalReferences.current;

      if (elements) {
        elements.forEach((attrs, element) => {
          attrs.forEach((attr) => {
            element.setAttribute(attr.name, `url('${path}#${attr.value}')`);
          });
        });
      }
    },
    [],
  );

  /** @type {function(): void} */
  const clearSvgElement = React.useCallback(() => {
    const layoutElement = element.current;
    let childCount = layoutElement.childNodes.length;

    if (elementsWithExternalReferences.current) {
      elementsWithExternalReferences.current.clear();
    }

    // Remove existing non-element child nodes and SVGs, and add the new SVG element. Note that
    // we can't use innerHTML, because IE will throw if the element has a data binding.
    while (childCount--) {
      const child = layoutElement.childNodes[childCount];

      // 1 corresponds to Node.ELEMENT_NODE. We remove all non-element nodes in order to get rid
      // of any loose text nodes, as well as any SVG elements in order to remove any old icons.
      if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
        layoutElement.removeChild(child);
      }
    }
  }, []);

  /** @type {function(svg: SVGElement): void} */
  const setSvgElement = React.useCallback(
    /** @param svg {SVGElement} */
    (svg) => {
      const styleTags = svg.querySelectorAll('style');

      // Workaround for IE11 and Edge ignoring `style` tags inside dynamically-created SVGs.
      // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10898469/
      // Do this before inserting the element into the DOM, in order to avoid a style recalculation.
      for (let i = 0; i < styleTags.length; i++) {
        styleTags[i].textContent += '';
      }

      const pathname = getPathname();
      if (pathname !== '') {
        previousPath.current = pathname;
        cacheChildrenWithExternalReferences(svg);
        prependPathToReferences(pathname);
      }

      setInnerHtml({ __html: registry.serializer.serializeToString(svg) });
    },
    [cacheChildrenWithExternalReferences, prependPathToReferences, registry.serializer],
  );

  /** Previous path saved as a ref */
  const previousPath = React.useRef('');

  /**
   * Native HTML element
   * @type {React.MutableRefObject<Element>}
   */
  const element = React.useRef();

  /**
   * Keeps track of previous value of icon name
   * @type {React.MutableRefObject<string>}
   */
  const previousName = React.useRef(name);

  /**
   * Keeps track of the elements and attributes that we've prefixed with the current path.
   * @type {React.MutableRefObject<Map<Element, { name: string, value: string }[]>>}
   */
  const elementsWithExternalReferences = React.useRef(new Map());

  // The `notranslate` class prevents Google Translate from translating the web page in case
  // the icon set uses text-based ligatures as aliases for rendering font icons.
  const finalClassName = React.useMemo(() => (
    'notranslate' + className ? ` ${className}` : ''
  ), [className]);

  // Only update the inline SVG icon if the inputs changed to avoid unnecessary DOM operations.
  React.useEffect(() => {
    if (name) {
      previousName.current = name;
      const [namespace, iconName] = splitIconName(name);

      registry.getNamedSvgIcon(iconName, namespace)
        .then(setSvgElement)
        .catch((error) => {
          console.error(`Error retrieving icon ${namespace}:${iconName}! ${error.message}`);
        });
    } else if (previousName.current) {
      clearSvgElement();
    }
  }, [name, clearSvgElement, registry.getNamedSvgIcon, setSvgElement]);

  // Update cached element references upon every render
  React.useEffect(() => {
    const cachedElements = elementsWithExternalReferences.current;

    if (cachedElements && cachedElements.size) {
      const newPath = getPathname();

      // We need to check whether the URL has changed on each change detection since
      // the browser doesn't have an API that will let us react on link clicks and
      // we can't depend on the Angular router. The references need to be updated,
      // because while most browsers don't care whether the URL is correct after
      // the first render, Safari will break if the user navigates to a different
      // page and the SVG isn't re-rendered.
      if (newPath !== previousPath.current) {
        previousPath.current = newPath;
        prependPathToReferences(newPath);
      }
    }
  }, [getPathname, prependPathToReferences]);

  // Garbage collect any references in the Map object upon unmount.
  React.useEffect(() => {
    return () => {
      if (elementsWithExternalReferences.current) {
        elementsWithExternalReferences.current.clear();
      }
    };
  }, []);

  return (
    <IconRoot
      {...restProps}
      className={finalClassName}
      role="img"
      data-color={color}
      data-inline={inline}
      data-sui-icon-mirror-rtl={mirrorInRtl}
      ref={element}
      dangerouslySetInnerHTML={innerHtml}
    />
  )
}

Icon.propTypes = {
  /** Name of SVG icon */
  name: PropTypes.string,
  color: PropTypes.string,
  inline: PropTypes.bool,
  mirrorInRtl: PropTypes.bool,
  'aria-hidden': PropTypes.bool,
  fontSet: PropTypes.string,
  fontIcon: PropTypes.string,
};

Icon.defaultProps = {
  name: null,
  color: null,
  inline: false,
  mirrorInRtl: false,
  'aria-hidden': true,
};

export default Icon;
