import { useState, useRef, useEffect, useCallback } from 'react';

export default function UserSearchInput({ users = [], onSelect, placeholder = 'Search by name or email...' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? users.filter((u) => {
        const q = query.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
    : users;

  const selectUser = useCallback((user) => {
    onSelect(user);
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(0);
  }, [onSelect]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightIndex]) selectUser(filtered[highlightIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current?.children[highlightIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  return (
    <div className="user-search" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        className="user-search__input"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && (
        <ul className="user-search__dropdown" ref={listRef} role="listbox">
          {filtered.length > 0 ? (
            filtered.map((u, i) => (
              <li
                key={u.id}
                role="option"
                aria-selected={i === highlightIndex}
                className={`user-search__option${i === highlightIndex ? ' user-search__option--highlighted' : ''}`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => { e.preventDefault(); selectUser(u); }}
              >
                <span className="user-search__option-name">{u.name}</span>
                <span className="user-search__option-email">{u.email}</span>
              </li>
            ))
          ) : (
            <li className="user-search__empty">No users found</li>
          )}
        </ul>
      )}
    </div>
  );
}
