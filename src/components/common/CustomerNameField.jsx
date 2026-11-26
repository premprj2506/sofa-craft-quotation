import { useState } from 'react';
import {
  filterCustomerSuggestions,
  findExactCustomerByName,
} from '../../utils/customers';

export default function CustomerNameField({
  value,
  phoneValue,
  onChangeName,
  onChangePhone,
  savedCustomers = [],
  placeholder = 'e.g. રમેશભાઈ પટેલ',
}) {
  const [open, setOpen] = useState(false);

  const suggestions = filterCustomerSuggestions(value, savedCustomers, 6);
  const showDropdown = open && suggestions.length > 0;

  const handleInputChange = (e) => {
    const nextName = e.target.value;
    onChangeName(nextName);
    setOpen(true);

    if (!String(phoneValue || '').trim()) {
      const exact = findExactCustomerByName(nextName, savedCustomers);
      if (exact?.phone) {
        onChangePhone(exact.phone);
      }
    }
  };

  const handleSelectSuggestion = (cust) => {
    onChangeName(cust.name);
    if (cust.phone) {
      onChangePhone(cust.phone);
    }
    setOpen(false);
  };

  return (
    <div className="autocomplete-wrap">
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        onChange={handleInputChange}
      />
      {showDropdown && (
        <div className="autocomplete-menu" role="listbox">
          <div className="autocomplete-hint">અગાઉના ગ્રાહકો (Quick Fill)</div>
          {suggestions.map((cust) => (
            <button
              key={cust.key}
              type="button"
              className="autocomplete-option"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(cust);
              }}
            >
              <span className="autocomplete-name">{cust.name}</span>
              {cust.phone && (
                <span className="autocomplete-phone">{cust.phone}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
