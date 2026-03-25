import React, { useState } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-text dark:text-text-dark mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-surface dark:bg-surface-dark text-text dark:text-text-dark rounded-card px-4 py-3 text-base ${isFocused ? 'border-2 border-primary' : 'border-2 border-transparent'} ${error ? 'border-2 border-status-error' : ''} ${className}`}
        placeholderTextColor="#8E8A9A"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text className="text-xs text-status-error mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
