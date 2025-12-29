import { memo } from 'react';

const PrimaryButton = ({ onClick, children, disabled = false, className = '', title = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 ${className}`}
    >
      {children}
    </button>
  );
};

export default memo(PrimaryButton);
