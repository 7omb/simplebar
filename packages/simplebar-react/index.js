import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SimpleBarJS from 'simplebar/dist/simplebar-core.esm';

/* Deprecated
 * Hardcore this here until we can safely deprecated it.
 * Helper function to retrieve options from element attributes
 */
const getOptions = function(obj) {
  const options = Array.prototype.reduce.call(
    obj,
    (acc, attribute) => {
      const option = attribute.name.match(/data-simplebar-(.+)/);
      if (option) {
        const key = option[1].replace(/\W+(.)/g, (x, chr) => chr.toUpperCase());
        switch (attribute.value) {
          case 'true':
            acc[key] = true;
            break;
          case 'false':
            acc[key] = false;
            break;
          case undefined:
            acc[key] = true;
            break;
          default:
            acc[key] = attribute.value;
        }
      }
      return acc;
    },
    {}
  );
  return options;
};

export default function SimpleBar({
  children,
  className,
  style,
  scrollableNodeProps,
  ...otherProps
}) {
  const elRef = useRef('lol');
  const scrollableNodeRef = scrollableNodeProps.ref || useRef();
  const contentNodeRef = useRef();
  let options = {};
  let rest = {};
  let deprecatedOptions = [];

  Object.keys(otherProps).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(SimpleBarJS.defaultOptions, key)) {
      options[key] = otherProps[key];
    } else if (key.match(/data-simplebar-(.+)/)) {
      deprecatedOptions.push({
        name: key,
        value: otherProps[key]
      });
    } else {
      rest[key] = otherProps[key];
    }
  });

  if (deprecatedOptions.length) {
    console.warn(`simplebar-react: this way of passing options is deprecated. Pass it like normal props instead:
        'data-simplebar-auto-hide="false"' —> 'autoHide="false"'
      `);
  }

  useEffect(() => {
    if (elRef.current) {
      new SimpleBarJS(elRef.current, {
        ...getOptions(deprecatedOptions),
        ...options,
        ...(scrollableNodeRef.current && {
          scrollableNode: scrollableNodeRef.current
        }),
        ...(contentNodeRef.current && {
          contentNode: contentNodeRef.current
        })
      });
    }
  });

  return (
    <div ref={elRef} className={className} style={style} {...rest}>
      <div className="simplebar-wrapper">
        <div className="simplebar-height-auto-observer-wrapper">
          <div className="simplebar-height-auto-observer" />
        </div>
        <div className="simplebar-mask">
          <div className="simplebar-offset">
            {typeof children === 'function' ? (
              children({ scrollableNodeRef, contentNodeRef })
            ) : (
              <div
                {...scrollableNodeProps}
                className={`simplebar-content-wrapper${
                  scrollableNodeProps && scrollableNodeProps.className
                    ? ` ${scrollableNodeProps.className}`
                    : ''
                }`}
              >
                <div className="simplebar-content">{children}</div>
              </div>
            )}
          </div>
        </div>
        <div className="simplebar-placeholder" />
      </div>
      <div className="simplebar-track simplebar-horizontal">
        <div className="simplebar-scrollbar" />
      </div>
      <div className="simplebar-track simplebar-vertical">
        <div className="simplebar-scrollbar" />
      </div>
    </div>
  );
}

SimpleBar.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
  style: PropTypes.object,
  scrollableNodeProps: PropTypes.object
};
