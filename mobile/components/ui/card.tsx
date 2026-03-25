import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = true, className = '', ...props }: CardProps) {
  return (
    <View
      className={`bg-surface dark:bg-surface-dark rounded-card p-4 ${elevated ? 'shadow-md shadow-primary/10' : ''} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
