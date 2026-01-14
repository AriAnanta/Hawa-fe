import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav className={`flex items-center text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={item.label} className="flex items-center">
            <a
              href={item.href || '#'}
              className={`transition-colors ${isLast ? 'text-gray-900 font-semibold' : 'hover:text-blue-600'}`}
              onClick={(e) => {
                if (item.href?.startsWith('#')) {
                  e.preventDefault();
                  window.location.hash = item.href;
                }
              }}
            >
              {item.label}
            </a>
            {!isLast && <ChevronRight size={14} className="mx-2 text-gray-400" />}
          </div>
        );
      })}
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string
    })
  ),
  className: PropTypes.string
};





