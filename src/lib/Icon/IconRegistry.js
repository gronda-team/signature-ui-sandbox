import * as React from 'react';
import PropTypes from 'prop-types';
import fetchPonyfill from 'fetch-ponyfill';
import { sanitizeUrl } from '@braintree/sanitize-url';
import DOMPurify from 'dompurify';
import { cloneSvg, iconKey } from './util';
import { IconContext } from './context';
import { usePlatform } from '../../cdk/Platform';

/**
 * @typedef {Object} IconOptions
 * @property {string} [viewBox] View box to set on the icon.
 */

/**
 * @typedef {Object} SvgIconConfig
 * @property url {?string}
 * @property svgElement {?SVGElement}
 * @property [options] {IconOptions}
 */

/**
 * Isomorphic fetch implementation that doesn't overwrite the browser global.
 */
const { fetch: __fetch } = fetchPonyfill();

export function nameNotFoundError(name) {
  return new Error(`Unable to find icon with the name "${name}"`);
}

export function failedToSanitizeUrlError(url) {
  return new Error(
    'The URL provided was not trusted as a safe resource URL. The ' +
    `attempted URL was "${url}".`,
  );
}

/**
 * Icon component to be used to handle SVG families.
 */
function IconRegistry({ children }) {
  const is = usePlatform();
  // Initialize serializer
  const serializer = React.useMemo(() => {
    if (is('browser') && window && window.XMLSerializer) return new window.XMLSerializer();
    return { serializeToString: () => '' };
  }, [is('browser')]);
  /**
   * URLs and cached SVG elements for individual icons. Keys are of the format
   * "[namespace]:[icon]".
   * @type {React.MutableRefObject<Map<string, SvgIconConfig>>}
   */
  const svgIconConfigs = React.useRef(new Map());

  /**
   * SvgIconConfig objects and cached SVG elements for icon sets, keyed by namespace.
   * Multiple icon sets can be registered under the same namespace.
   * @type {React.MutableRefObject<Map<string, SvgIconConfig[]>>}
   */
  const iconSetConfigs = React.useRef(new Map());

  /**
   * Cache for icons loaded by direct URLs
   * @type {React.MutableRefObject<Map<string, SVGElement>>}
   */
  const cachedIconsByUrl = React.useRef(new Map());

  /**
   * In-progress icon fetches. Used to coalesce multiple requests to the same URL.
   * @type {React.MutableRefObject<Map<string, Promise.<string>>>}
   */
  const inProgressUrlFetches = React.useRef(new Map());

  /**
   * Map from font identifiers to their CSS class names. Used for icon fonts.
   * @type {React.MutableRefObject<Map<string, string>>}
   */
  const fontCssClassesByAlias = React.useRef(new Map());

  /** @type {function(namespace: string, config: SvgIconConfig): void} */
  const addSvgIconSetConfig = React.useCallback(
    /**
     * Registers an icon set config in the specified namespace.
     * @param namespace {string} Namespace in which to register the icon config.
     * @param config {SvgIconConfig} Config to be registered.
     */
    (namespace, config) => {
      const configNamespace = iconSetConfigs.current.get(namespace);

      if (configNamespace) {
        configNamespace.push(config);
      } else {
        iconSetConfigs.current.set(namespace, [config]);
      }
    },
    [],
  );

  /** @type {function(namespace: string, iconName: string, config: SvgIconConfig): void} */
  const addSvgIconConfig = React.useCallback(
    /**
     * Registers an icon config by name in the specified namespace.
     * @param namespace {string} Namespace in which to register the icon config.
     * @param iconName {string} Name under which to register the config.
     * @param config {SvgIconConfig} Config to be registered.
     */
    (namespace, iconName, config) => {
      svgIconConfigs.current.set(iconKey(namespace, iconName), config);
    },
    [],
  );

  /**
   * @type {function(url: ?string): PromiseLike}
   */
  const fetchUrl = React.useCallback(
    /**
     * Returns a Promise which produces the string contents of the given URL. Results may be
     * cached, so future calls with the same URL may not cause another HTTP request.
     * @param url {?string}
     * @return {Promise.<string>}
     */
    (url) => {
      if (url == null) {
        throw new Error(`Cannot fetch icon from URL "${url}".`);
      }

      const finalUrl = sanitizeUrl(url);

      if (finalUrl === 'about:blank') {
        throw failedToSanitizeUrlError(url);
      }

      const inProgressFetch = inProgressUrlFetches.current.get(finalUrl);

      if (inProgressFetch) return inProgressFetch;

      const request = __fetch(finalUrl, {
        method: 'get',
      }).then(response => response.text())
        .finally(() => {
          inProgressUrlFetches.current.delete(finalUrl);
        });

      inProgressUrlFetches.current.set(finalUrl, request);
      return request;
    },
    [],
  );

  const setSvgAttributes = React.useCallback(
    /**
     * Sets the default attributes for an SVG element to be used as an icon.
     * @param svg {SVGElement}
     * @param [options] {IconOptions}
     * @return SVGElement
     */
    (svg, options) => {
      svg.setAttribute('fit', '');
      svg.setAttribute('height', '100%');
      svg.setAttribute('width', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      // Disable IE11 default behavior to make SVGs focusable
      svg.setAttribute('focusable', 'false');

      if (options && options.viewBox) {
        svg.setAttribute('viewBox', options.viewBox);
      }

      return svg;
    },
    [],
  );

  const svgElementFromString = React.useCallback(
    /**
     * Creates a DOM element from the given SVG string.
     * @param string {string}
     */
    (string) => {
      const div = document.createElement('div');
      div.innerHTML = string;
      /** @type {SVGElement} */
      const svg = div.querySelector('svg');

      if (!svg) {
        throw new Error('<svg> tag not found');
      }

      return svg;
    },
    [],
  );

  const toSvgElement = React.useCallback(
    /**
     * Converts an element into an SVG node by cloning all of its children.
     * @param {Element} element
     * @return {SVGElement}
     */
    (element) => {
      const svg = svgElementFromString('<svg></svg>');
      const attributes = element.attributes;

      // Copy over all the attributes from the `symbol` to the new SVG, except the id.
      for (let i = 0; i < attributes.length; i++) {
        const { name, value } = attributes[i];

        if (name !== 'id') {
          svg.setAttribute(name, value);
        }
      }

      for (let i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].nodeType === document.ELEMENT_NODE) {
          svg.appendChild(element.childNodes[i].cloneNode(true));
        }
      }

      return svg;
    },
    [svgElementFromString]
  );

  const extractSvgIconFromSet = React.useCallback(
    /**
     * Searches the cached element of the given SvgIconConfig for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     * @param iconSet {SVGElement}
     * @param iconName {string}
     * @param [options] {IconOptions}
     * @return ?SVGElement
     */
    (iconSet, iconName, options) => {
      const iconSource = iconSet.querySelector(`[id="${iconName}"]`);

      if (!iconSource) return null;

      /** @type {Element} */
      const iconElement = iconSource.cloneNode(true);

      // Clone the element and remove the ID to prevent multiple elements from being added
      // to the page with the same ID.
      iconElement.removeAttribute('id');

      // If the icon node is itself an <svg> node, clone and return it directly. If not, set it as
      // the content of a new <svg> node.
      if (iconElement.nodeName.toLowerCase() === 'svg') {
        return setSvgAttributes(iconElement, options);
      }

      // If the node is a <symbol>, it won't be rendered so we have to convert it into <svg>. Note
      // that the same could be achieved by referring to it via <use href="#id">, however the <use>
      // tag is problematic on Firefox, because it needs to include the current page path.
      if (iconElement.nodeName.toLowerCase() === 'symbol') {
        return setSvgAttributes(toSvgElement(iconElement), options);
      }

      // createElement('SVG') doesn't work as expected; the DOM ends up with
      // the correct nodes, but the SVG content doesn't render. Instead we
      // have to create an empty SVG node using innerHTML and append its content.
      // Elements created using DOMParser.parseFromString have the same problem.
      // http://stackoverflow.com/questions/23003278/svg-innerhtml-in-firefox-can-not-display
      const svg = svgElementFromString('<svg></svg>');
      // Clone the node so we don't remove it from the parent icon set element.
      svg.appendChild(iconElement);

      return setSvgAttributes(svg, options);
    },
    [setSvgAttributes, toSvgElement, svgElementFromString],
  );

  const createSvgElementForSingleIcon = React.useCallback(
    /**
     * Creates a DOM element from the given SVG string, and adds default attributes.
     * @param {string} responseText
     * @param {IconOptions} [options]
     * @return SVGElement
     */
    (responseText, options) => {
      const svg = svgElementFromString(responseText);
      setSvgAttributes(svg, options);
      return svg;
    },
    [svgElementFromString, setSvgAttributes],
  );

  /** @type {function(config: SvgIconConfig): Promise.<SVGElement>} */
  const loadSvgIconSetFromConfig = React.useCallback(
    /**
     * Loads the content of the icon set URL specified in the SvgIconConfig and creates an SVG
     * element from it.
     * @param {SvgIconConfig} config
     * @return {Promise.<SVGElement>}
     */
    (config) => {
      if (config.svgElement) return Promise.resolve(config.svgElement);

      return fetchUrl(config.url)
        .then((responseText) => {
          // It is possible that the icon set was parsed and cached by an earlier request,
          // so parsing only needs to occur if the cache is yet unset.
          if (!config.svgElement) {
            config.svgElement = svgElementFromString(responseText);
          }

          return config.svgElement;
        });
    },
    [fetchUrl, svgElementFromString],
  );

  const loadSvgIconFromConfig = React.useCallback(
    /**
     * Loads the content of the icon URL specified in the SvgIconConfig and creates an SVG element
     * from it.
     * @param config {SvgIconConfig}
     * @return {Promise.<SVGElement>}
     */
    (config) => {
      return fetchUrl(config.url)
        .then(responseText => (
          createSvgElementForSingleIcon(responseText, config.options)
        ));
    },
    [fetchUrl, createSvgElementForSingleIcon],
  );

  /**
   * @type {function(iconName: string, iconSetConfigs: SvgIconConfig[]): ?SVGElement}
   */
  const extractIconWithNameFromAnySet = React.useCallback(
    /**
     * Searches the cached SVG elements for the given icon sets for a nested icon element whose "id"
     * tag matches the specified name. If found, copies the nested element to a new SVG element and
     * returns it. Returns null if no matching element is found.
     * @param iconName {string}
     * @param iconSetConfigs {SvgIconConfig[]}
     * @return ?SVGElement
     */
    (iconName, iconSetConfigs) => {
      // Iterate backwards, so icon sets added later have precedence.
      for (let i = iconSetConfigs.length - 1; i >= 0; i--) {
        const config = iconSetConfigs[i];
        if (config.svgElement) {
          const foundIcon = extractSvgIconFromSet(config.svgElement, iconName, config.options);

          if (foundIcon) return foundIcon;
        }
      }

      return null;
    },
    [extractSvgIconFromSet],
  );

  /** @type {function(name: string, iconSetConfigs: SvgIconConfig[]): Promise.<SVGElement>} */
  const getSvgFromIconSetConfigs = React.useCallback(
    /**
     * Attempts to find an icon with the specified name in any of the SVG icon sets.
     * First searches the available cached icons for a nested element with a matching name, and
     * if found copies the element to a new `<svg>` element. If not found, fetches all icon sets
     * that have not been cached, and searches again after all fetches are completed.
     * The returned Observable produces the SVG element if possible, and throws
     * an error if no icon with the specified name can be found.
     * @param name {string}
     * @param iconSetConfigs {SvgIconConfig[]}
     * @return Promise.<SVGElement>
     */
    (name, iconSetConfigs) => {
      // For all the icon set SVG elements we've fetched, see if any contain an icon with the
      // requested name.
      const namedIcon = extractIconWithNameFromAnySet(name, iconSetConfigs);

      // We could cache namedIcon in _svgIconConfigs, but since we have to make a copy every
      // time anyway, there's probably not much advantage compared to just always extracting
      // it from the icon set.
      if (namedIcon) return Promise.resolve(namedIcon);

      /**
       * Not found in any cached icon sets. If there are icon sets with URLs that we haven't
       * fetched, fetch them now and look for iconName in the results.
       * @type {Promise<SVGElement | null>[]}
       */
      const iconSetFetchRequests = iconSetConfigs
        .filter(iconSetConfig => !iconSetConfig.svgElement)
        .map(iconSetConfig => (
          loadSvgIconSetFromConfig(iconSetConfig)
            .catch((error) => {
              const finalUrl = sanitizeUrl(iconSetConfig.url);

              // Swallow errors fetching individual URLs so the
              // combined Observable won't necessarily fail.
              const errorMessage = `Loading icon set URL: ${finalUrl} failed: ${error.message}`;
              console.error(errorMessage);

              return Promise.resolve(null);
            })
        ));

      // Fetch all the icon set URLs. When the requests complete, every IconSet should have a
      // cached SVG element (unless the request failed), and we can check again for the icon.
      return Promise.all(iconSetFetchRequests)
        .then(() => {
          const foundIcon = extractIconWithNameFromAnySet(name, iconSetConfigs);

          if (!foundIcon) throw nameNotFoundError(name);

          return foundIcon;
        });
    },
    [loadSvgIconSetFromConfig, extractIconWithNameFromAnySet],
  );

  /** @type {function(config: SvgIconConfig): Promise.<SVGElement>} */
  const getSvgFromConfig = React.useCallback(
    /**
     * Returns the cached icon for a SvgIconConfig if available, or fetches it from its URL if not.
     * @param config {SvgIconConfig}
     * @return Promise.<SVGElement>
     */
    (config) => {
      if (config.svgElement) {
        return Promise.resolve(cloneSvg(config.svgElement));
      }

      return loadSvgIconFromConfig(config)
        .then((svg) => {
          config.svgElement = svg;
          return cloneSvg(svg);
        });
    },
    [loadSvgIconFromConfig],
  );

  const getNamedSvgIcon = React.useCallback(
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) with the given name
     * and namespace. The icon must have been previously registered with addIcon or addIconSet;
     * if not, the Observable will throw an error.
     *
     * @param name {string} Name of the icon to be retrieved.
     * @param namespace {string} Namespace in which to look for the icon.
     * @return {Promise.<SVGElement>}
     */
    async (name, namespace) => {
      return await new Promise((resolve, reject) => {
        window.requestAnimationFrame(() => {
          const key = iconKey(namespace, name);
          const config = svgIconConfigs.current.get(key);

          if (config) resolve(getSvgFromConfig(config));

          const configs = iconSetConfigs.current.get(namespace);

          if (configs) resolve(getSvgFromIconSetConfigs(name, configs));

          return reject(nameNotFoundError(key));
        });
      });
    },
    [getSvgFromConfig, getSvgFromIconSetConfigs],
  );

  /** @type {function(url: string): Promise.<SVGElement>} */
  const getSvgIconFromUrl = React.useCallback(
    /**
     * Returns an Observable that produces the icon (as an `<svg>` DOM element) from the given URL.
     * The response from the URL may be cached so this will not always cause an HTTP request, but
     * the produced element will always be a new copy of the originally fetched icon. (That is,
     * it will not contain any modifications made to elements previously returned).
     *
     * @param url {string} URL from which to fetch the SVG icon.
     * @return {Promise.<SVGElement>}
     */
    (url) => {
      const finalUrl = sanitizeUrl(url);

      if (finalUrl === 'about:blank') throw failedToSanitizeUrlError(url);

      const cachedIcon = cachedIconsByUrl.current.get(finalUrl);

      if (cachedIcon) return Promise.resolve(cloneSvg(cachedIcon));

      return loadSvgIconFromConfig({ url })
        .then((svg) => {
          cachedIconsByUrl.current.set(finalUrl, svg);
          return cloneSvg(svg);
        });
    },
    [loadSvgIconFromConfig],
  );

  /**
   * @type {function(namespace: string, iconName: string, url: string, options?: IconOptions): void}
   */
  const addSvgIconInNamespace = React.useCallback(
    /**
     * Registers an icon by URL in the specified namespace.
     * @param namespace {string} Namespace in which the icon should be registered.
     * @param iconName {string} Name under which the icon should be registered.
     * @param url {string} Resource URL
     * @param [options] {IconOptions}
     */
    (namespace, iconName, url, options) => {
      addSvgIconConfig(namespace, iconName, { url, options });
    },
    [addSvgIconConfig],
  );

  /** @type {
   *   function(namespace: string, iconName: string, literal: string, options?: IconOptions): void
   * } */
  const addSvgIconLiteralInNamespace = React.useCallback(
    /**
     * Registers an icon using an HTML string in the specified namespace.
     * @param namespace Namespace in which the icon should be registered.
     * @param iconName Name under which the icon should be registered.
     * @param literal SVG source of the icon.
     * @param [options] {IconOptions}
     */
    (namespace, iconName, literal, options) => {
      const sanitizedLiteral = DOMPurify.sanitize(literal);

      const svgElement = createSvgElementForSingleIcon(sanitizedLiteral, options);

      addSvgIconConfig(namespace, iconName, { options, svgElement });
    },
    [createSvgElementForSingleIcon, addSvgIconConfig],
  );

  /** @type {function(iconName: string, url: string): void} */
  const addSvgIcon = React.useCallback(
    /**
     * Registers an icon by URL in the default namespace.
     * @param iconName {string} Name under which the icon should be registered.
     * @param url {string}
     * @param [options] {IconOptions}
     */
    (iconName, url, options) => {
      addSvgIconInNamespace('', iconName, url, options);
    },
    [addSvgIconInNamespace],
  );

  /** @type {function(iconName: string, literal: string, options?: IconOptions): void} */
  const addSvgIconLiteral = React.useCallback(
    /**
     * Registers an icon using an HTML string in the default namespace.
     * @param iconName {string} Name under which the icon should be registered.
     * @param literal {string} SVG source of the icon.
     * @param [options] {IconOptions}
     */
    (iconName, literal, options) => {
      addSvgIconLiteralInNamespace('', iconName, literal, options);
    },
    [addSvgIconLiteralInNamespace],
  );

  const addSvgIconSetInNamespace = React.useCallback(
    /**
     * Registers an icon set by URL in the specified namespace.
     * @param namespace {string} Namespace in which to register the icon set.
     * @param url {string}
     * @param [options] {IconOptions}
     */
    (namespace, url, options) => {
      addSvgIconSetConfig(namespace, { url, options });
    },
    [addSvgIconSetConfig],
  );

  /** @type {function(url: string, options?: IconOptions): void} */
  const addSvgIconSet = React.useCallback(
    /**
     * Registers an icon set by URL in the default namespace.
     * @param url {string}
     * @param [options] {IconOptions}
     */
    (url, options) => {
      addSvgIconSetInNamespace('', url, options);
    },
    [addSvgIconSetInNamespace],
  );

  /** @type {function(namespace: string, literal: string, options?: IconOptions): void} */
  const addSvgIconSetLiteralInNamespace = React.useCallback(
    /**
     * Registers an icon set using an HTML string in the specified namespace.
     * @param namespace Namespace in which to register the icon set.
     * @param literal SVG source of the icon set.
     * @param [options] {IconOptions}
     */
    (namespace, literal, options) => {
      const sanitizedLiteral = DOMPurify.sanitize(literal);

      const svgElement = svgElementFromString(sanitizedLiteral);
      addSvgIconSetConfig(namespace, { svgElement, options });
    },
    [svgElementFromString, addSvgIconSetConfig],
  );

  /** @type {function(literal: string, options?: IconOptions): void} */
  const addSvgIconSetLiteral = React.useCallback(
    /**
     * Registers an icon set using an HTML string in the default namespace.
     * @param literal {string} SVG source of the icon set.
     * @param [options] {IconOptions}
     */
    (literal, options) => {
      addSvgIconSetLiteralInNamespace('', literal, options);
    },
    [addSvgIconSetLiteralInNamespace],
  );

  const registerFontClassAlias = React.useCallback(
    () => {},
    [],
  );

  const classNameForFontAlias = React.useCallback(
    () => {},
    [],
  );

  const setDefaultFontSetClass = React.useCallback(
    () => {},
    [],
  );

  const getDefaultFontSetClass = React.useCallback(
    () => {},
    [],
  );

  React.useEffect(() => {
    return () => {
      // Garbage collect all keys for the maps.
      svgIconConfigs.current.clear();
      iconSetConfigs.current.clear();
      cachedIconsByUrl.current.clear();
    };
  }, []);

  const provide = React.useMemo(() => ({
    serializer,
    addSvgIcon,
    addSvgIconLiteral,
    addSvgIconInNamespace,
    addSvgIconLiteralInNamespace,
    addSvgIconSet,
    addSvgIconSetLiteral,
    addSvgIconSetInNamespace,
    addSvgIconSetLiteralInNamespace,
    registerFontClassAlias,
    classNameForFontAlias,
    setDefaultFontSetClass,
    getDefaultFontSetClass,
    getSvgIconFromUrl,
    getNamedSvgIcon,
  }), [
    serializer,
    addSvgIcon,
    addSvgIconLiteral,
    addSvgIconInNamespace,
    addSvgIconLiteralInNamespace,
    addSvgIconSet,
    addSvgIconSetLiteral,
    addSvgIconSetInNamespace,
    addSvgIconSetLiteralInNamespace,
    registerFontClassAlias,
    classNameForFontAlias,
    setDefaultFontSetClass,
    getDefaultFontSetClass,
    getSvgIconFromUrl,
    getNamedSvgIcon,
  ]);

  return (
    <IconContext.Provider value={provide}>{ children }</IconContext.Provider>
  );
}

IconRegistry.propTypes = {
  children: PropTypes.node,
};

IconRegistry.defaultProps = {
  children: null,
};

export default IconRegistry;
