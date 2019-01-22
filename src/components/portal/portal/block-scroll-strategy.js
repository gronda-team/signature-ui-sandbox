export default function applyBlockingScrollStrategy(props) {
  if (props.open) {
    const root = document.documentElement;
    // cache previous inline styles
    let previousScrollPosition;
    if (window === undefined) {
      previousScrollPosition =  { top: 0, left: 0 };
    } else {
      const documentRect = root.getBoundingClientRect();
  
      const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
        document.documentElement.scrollTop || 0;
  
      const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
        document.documentElement.scrollLeft || 0;
      previousScrollPosition = { top, left };
    }
    
    this.setState({
      previousScrollPosition,
      previousHtmlScrollStyle: { left: root.style.left || '', top: root.style.top || '' },
    }, () => {
      root.style.left = -previousScrollPosition.left + 'px';
      root.style.top = -previousScrollPosition.top + 'px';
      root.style.position = 'fixed';
      root.style.width = '100%';
    });
  } else {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlScrollBehavior = html.style['scrollBehavior'] || '';
    const previousBodyScrollBehavior = body.style['scrollBehavior'] || '';
  
  
    const { left, top } = this.state.previousHtmlScrollStyle;
    const { left: scrollLeft, top: scrollTop } = this.state.previousScrollPosition;
  
    html.style.left = left + 'px';
    html.style.top = top + 'px';
    html.style.position = 'unset';
    html.style.width = 'unset';
  
    // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
    // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
    html.style['scrollBehavior'] = body.style['scrollBehavior'] = 'auto';
  
    window.scroll(scrollLeft, scrollTop);
  
    html.style['scrollBehavior'] = previousHtmlScrollBehavior;
    body.style['scrollBehavior'] = previousBodyScrollBehavior;
  }
}