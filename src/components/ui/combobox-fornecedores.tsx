import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '../../lib/utils';

export interface FornecedorOption {
  value: string;
  label: string;
  cnpj?: string;
  categoria?: string;
}

interface ComboboxFornecedoresProps {
  fornecedores: FornecedorOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxFornecedores({
  fornecedores,
  value,
  onValueChange,
  placeholder = "Selecione um fornecedor...",
  emptyMessage = "Nenhum fornecedor encontrado.",
  className,
  disabled = false
}: ComboboxFornecedoresProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Encontrar o fornecedor selecionado
  const selectedFornecedor = useMemo(() => {
    return fornecedores.find((fornecedor) => fornecedor.value === value);
  }, [fornecedores, value]);

  // Filtrar fornecedores pela busca (por nome ou CNPJ)
  const filteredFornecedores = useMemo(() => {
    if (!searchQuery) return fornecedores;

    const query = searchQuery.toLowerCase();
    return fornecedores.filter((fornecedor) => {
      const matchesLabel = fornecedor.label.toLowerCase().includes(query);
      const matchesCNPJ = fornecedor.cnpj?.replace(/[^\d]/g, '').includes(query.replace(/[^\d]/g, ''));
      return matchesLabel || matchesCNPJ;
    });
  }, [fornecedores, searchQuery]);

  const handleSelect = (currentValue: string) => {
    onValueChange(currentValue === value ? "" : currentValue);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-gray-500",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedFornecedor ? (
              <span className="flex items-center gap-2">
                <span className="truncate">{selectedFornecedor.label}</span>
                {selectedFornecedor.cnpj && (
                  <span className="text-xs text-gray-500">
                    {selectedFornecedor.cnpj}
                  </span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm text-gray-500">
            {emptyMessage}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredFornecedores.map((fornecedor) => (
              <CommandItem
                key={fornecedor.value}
                value={fornecedor.value}
                onSelect={() => handleSelect(fornecedor.value)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === fornecedor.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="truncate text-sm">{fornecedor.label}</span>
                  {fornecedor.cnpj && (
                    <span className="text-xs text-gray-500 truncate">
                      CNPJ: {fornecedor.cnpj}
                    </span>
                  )}
                  {fornecedor.categoria && (
                    <span className="text-xs text-gray-400 truncate">
                      {fornecedor.categoria}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}