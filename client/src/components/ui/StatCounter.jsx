import { useState, useEffect } from 'react';

export default function StatCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = Number(value) || 0;
    
    if (endValue === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out cubic: f(t) = 1 - (1-t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setCount(easeProgress * endValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  // Format number
  if (value % 1 === 0) {
    return <span>{Math.floor(count).toLocaleString()}</span>;
  } else {
    return <span>{count.toFixed(1)}</span>;
  }
}
