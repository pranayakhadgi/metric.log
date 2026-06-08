import { useEffect, useState } from 'react';

export default function WeekSelector({ week, onChange }) {
  const [inputValue, setInputValue] = useState(week);

  useEffect(() => {
    setInputValue(week);
  }, [week]);

  const handlePrev = () => {
    const newVal = Math.max(1, Number(week) - 1);
    onChange(newVal);
  };

  const handleNext = () => {
    const newVal = Math.min(52, Number(week) + 1);
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
    parsed = Math.min(Math.max(parsed, 1), 52);
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
        disabled={Number(week) <= 1}
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
        disabled={Number(week) >= 52}
        className="w-10 h-10 border border-borderColor flex items-center justify-center text-textPrimary hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-150"
      >
        &rarr;
      </button>
    </div>
  );
}
