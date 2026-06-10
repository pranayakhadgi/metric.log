import { useEffect, useState } from 'react';

export default function WeekSelector({ week, onChange }) {
  const [inputValue, setInputValue] = useState(week);

  useEffect(() => {
    setInputValue(week);
  }, [week]);

  const handlePrev = () => {
    // David changes (start)
    const newVal = Math.max(23, Number(week) - 1);
    // David changes (end)
    onChange(newVal);
  };

  const handleNext = () => {
    // David changes (start)
    const newVal = Math.min(32, Number(week) + 1);
    // David changes (end)
    onChange(newVal);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
  };

  const handleBlurOrSubmit = () => {
    let parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) {
      setInputValue(week);
      return;
    }
    // David changes (start)
    parsed = Math.min(Math.max(parsed, 23), 32);
    // David changes (end)
    setInputValue(parsed);
    onChange(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlurOrSubmit();
      e.target.blur();
    }
  };

  return (
    <div className="flex items-center space-x-1 font-mono select-none">
      <button
        onClick={handlePrev}
        // David changes (start)
        disabled={Number(week) <= 23}
        // David changes (end)
        className="w-10 h-10 border border-borderColor flex items-center justify-center text-textPrimary hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
      >
        &larr;
      </button>
      
      <div className="h-10 px-4 border-t border-b border-borderColor bg-surface flex items-center justify-center space-x-2 min-w-[140px]">
        <span className="text-textMuted uppercase text-xs">WEEK</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlurOrSubmit}
          onKeyDown={handleKeyDown}
          className="w-10 bg-transparent text-center text-textPrimary font-bold focus:outline-none border-b border-transparent focus:border-accent"
        />
      </div>

      <button
        onClick={handleNext}
        // David changes (start)
        disabled={Number(week) >= 32}
        // David changes (end)
        className="w-10 h-10 border border-borderColor flex items-center justify-center text-textPrimary hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
      >
        &rarr;
      </button>
    </div>
  );
}
