import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface YearRangeFilterProps {
  value: [number, number];
  min: number;
  max: number;
  onChange: (value: [number, number]) => void;
}

const YearRangeFilter = ({ value, min, max, onChange }: YearRangeFilterProps) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [minInput, setMinInput] = useState<string>(value[0].toString());
  const [maxInput, setMaxInput] = useState<string>(value[1].toString());

  useEffect(() => {
    setLocalValue(value);
    setMinInput(value[0].toString());
    setMaxInput(value[1].toString());
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const range: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(range);
    setMinInput(range[0].toString());
    setMaxInput(range[1].toString());
    onChange(range);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
    const newMin = parseInt(e.target.value);
    if (!isNaN(newMin) && newMin >= min && newMin <= localValue[1]) {
      const newRange: [number, number] = [newMin, localValue[1]];
      setLocalValue(newRange);
      onChange(newRange);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
    const newMax = parseInt(e.target.value);
    if (!isNaN(newMax) && newMax <= max && newMax >= localValue[0]) {
      const newRange: [number, number] = [localValue[0], newMax];
      setLocalValue(newRange);
      onChange(newRange);
    }
  };

  return (
    <div className="space-y-4">
      <Slider
        value={localValue}
        min={min}
        max={max}
        step={1}
        onValueChange={handleSliderChange}
        className="mt-2"
      />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={minInput}
          onChange={handleMinInputChange}
          min={min}
          max={localValue[1]}
          className="w-24 h-8"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="number"
          value={maxInput}
          onChange={handleMaxInputChange}
          min={localValue[0]}
          max={max}
          className="w-24 h-8"
        />
      </div>
    </div>
  );
};

export default YearRangeFilter;