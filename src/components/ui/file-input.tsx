import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onFileChange?: (file: File | null) => void;
  buttonText?: string;
}

export function FileInput({ 
  id, 
  accept, 
  className = '', 
  onFileChange,
  buttonText = 'Escolher arquivo',
  ...props 
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : '');
    onFileChange?.(file);
    
    // Call the original onChange if provided
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        id={id}
        accept={accept}
        className="hidden"
        onChange={handleChange}
        {...props}
      />
      <div className="flex h-9 w-full items-center rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors hover:bg-gray-100">
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-2 rounded bg-[#003366] hover:bg-[#002244] px-3 py-1 text-xs text-white transition-colors"
        >
          <Upload size={14} />
          {buttonText}
        </button>
        <span className="ml-3 flex-1 truncate text-gray-600">
          {fileName || 'Nenhum arquivo selecionado'}
        </span>
      </div>
    </div>
  );
}
